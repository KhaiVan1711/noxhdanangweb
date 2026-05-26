import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
let lastUsedApiKey: string | undefined = undefined;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!aiClient || lastUsedApiKey !== apiKey) {
    lastUsedApiKey = apiKey;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API routes first
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ai = getAIClient();
    
    const systemInstruction = `
Bạn là NOXH Bot, một Trợ lý ảo cực kỳ am hiểu và tận tụy của Cổng Tra cứu Nhà ở Xã hội (NOXH) Thành phố Đà Nẵng, do Sở Xây dựng thành phố vận hành.
Nhiệm vụ của bạn là giải đáp mọi thắc mắc của người dân về nhà ở xã hội một cách trung thực, rõ ràng, giàu tính nhân văn và ấm áp.

Thông tin về điều kiện được mua/thuê NOXH:
1. Đối tượng: Công chức, quân nhân, người lao động tại KCN, người thu nhập thấp hoặc hộ nghèo đô thị tại Đà Nẵng chưa có nhà ở đứng tên.
2. Điều kiện cư trú: Khách hàng cần có đăng ký thường trú hoặc tạm trú tại TP. Đà Nẵng từ 1 năm trở lên, đồng thời đóng Bảo hiểm Xã hội (BHXH) tỉnh Đà Nẵng tối thiểu 1 năm.
3. Điều kiện thu nhập: Tổng thu nhập gia đình không thuộc diện nộp thuế thu nhập cá nhân thường xuyên.
4. Điều kiện nhà ở: Tất cả các thành viên trong hộ khẩu chưa đứng tên trên sổ hồng hay có quyền sở hữu nhà tại Đà Nẵng, diện tích trung bình dưới 10m²/người.

Thông tin các dự án hỗ trợ (thuộc hành chính cấp Phường Xã số hóa mới):
- "NOXH Khu công nghiệp Hòa Khánh" (Phường Hòa Khánh Bắc): Giá ~9.4tr/m², tiến độ 80%, đang thu nhận hồ sơ.
- "The Ori Garden Bàu Tràm" (Phường Hòa Hiệp Nam): Giá ~12.5tr/m², tiến độ 40%, chuẩn bị mở bán giai đoạn tiếp theo.
- "Chung cư xã hội Khu Nam Cầu Tuyên Sơn" (Phường Khuê Mỹ): Giá ~14.2tr/m², tiến độ 90%, đang nhận hồ sơ đợt cuối.
- "NOXH An Phú Đông" (Phường Hòa Thọ Đông): Giá ~11.8tr/m², tiến độ 15%, khởi công chuẩn bị mở bán.
- "Chung cư thu nhập thấp Nại Hiên Đông" (Phường Nại Hiên Đông): Đã hết quỹ căn ngoại giao, hoàn thành bàn giao 100%.

Hãy xưng là "NOXH Bot", xưng hô lễ phép "Dạ chào anh/chị", "Dân cư". Luôn trả lời có cấu trúc Markdown chuyên nghiệp, rõ ràng từng ý bằng gạch đầu dòng. Cho lời khuyên hữu ích về thủ tục nộp giấy tờ (ví dụ Đơn 01, Đơn 03 xác nhận thực trạng nhà ở).
`;

    if (!process.env.GEMINI_API_KEY) {
      // Demo mode streaming simulation
      const demoResponse = `Dạ chào anh/chị! Hiện tại chatbot của Sở đang chạy ở chế độ mô phỏng trực tuyến (không có GEMINI_API_KEY). \n\nAnh/chị vui lòng cập nhật khóa API trong phần cấu hình hoặc trong bảng quản trị để dùng AI chính chủ nhé!\n\nDưới đây là thông tin tra cứu cập nhật 2026 cho anh/chị:\n\n- **Dự án Hòa Khánh** (Phường Hòa Khánh Bắc): Đang nhận hồ sơ, giá khoảng 9.4tr/m².\n- **The Ori Garden** (Phường Hòa Hiệp Nam): Sắp mở bán dòng sản phẩm NOXH chất lượng cao.\n- **Hồ sơ mua**: Phải chưa có nhà ở TP. Đà Nẵng, thường trú hoặc tạm trú trên 1 năm kèm tham gia BHXH đầy đủ tại Đà Nẵng.`;
      
      const words = demoResponse.split(" ");
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let promptContext = "";
    if (history && history.length > 0) {
      promptContext = history.slice(-6).map((h: any) => `${h.sender === "user" ? "Người dân" : "Trợ lý NOXH Bot"}: ${h.text}`).join("\n") + `\nNgười dân: ${message}`;
    } else {
      promptContext = message;
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: promptContext,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errText = `Dạ, chatbot hiện gặp lỗi kết nối với Google Gemini API.\n\n**Chi tiết lỗi từ hệ thống:**\n\`\`\`\n${error.message || error}\n\`\`\`\n\nVui lòng kiểm tra lại khóa API trong mục **Secrets** để kích hoạt trí tuệ nhân tạo nha!`;
    res.write(`data: ${JSON.stringify({ text: errText })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Google Photos Dynamic Background Image Resolver
let cachedHeroImage: string | null = null;
const FALLBACK_HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBwaHQxPL8wE7n0P-S5o6noejMX_782tx-fBGFeDWqPKD28JLI3zMiMI0FaZ6WtMbJsKj4PmRR22LFkHcChBWAkuwhzsONN6NENAuJzlY04oYSx7YrgR56rSsL3Q_3K3u4lR-tG6rGBfEl7Dmn3xsz_46gda4xC79cNrt54sOehUPphSaziSheIc9FBXz7jbKVwfG7JaQ76vTZX2A9cJsv6K5BLvjIkWpldRL7d73q4fVGQn76R7ymGo9Mcpf_RFf0sZYyyOHl6tUF89w";
const GOOGLE_PHOTOS_LINK = "https://photos.app.goo.gl/Hoz454CvAVf1tP4G8";

function resolveGooglePhotos(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const handleRequest = (currentUrl: string, depth = 0) => {
      if (depth > 5) {
        return reject(new Error("Too many redirects"));
      }

      const req = https.get(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          handleRequest(res.headers.location, depth + 1);
        } else if (res.statusCode === 200) {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
            if (data.length > 5 * 1024 * 1024) {
              req.destroy();
            }
          });
          res.on("end", () => {
            const ogImageMatch = data.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || 
                                 data.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
            if (ogImageMatch) {
              resolve(ogImageMatch[1]);
            } else {
              const lhMatch = data.match(/(https:\/\/lh\d+\.googleusercontent\.com\/[^\s"',]+)/);
              if (lhMatch) {
                resolve(lhMatch[1]);
              } else {
                reject(new Error("No image found in content"));
              }
            }
          });
        } else {
          reject(new Error(`Bad status: ${res.statusCode}`));
        }
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.setTimeout(4000, () => {
        req.destroy(new Error("Timeout during resolving"));
      });
    };

    handleRequest(url);
  });
}

function updateHeroImageCache() {
  resolveGooglePhotos(GOOGLE_PHOTOS_LINK)
    .then((url) => {
      console.log("[Hero Caching] Resolved beautiful custom banner successfully:", url);
      cachedHeroImage = url;
    })
    .catch((err) => {
      console.log("[Hero Caching] Resolution failed, but will retry:", err.message);
    });
}

// Perform initial lookup
updateHeroImageCache();
// Refresh every 30 minutes to bypass any asset expiration token issues from Google CDN
setInterval(updateHeroImageCache, 30 * 60 * 1000);

app.get("/api/hero-image", async (req, res) => {
  if (cachedHeroImage) {
    return res.redirect(cachedHeroImage);
  }
  try {
    const url = await resolveGooglePhotos(GOOGLE_PHOTOS_LINK);
    cachedHeroImage = url;
    return res.redirect(url);
  } catch (err: any) {
    console.error("[Hero Router] Error resolving immediately, redirecting to fallback:", err.message);
    return res.redirect(FALLBACK_HERO_IMAGE);
  }
});

// Database storage configurations
const DB_FILE = path.join(process.cwd(), "db_noxh.json");

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Lỗi đọc db_noxh.json, bắt đầu khởi tạo mặc định:", err);
  }
  return { projects: [], news: [], stats: [] };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Lỗi ghi db_noxh.json:", err);
    return false;
  }
}

// 1. Projects API Routes
app.get("/api/projects", (req, res) => {
  const db = readDb();
  res.json(db.projects || []);
});

app.post("/api/projects", (req, res) => {
  try {
    const db = readDb();
    if (!db.projects) db.projects = [];
    const item = req.body;
    
    if (!item.name) {
      return res.status(400).json({ error: "Tên dự án là bắt buộc" });
    }

    if (item.id) {
      // Edit existing
      const index = db.projects.findIndex((p: any) => p.id === item.id);
      if (index !== -1) {
        db.projects[index] = { ...db.projects[index], ...item };
      } else {
        db.projects.push(item);
      }
    } else {
      // New item
      item.id = "proj-" + Date.now();
      db.projects.push(item);
    }

    writeDb(db);
    res.json({ success: true, project: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    const db = readDb();
    if (!db.projects) db.projects = [];
    const id = req.params.id;
    db.projects = db.projects.filter((p: any) => p.id !== id);
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. News API Routes
app.get("/api/news", (req, res) => {
  const db = readDb();
  res.json(db.news || []);
});

app.post("/api/news", (req, res) => {
  try {
    const db = readDb();
    if (!db.news) db.news = [];
    const item = req.body;

    if (!item.title) {
      return res.status(400).json({ error: "Tiêu đề là bắt buộc" });
    }

    if (item.id) {
      const index = db.news.findIndex((n: any) => n.id === item.id);
      if (index !== -1) {
        db.news[index] = { ...db.news[index], ...item };
      } else {
        db.news.push(item);
      }
    } else {
      item.id = "news-" + Date.now();
      db.news.push(item);
    }

    writeDb(db);
    res.json({ success: true, article: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/news/:id", (req, res) => {
  try {
    const db = readDb();
    if (!db.news) db.news = [];
    db.news = db.news.filter((n: any) => n.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Stats API Routes
app.get("/api/stats", (req, res) => {
  const db = readDb();
  res.json(db.stats || []);
});

app.post("/api/stats", (req, res) => {
  try {
    const db = readDb();
    db.stats = req.body;
    writeDb(db);
    res.json({ success: true, stats: db.stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Force Reset API Route
app.post("/api/reset-all", (req, res) => {
  try {
    const defaultData = {
      projects: [
        {
          id: "hoa-khanh",
          name: "NOXH Khu công nghiệp Hòa Khánh",
          location: "Đường số 4, KCN Hòa Khánh, Liên Chiểu, Đà Nẵng",
          investor: "Công ty Cổ phần Địa ốc Xanh Sài Gòn Thuận Phước",
          status: "Đang nhận hồ sơ",
          price: "~9.4tr/m²",
          priceRaw: 9400000,
          progress: 80,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClHteteBIbuLZyM10AFJQ6Vm9yEguYn8Qs7clGFwM6zDxRP-74dGICejZqhjdCbHvRFksQ7ZphNCcoxaXJ9P5qUF5VroQL07ZCZtV7HuqWONejByAwAjX9AvX4xaa9HvIVYG20hOYS1i2jovOGFTeL0tBLDsijo14Nms_e0DzJQ-QhXLPy7k1ShHaz-chG18MXjpzfhxNAlA31LSzYF7OeSDG7T_31W67WWmMacR1OCZSSoGYCdEqnk1eXboXQjfmf82lLGsueeA",
          tag: "receiving",
          coordinates: { x: 35, y: 42 },
          lat: 16.07185,
          lng: 108.14777,
          districts: "Liên Chiểu",
          scale: "8 block chung cư cao từ 12-15 tầng với gần 2,000 căn hộ",
          types: "Căn hộ 1-2 phòng ngủ, diện tích từ 32m² đến 66m²",
          deadline: "Dự kiến bàn giao tháp tiếp theo vào Quý IV/2026",
          hotline: "(0236) 3789 123",
          requirements: [
            "Chưa sở hữu đất đai hoặc nhà ở tại Đà Nẵng",
            "Thu nhập không đóng thuế thu nhập cá nhân thường xuyên",
            "Có đăng ký thường trú hoặc tạm trú trên 1 năm kèm tham gia BHXH tại Đà Nẵng"
          ]
        },
        {
          id: "bau-tram",
          name: "The Ori Garden (Bàu Tràm)",
          location: "Khu đô thị xanh Bàu Tràm Lakeside, Liên Chiểu, Đà Nẵng",
          investor: "Công ty Cổ phần Đầu tư Sài Gòn - Đà Nẵng (SDI)",
          status: "Sắp mở bán",
          price: "~12.5tr/m²",
          priceRaw: 12500000,
          progress: 40,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7YJE3WIsO4fvd_AO7OmBTPkI-ZDWdiubJExkNJLnMq8VtNgUSoYxibQ5zVCTwfUs04KXiqd2_cbzbTdFeGFk4gLn2_AEc38-uBavo7ou3TT-qySuBE-1NU4kYvxRIYOxfPWAWjZYOl3P5AE-0H6mkQw9ardc8CyQF8OxjGV2tKx8OLe59A4-jri_C2yJPvLBRb7d7-mNOHdFilb8vvxmHE3usclVcwD9RmH4pqHbx1QEekC4cnd0bDh5ydfv9uaiy9H6rfPV_th8",
          tag: "coming_soon",
          coordinates: { x: 30, y: 48 },
          lat: 16.08889,
          lng: 108.14300,
          districts: "Liên Chiểu",
          scale: "Hơn 3,000 căn hộ chất lượng cao phong cách Nhật Bản với hệ sinh thái khép kín",
          types: "Căn hộ từ 35.3m² đến 70m² (Studio, 1 PN + 1, 2 PN, 3 PN)",
          deadline: "Dự kiến mở bán giai đoạn 2 vào tháng 8/2026",
          hotline: "(0236) 3999 888",
          requirements: [
            "Chưa từng đứng tên sở hữu đất nền hay nhà ở tại địa bàn TP. Đà Nẵng",
            "Là công nhân, viên chức, cán bộ hoặc người lao động tự do có thu nhập thấp dưới quy định",
            "Thủ tục đăng ký xét duyệt và tính điểm ưu tiên thông qua Sở Xây dựng Đà Nẵng"
          ]
        },
        {
          id: "nai-hien-dong",
          name: "Chung cư thu nhập thấp Nại Hiên Đông",
          location: "Phường Nại Hiên Đông, Sơn Trà, Đà Nẵng",
          investor: "Công ty Cổ phần Đầu tư và Phát triển Nhà Đà Nẵng",
          status: "Đã bàn giao",
          price: "Đã hết quỹ",
          priceRaw: 8500000,
          progress: 100,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASYE2FhNKpl8F_zuy1X8hjyLCbWY66kSKmP4q5ONDxLl9Y-NBt3D7omVwbuoxIhw7JxLEfR5oy9B7bm6c2JwS5FhWZr4DdQ334SJDw6Nd6wb_n0vv8owtIAdxmdQ4xtGO85QLmczzYV2k6IG6MXtHVEy_x3HQXI81W3mjQt52ym6uuWx2jMA2Ynz_aDLTxX73IVMTWPGZrFAw3GTTf5kyy2-OeDESxVFC1oBEPk779WUB38z6niHZOOCM9b-fvzjz6B8aIys3Vo5k",
          tag: "completed",
          coordinates: { x: 65, y: 32 },
          lat: 16.09631,
          lng: 108.23277,
          districts: "Sơn Trà",
          scale: "5 block chung cư cao từ 7-12 tầng phục vụ người có thu nhập thấp quận Sơn Trà",
          types: "Diện tích căn hộ trung bình từ 45m² đến 60m² rộng rãi",
          deadline: "Đã hoàn thành bàn giao và đi vào vận hành ổn định lâu dài",
          hotline: "(0236) 3111 222",
          requirements: [
            "Chính sách ưu tiên cho hộ nghèo giải tỏa tái định cư tại Sơn Trà",
            "Người dân thuộc diện chính sách được phê duyệt đặc biệt của thành phố",
            "Hiện được vận hành ổn định bởi Ban quản lý Nhà chung cư Đà Nẵng"
          ]
        },
        {
          id: "an-phu-dong",
          name: "NOXH An Phú Đông Cẩm Lệ",
          location: "Phường Hòa Thọ Đông, Cẩm Lệ, Đà Nẵng",
          investor: "Sở Xây dựng Đà Nẵng phối hợp Liên minh HTX",
          status: "Sắp mở bán",
          price: "~11.8tr/m²",
          priceRaw: 11800000,
          progress: 15,
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
          tag: "coming_soon",
          coordinates: { x: 45, y: 70 },
          lat: 16.01429,
          lng: 108.19634,
          districts: "Cẩm Lệ",
          scale: "Dự án gồm 2 tòa tháp hiện đại cao 15 tầng với khuôn viên xanh mát, bãi đỗ xe rộng rãi",
          types: "Diện tích từ 40m² đến 65m² (1-2 phòng ngủ, tối ưu ánh sáng tự nhiên)",
          deadline: "Dự kiến bàn giao vào Quý I/2028, nhận hồ sơ thẩm định trước tháng 12/2026",
          hotline: "(0236) 3888 777",
          requirements: [
            "Ưu tiên công chức, viên chức trẻ làm việc tại Trung tâm Hành chính quận Cẩm Lệ",
            "Hộ gia đình có hoàn cảnh khó khăn chưa sở hữu đất và tài sản gắn liền với đất tại TP. Đà Nẵng",
            "Nộp đơn đăng ký kèm giấy xác nhận nhà ở thông qua tổ dân phố và phường"
          ]
        },
        {
          id: "nam-cau-tuyen-son",
          name: "Chung cư Xã hội Nam Cầu Tuyên Sơn",
          location: "Khu đô thị Nam Cầu Tuyên Sơn, Ngũ Hành Sơn, Đà Nẵng",
          investor: "Tập đoàn Đầu tư Đất Xanh Miền Trung và thành phố",
          status: "Đang nhận hồ sơ",
          price: "~14.2tr/m²",
          priceRaw: 14200000,
          progress: 90,
          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
          tag: "receiving",
          coordinates: { x: 72, y: 55 },
          lat: 16.02708,
          lng: 108.23594,
          districts: "Ngũ Hành Sơn",
          scale: "Thiết kế thông minh lồng ghép khu thương mại nhỏ, công viên và nhà cộng đồng",
          types: "Căn hộ 2 phòng ngủ diện tích đa dạng từ 48m² - 68m²",
          deadline: "Bàn giao căn hộ đầu tiên vào tháng 10/2026, đợt nhận hồ sơ cuối kết thúc ngày 30/08/2026",
          hotline: "(0236) 3555 444",
          requirements: [
            "Người lao động cư trú tại quận Ngũ Hành Sơn hoặc giáp ranh Cẩm Lệ, Sơn Trà",
            "Có đóng bảo hiểm xã hội tại TP. Đà Nẵng tối thiểu 12 tháng liên tục",
            "Bảo đảm điều kiện thu nhập không thuộc đối tượng nộp thuế TNCN đóng tại địa phương"
          ]
        },
        {
          id: "lien-chieu-eco",
          name: "Nhà ở xã hội Eco Home Liên Chiểu",
          location: "Phường Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng",
          investor: "Tập đoàn đầu tư Địa ốc Eco Việt Nam",
          status: "Sắp mở bán",
          price: "~10.5tr/m²",
          priceRaw: 10500000,
          progress: 25,
          image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
          tag: "coming_soon",
          coordinates: { x: 25, y: 35 },
          lat: 16.07542,
          lng: 108.13689,
          districts: "Liên Chiểu",
          scale: "Khu chung cư phức hợp gồm 3 block căn hộ tiện nghi với hồ bơi và khu vui chơi ngoài trời cho bé",
          types: "Diện tích linh hoạt từ 45m² đến 62m² tinh tế, chuẩn xanh",
          deadline: "Dự kiến bàn giao tháp A vào Quý II/2027",
          hotline: "(0236) 3666 999",
          requirements: [
            "Người dân có hộ khẩu tại Liên Chiểu chưa sở hữu nhà",
            "Có thu nhập thực tế trung bình dưới 11 triệu đồng/tháng của cá nhân đăng ký",
            "Xem xét các điểm ưu tiên như đóng góp xã hội, gia đình chính sách hoặc hoàn cảnh đặc biệt"
          ]
        }
      ],
      news: [
        {
          id: "news-1",
          title: "Đà Nẵng công bố đề án phát triển 10.000 căn hộ nhà ở xã hội đến năm 2030",
          excerpt: "UBND thành phố vừa thông qua lộ trình phân bổ quỹ đất xây dựng định hướng chuỗi dự án trọng vùng tại quận Liên Chiểu, Cẩm Lệ, Ngũ Hành Sơn nhằm đảm bảo nơi an cư cho người lao động, gia đình cận nghèo địa phương.",
          content: "Chiều ngày 20/5/2026, UBND TP. Đà Nẵng đã chính thức ký duyệt Đề án quy hoạch tổng thể nhà ở xã hội (NOXH) giai đoạn 2026 - 2030. \n\nMục tiêu cụ thể của đề án là hoàn thiện xây dựng ít nhất 10.000 căn hộ chất lượng cao với các chính sách trợ giá hấp dẫn. Trong đó, tập trung khai thác đồng bộ các khu đô thị vệ tinh xung quanh khu công nghiệp Hòa Khánh, khu công nghệ cao Đà Nẵng và dọc theo các trục giao thông chính của thành phố.\n\nSở Xây dựng Đà Nẵng sẽ đóng vai trò chủ trì điều phối quỹ đất công, thực hiện đấu thầu chủ đầu tư công khai, minh bạch nhằm bảo đảm tiêu chuẩn an toàn kỹ thuật xây dựng và thời gian bàn bàn giao đúng hạn. Người dân thuộc diện độc thân thu nhập dưới 25 triệu/tháng hoặc đã kết hôn dưới 50 triệu/tháng sẽ được ưu tiên bốc thăm quỹ nhà đợt đầu.",
          date: "20/05/2026",
          category: "Announcement",
          categoryLabel: "Thông Báo Sửa",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
          author: "Văn phòng Sở Xây dựng Đà Nẵng"
        },
        {
          id: "news-2",
          title: "Hướng dẫn xác nhận điều kiện nhà ở bình quân đạt chuẩn dưới 15m² sàn/người",
          excerpt: "Cẩm nang chi tiết hướng dẫn công dân nộp đơn trực tiếp tại cơ quan UBND Phường/Xã để lấy đóng dấu mộc xác nhận diện tích nhà ở bình quân theo Nghị định số 54/2026/NĐ-CP mới ban hành.",
          content: "Theo Nghị định số 54/2026/NĐ-CP của Chính phủ chính thức áp dụng sửa đổi Luật Nhà ở, điều kiện về thực trạng nhà ở của hộ gia đình chính thức nâng hạn mức diện tích bình quân đầu người lên tối đa 15 m² sàn/người (thay vì 10 m² sàn như quy định cũ).\n\nĐây là tin vui lớn, mở rộng cửa cho hàng nghìn hộ gia đình khó khăn có đông con em sinh sống chen chúc tại khu vực đô thị Đà Nẵng có cơ hội tiếp cận NOXH.\n\n**Quy trình hồ sơ xin xác nhận:**\n1. Người đứng đơn tải xuống Mẫu Đơn xác nhận diện tích nhà ở bình quân (Mẫu 03 Phụ lục Nghị định).\n2. Kê khai đúng danh sách thành viên cùng đăng ký thường trú tại căn nhà hiện tại.\n3. Nộp hồ sơ tại UBND cấp Xã/Phường nơi đăng ký thường trú. UBND cấp xã có nhiệm vụ xác minh thực tế, phản hồi giải quyết đóng dấu đỏ phê duyệt trong thời hạn tối đa 07 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.",
          date: "14/05/2026",
          category: "Policy",
          categoryLabel: "Phân Tích Chính Sách",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
          author: "Phòng Quản lý nhà và thị trường Bất Động Sản"
        },
        {
          id: "news-3",
          title: "Danh sách bốc thăm đợt 1 dự án chung cư NOXH tại Liên Chiểu",
          excerpt: "Công khai kết quả thẩm định điểm và công bố số lượng căn hộ bốc thăm cụ thể thuộc Dự án Căn hộ Sun Garden Liên Chiểu. Tổng cộng có 350 căn hoàn tất bàn bàn giao kỹ thuật.",
          content: "Sở Xây dựng thành phố Đà Nẵng đã phối hợp cùng Công ty Liên doanh Phát triển Đô thị Sun Garden tổ chức nghiệm thu kỹ thuật và công bố danh sách hộ gia đình đủ điều kiện vào vòng bốc thăm đợt 1.\n\nDự án Sun Garden Liên Chiểu ghi nhận 1.200 hồ sơ nộp đăng ký đợt 2, qua đó Sở đã thẩm duyệt rút gọn và xếp tuyển thang điểm 100 chọn ra 350 hộ gia đình đạt điểm số cao nhất (đáp ứng trọn vẹn điểm ưu tiên công nhân và khó khăn về nhà ở hiện trạng).\n\nBuổi lễ bốc thăm căn hộ sẽ diễn ra công khai dưới sự giám sát trực tiếp của cơ quan thanh tra thành phố vào sáng ngày 01/06/2026 tại Nhà văn hóa quận Liên Chiểu và truyền hình trực tuyến qua cổng dữ liệu thông tin đại chúng.",
          date: "05/05/2026",
          category: "Construction",
          categoryLabel: "Tiến Độ Dự Án",
          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
          author: "Hội đồng Thẩm định dự án Đà Nẵng"
        },
        {
          id: "news-4",
          title: "Cảnh báo mạo danh chuyên viên ban ngành Sở để nhận tiền 'cọc giữ chỗ' nhà ở xã hội",
          excerpt: "Sở Xây dựng Đà Nẵng đưa ra thông báo khẩn cấp khuyến cáo người lao động tránh các hội nhóm môi giới thu phí hoa hồng để đặt chỗ mua căn hộ trái luật.",
          content: "Sở Xây dựng thành phố Đà Nẵng vừa phát đi thông báo khẩn số 112/TB-SXD về việc phát hiện một số đối tượng, sàn giao dịch bất động sản mạo danh là chuyên viên Ban chính sách nhà ở để thu nhận phí dịch vụ, tiền cọc 'đảm bảo 100% bốc trúng' căn hộ NOXH tại khu vực quận Ngũ Hành Sơn.\n\nSở Xây dựng tái khẳng định:\n- Tất cả quy trình tiếp nhận, hướng dẫn khai phôi đơn và thẩm duyệt chấm điểm hồ sơ hoàn toàn **MIỄN PHÍ** 100%.\n- Không hề có bất kỳ ủy quyền môi giới trung gian cho bất kỳ đơn vị sàn thương mại tự do nào.\n- Mọi hình thức hứa hẹn giữ chỗ đóng tiền mặt đều là hành vi gian lận pháp luật, người dân khi phát hiện vui lòng trình báo ngay cho cơ quan công an quận gần nhất để kịp thời can thiệp xử lý hình sự.",
          date: "28/04/2026",
          category: "Announcement",
          categoryLabel: "Tin Cảnh Giác",
          image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
          author: "Văn phòng Thanh tra xây dựng thành phố"
        }
      ],
      stats: [
        { count: "15", label: "Tổng dự án NOXH", subDec: "Đang triển khai quy hoạch", icon: "domain" },
        { count: "12.4k", label: "Tổng số căn hộ", subDec: "Sản phẩm bàn giao", icon: "vpn_key" },
        { count: "8,540", label: "Đơn hồ sơ thụ lý", subDec: "Tiếp nhận trực tiếp ở Sở", icon: "drafts" },
        { count: "92%", label: "Tỷ lệ giải quyết", subDec: "Hoàn thiện duyệt thành công", icon: "task_alt" }
      ]
    };
    writeDb(defaultData);
    res.json({ success: true, db: defaultData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Vite on dev, static on prod
if (process.env.NODE_ENV !== "production") {
  const vite = createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  vite.then((vServer) => {
    app.use(vServer.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development server running on http://0.0.0.0:${PORT}`);
    });
  }).catch((err) => {
    console.error("Vite server failed to start:", err);
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on http://0.0.0.0:${PORT}`);
  });
}
