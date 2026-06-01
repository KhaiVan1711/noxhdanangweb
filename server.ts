import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Import Firebase SDK elements for server-side persistence
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  doc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Firebase App & Firestore Database on startup
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Seeding standard assets if Firestore is initially unpopulated
const DB_FILE = path.join(process.cwd(), "db_noxh.json");

// Hardcoded defaults to ensure user database starts fully loaded with clean data
const DEFAULT_PROJECTS = [
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
      "Thủ tục đăng ký xét duyệt và tính điểm ưu tiên thông qua Cơ quan Thẩm quyền"
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
    investor: "Ban quản lý dự án phối hợp Liên minh HTX",
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
];

const DEFAULT_NEWS = [
  {
    id: "news-1",
    title: "Đà Nẵng công bố đề án phát triển 10.000 căn hộ nhà ở xã hội đến năm 2030",
    excerpt: "UBND thành phố vừa thông qua lộ trình phân bổ quỹ đất xây dựng định hướng chuỗi dự án trọng vùng tại quận Liên Chiểu, Cẩm Lệ, Ngũ Hành Sơn nhằm đảm bảo nơi an cư cho người lao động, gia đình cận nghèo địa phương.",
    content: "Chiều ngày 20/5/2026, UBND TP. Đà Nẵng đã chính thức ký duyệt Đề án quy hoạch tổng thể nhà ở xã hội (NOXH) giai đoạn 2026 - 2530. \n\nMục tiêu cụ thể của đề án là hoàn thiện xây dựng ít nhất 10.000 căn hộ chất lượng cao với các chính sách trợ giá hấp dẫn. Trong đó, tập trung khai thác đồng bộ các khu đô thị vệ tinh xung quanh khu công nghiệp Hòa Khánh, khu công nghệ cao Đà Nẵng và dọc theo các trục giao thông chính của thành phố.\n\nHội đồng liên ngành thành phố sẽ đóng vai trò chủ trì điều phối quỹ đất công, thực hiện đấu thầu chủ đầu tư công khai, minh bạch nhằm bảo đảm tiêu chuẩn an toàn kỹ thuật xây dựng và thời gian bàn bàn giao đúng hạn. Người dân thuộc diện độc thân thu nhập dưới 25 triệu/tháng hoặc đã kết hôn dưới 50 triệu/tháng sẽ được ưu tiên bốc thăm quỹ nhà đợt đầu.",
    date: "20/05/2026",
    category: "Announcement",
    categoryLabel: "Thông Báo Sửa",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    author: "Cổng Tra Cứu NOXH"
  },
  {
    id: "news-2",
    title: "Hướng dẫn xác nhận điều kiện nhà ở bình quan đạt chuẩn dưới 15m² sàn/người",
    excerpt: "Cẩm nang chi tiết hướng dẫn công dân nộp đơn trực tiếp tại cơ quan UBND Phường/Xã để lấy đóng dấu mộc xác nhận diện tích nhà ở bình quan theo Nghị định số 54/2026/NĐ-CP mới ban hành.",
    content: "Theo Nghị định số 54/2026/NĐ-CP của Chính phủ chính thức áp dụng sửa đổi Luật Nhà ở, điều kiện về thực trạng nhà ở của hộ gia đình chính thức nâng hạn mức diện tích bình quan đầu người lên tối đa 15 m² sàn/người (thay vì 10 m² sàn như quy định cũ).\n\nĐây là tin vui lớn, mở rộng cửa cho hàng nghìn hộ gia đình khó khăn có đông con em sinh sống chen chúc tại khu vực đô thị Đà Nẵng có cơ hội tiếp cận NOXH.\n\n**Quy trình hồ sơ xin xác nhận:**\n1. Người đứng đơn tải xuống Mẫu Đơn xác nhận diện tích nhà ở bình quan (Mẫu 03 Phụ lục Nghị định).\n2. Kê khai đúng danh sách thành viên cùng đăng ký thường trú tại căn nhà hiện tại.\n3. Nộp hồ sơ tại UBND cấp Xã/Phường nơi đăng ký thường trú. UBND cấp xã có nhiệm vụ xác minh thực tế, phản hồi giải quyết đóng dấu đỏ phê duyệt trong thời hạn tối đa 07 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.",
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
    content: "Ban quản lý dự án thành phố Đà Nẵng đã phối hợp cùng Công ty Liên doanh Phát triển Đô thị Sun Garden tổ chức nghiệm thu kỹ thuật và công bố danh sách hộ gia đình đủ điều kiện vào vòng bốc thăm đợt 1.\n\nDự án Sun Garden Liên Chiểu ghi nhận 1.200 hồ sơ nộp đăng ký đợt 2, qua đó Hội đồng đã thẩm duyệt rút gọn và xếp tuyển thang điểm 100 chọn ra 350 hộ gia đình đạt điểm số cao nhất (đáp ứng trọn vẹn điểm ưu tiên công nhân và khó khăn về nhà ở hiện trạng).\n\nBuổi lễ bốc thăm căn hộ sẽ diễn ra công khai dưới sự giám sát trực tiếp của cơ quan thanh tra thành phố vào sáng ngày 01/06/2026 tại Nhà văn hóa quận Liên Chiểu và truyền hình trực tuyến qua cổng dữ liệu thông tin đại chúng.",
    date: "05/05/2026",
    category: "Construction",
    categoryLabel: "Tiến Độ Dự Án",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    author: "Hội đồng Thẩm định dự án Đà Nẵng"
  },
  {
    id: "news-4",
    title: "Cảnh báo mạo danh chuyên viên ban ngành để nhận tiền 'cọc giữ chỗ' nhà ở xã hội",
    excerpt: "Cơ quan thẩm quyền đưa ra thông báo khẩn cấp khuyến cáo người lao động tránh các hội nhóm môi giới thu phí hoa hồng để đặt chỗ mua căn hộ trái luật.",
    content: "Cơ quan Quản lý nhà ở đại diện thành phố Đà Nẵng vừa phát đi thông báo khẩn số 112/TB-CP về việc phát hiện một số đối tượng, sàn giao dịch bất động sản mạo danh là chuyên viên Ban chính sách nhà ở để thu nhận phí dịch vụ, tiền cọc 'đảm bảo 100% bốc trúng' căn hộ NOXH tại khu vực quận Ngũ Hành Sơn.\n\nCơ quan chức năng tái khẳng định:\n- Tất cả quy trình tiếp nhận, hướng dẫn khai phôi đơn và thẩm duyệt chấm điểm hồ sơ hoàn toàn **MIỄN PHÍ** 100%.\n- Không hề có bất kỳ ủy quyền môi giới trung gian cho bất kỳ đơn vị sàn thương mại tự do nào.\n- Mọi hình thức hứa hẹn giữ chỗ đóng tiền mặt đều là hành vi gian lận pháp luật, người dân khi phát hiện vui lòng trình báo ngay cho cơ quan công an quận gần nhất để kịp thời can thiệp xử lý hình sự.",
    date: "28/04/2026",
    category: "Announcement",
    categoryLabel: "Tin Cảnh Giác",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
    author: "Văn phòng Thanh tra xây dựng thành phố"
  }
];

const DEFAULT_STATS = [
  { count: "15", label: "Tổng dự án NOXH", subDec: "Đang triển khai quy hoạch", icon: "domain" },
  { count: "12.4k", label: "Tổng số căn hộ", subDec: "Sản phẩm bàn giao", icon: "vpn_key" },
  { count: "8,540", label: "Đơn hồ sơ thụ lý", subDec: "Tiếp nhận trực tiếp ở Sở", icon: "drafts" },
  { count: "92%", label: "Tỷ lệ giải quyết", subDec: "Hoàn thiện duyệt thành công", icon: "task_alt" }
];

async function seedFirestore() {
  try {
    const projectsSnap = await getDocs(collection(db, "projects"));
    if (projectsSnap.empty) {
      console.log("[Firebase Seeding] Empty remote database detected. Automatically seeding all Vietnamese datasets...");
      
      // Attempt load from existing local JSON file if it is already populated, falling back to core array
      let initializedData: any = { projects: DEFAULT_PROJECTS, news: DEFAULT_NEWS, stats: DEFAULT_STATS };
      if (fs.existsSync(DB_FILE)) {
        try {
          const contents = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
          if (contents.projects && contents.projects.length > 0) initializedData.projects = contents.projects;
          if (contents.news && contents.news.length > 0) initializedData.news = contents.news;
          if (contents.stats && contents.stats.length > 0) initializedData.stats = contents.stats;
          if (contents.geminiApiKey) initializedData.geminiApiKey = contents.geminiApiKey;
          if (contents.n8nWebhookToken) initializedData.n8nWebhookToken = contents.n8nWebhookToken;
        } catch (e) {
          console.error("[Firebase Seeding] Local db parse failed, using hardcoded templates", e);
        }
      }

      // Write projects to Cloud Firestore
      for (const item of initializedData.projects) {
        await setDoc(doc(db, "projects", item.id), item);
      }
      console.log(`[Firebase Seeding] Successfully seeded ${initializedData.projects.length} projects to cloud.`);

      // Write news to Cloud Firestore
      for (const item of initializedData.news) {
        await setDoc(doc(db, "news", item.id), item);
      }
      console.log(`[Firebase Seeding] Successfully seeded ${initializedData.news.length} news items to cloud.`);

      // Write Stats to Cloud Firestore
      let idx = 0;
      for (const item of initializedData.stats) {
        const docId = `stat-${idx}`;
        await setDoc(doc(db, "stats", docId), { id: docId, ...item });
        idx++;
      }
      console.log(`[Firebase Seeding] Successfully seeded stats items.`);

      // Write Config global credentials to Cloud Firestore
      const configDoc = {
        id: "global",
        geminiApiKey: initializedData.geminiApiKey || process.env.GEMINI_API_KEY || "",
        n8nWebhookToken: initializedData.n8nWebhookToken || "noxh_danang_secret_n8n_token_" + Math.random().toString(36).substring(2, 8)
      };
      await setDoc(doc(db, "configs", "global"), configDoc);
      console.log("[Firebase Seeding] Successfully seeded configs global node.");
    } else {
      console.log("[Firebase] Remote firestore has existing collections. Seeding bypassed.");
    }
  } catch (err) {
    console.error("[Firebase Seeding Exception]:", err);
  }
}

// Trigger Seeding on system boot
seedFirestore();


// ─── CHAT BOT COMPONENT UTILS ───────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
let lastUsedApiKey: string | undefined = undefined;

async function getLiveAIClient() {
  dotenv.config({ override: true });
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    try {
      const configSnap = await getDoc(doc(db, "configs", "global"));
      if (configSnap.exists()) {
        apiKey = configSnap.data().geminiApiKey;
      }
    } catch (e) {
      console.error("[API Key Fetch Failed]", e);
    }
  }

  if (apiKey) {
    apiKey = apiKey.replace(/^["']|["']$/g, "").trim();
  }
  
  if (apiKey) {
    const masked = apiKey.length > 10 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "***";
    console.log(`[AI Client Info] Using API Key: ${masked}`);
  } else {
    console.warn("[AI Client Info] No GEMINI_API_KEY found in process.env or configs/global.");
  }

  if (!aiClient || lastUsedApiKey !== apiKey) {
    lastUsedApiKey = apiKey;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return { ai: aiClient, key: apiKey };
}


// ─── API ENDPOINTS ───────────────────────────────────────────────────────────

// 1. Live AI Chatbot Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    dotenv.config({ override: true });
    
    // Fetch live datasets from Cloud Firestore
    const projectsSnap = await getDocs(collection(db, "projects"));
    const projectsListStr = projectsSnap.docs.map(doc => {
      const p = doc.data();
      const pReqs = Array.isArray(p.requirements) 
        ? p.requirements.map((r: string) => `    * ${r}`).join("\n") 
        : "    * Đáp ứng điều kiện chung của Cơ quan Quản lý Quy hoạch";
      return `- **Tên dự án: ${p.name}**
    * Địa chỉ/Vị trí: ${p.location} (Phường/Xã: ${p.districts || "Chưa cập nhật"})
    * Chủ đầu tư: ${p.investor || "Ban quản lý dự án nhà ở xã hội"}
    * Trạng thái hồ sơ: ${p.status || "Chưa xác định"}
    * Đơn giá: ${p.price || "Chưa công bố"} (Giá trị nội bộ: ${p.priceRaw ? p.priceRaw.toLocaleString('vi-VN') + ' VNĐ/m²' : 'N/A'})
    * Tiến độ xây dựng: ${p.progress || 0}%
    * Quy mô thiết kế: ${p.scale || "Đang cập nhật"}
    * Loại căn hộ: ${p.types || "Căn hộ tiêu chuẩn thương mại xã hội"}
    * Hạn chót nộp hồ sơ / Dự kiến bàn giao: ${p.deadline || "Xem hướng dẫn chi tiết"}
    * Hotline tư vấn: ${p.hotline || "1900 1000"}
    * Yêu cầu / Điều kiện đặc thù của dự án:
${pReqs}`;
    }).join("\n\n");

    const newsSnap = await getDocs(collection(db, "news"));
    const newsListStr = newsSnap.docs.slice(0, 5).map(doc => {
      const n = doc.data();
      return `- **Bài viết/Quyết định mới: ${n.title}** (${n.date || "Gần đây"})
    * Tóm tắt bài đăng: ${n.excerpt || ""}
    * Nội dung văn bản chính thức: ${n.content || ""}`;
    }).join("\n\n");

    const statsSnap = await getDocs(collection(db, "stats"));
    const statsListStr = statsSnap.docs.map(doc => {
      const s = doc.data();
      return `  * ${s.label}: ${s.count} (${s.subDec})`;
    }).join("\n");

    const systemInstruction = `
Bạn là NOXH Bot, một Trợ lý ảo cực kỳ am hiểu và tận tụy của Cổng Tra cứu Nhà ở Xã hội (NOXH) Thành phố Đà Nẵng, do Cơ quan quản lý vận hành trực tiếp.
Nhiệm vụ của bạn là giải đáp chính xác, trung thực, rõ ràng và ấm áp cho mọi thắc mắc của người dân (Dân cư) Việt Nam về các dự án nhà ở xã hội đang hoạt động tại Đà Nẵng.

--- CƠ SỞ DỮ LIỆU THỜI GIAN THỰC TỪ HỆ THỐNG QUẢN LÝ ---

1. Điều kiện chung và tiêu chí chấm điểm để được sở hữu/mua/thuê NOXH tại TP. Đà Nẵng:
  - Đối tượng thụ hưởng: Cán bộ, công chức, viên chức Nhà nước; sĩ quan quân nhân chuyên nghiệp quân đội/công an; hộ gia đình nghèo/cận nghèo đô thị; người lao động, công nhân đang làm việc trực tiếp tại các khu công nghiệp, doanh nghiệp trên địa bàn TP. Đà Nẵng chưa có nhà ở thuộc sở hữu cá nhân hay đại diện hộ gia đình.
  - Điều kiện cư trú bắt buộc: Phải có đăng ký thường trú hoặc đăng ký tạm trú thực tế tại TP. Đà Nẵng từ 01 năm trở lên liên tiếp, đồng thời bắt buộc đang tham gia BHXH tại tỉnh Đà Nẵng tối thiểu 12 tháng.
  - Điều kiện thu nhập: Tổng thu nhập thực tế của tất cả thành viên trong hộ gia đình KHÔNG thuộc diện đóng thuế thu nhập cá nhân (TNCN) thường xuyên.
  - Điều kiện thực trạng nhà ở: Gia đình chưa từng đứng tên quyền sử dụng đất hoặc sở hữu nhà riêng tại Đà Nẵng; diện tích sàn ở bình quân của cả hộ hiện tại dưới 10m²/người (hoặc chuẩn mới dưới 15m²/người tùy hộ giải tỏa tái định cư).

2. Danh sách tất cả các Dự án NOXH chính thức của Đà Nẵng trực thuộc hệ thống Cổng Tra Cứu:
${projectsListStr}

3. Các thông báo, văn bản pháp luật, chính sách và tin cảnh báo mới nhất từ Cơ quan quản lý:
${newsListStr}

4. Thống kê thông tin vận hành hệ thống:
${statsListStr}

--- QUY TẮC PHÁT NGÔN & ỨNG XỬ THỰC TẾ ---
- Luôn xưng danh là "NOXH Bot", xưng hô lễ phép "Dạ chào anh/chị", "Kính chào Dân cư" hoặc "Dạ, em chào anh/chị ạ".
- Trả lời bằng tiếng Việt lịch sự, súc tích, chuyên nghiệp có cấu trúc Markdown rõ nét với các gạch đầu dòng và bôi đậm tiêu đề lớn để người dân dễ nhìn và hiểu ngay.
- CHỈ phản hồi tin tức dựa trên danh sách dự án và bài báo THỰC TẾ TRÊN DATABASE ở trên. Nếu người dân hỏi về dự án hoàn toàn lạ lẫm hoặc không xuất hiện trong danh sách dữ liệu trên, hãy giải thích khéo léo và duyên dáng rằng "Hiện dự án này chưa được công bố hoặc Cơ quan quản lý chưa phê duyệt trên hệ thống dữ liệu số chính thống."
- Đưa ra lời khuyên chi tiết về đơn thư biểu mẫu (các loại Đơn mẫu số 01 đăng ký, Đơn mẫu số 03 xác nhận thực trạng nhà ở của cơ quan hoặc phường xã).
- Phát đi cảnh báo khẩn cấp cho người dân: Tuyệt đối tránh xa các hội nhóm facebook, zalo, môi giới tự dưng đòi thu "phí hoa hồng bôi trơn", "đóng cọc giữ căn hộ đẹp" trái luật pháp vì hệ thống xử lý bốc thăm công khai hoàn toàn MIỄN PHÍ.
`;

    const { ai, key } = await getLiveAIClient();

    if (!key || key === "AIzaSy..." || key === "") {
      // Demo streaming simulation using live databases if Gemini Key is unavailable
      const fallbackList = projectsSnap.docs.map(doc => {
        const p = doc.data();
        return `- **${p.name}** (${p.districts || "Phường xã"}): Trạng thái ${p.status || "Chưa rõ"}, đơn giá ${p.price || "Chưa rõ"}, tiến độ ${p.progress || 0}%`;
      }).join("\n");

      const demoResponse = `Dạ chào anh/chị! Hiện tại chatbot của hệ thống đang chạy ở chế độ mô phỏng trực tuyến (không nhận được GEMINI_API_KEY hợp lệ hoặc chưa lưu). 

Tuy nhiên, chatbot vẫn đồng bộ thông tin dự án hiện thực từ hệ thống cơ sở dữ liệu Đà Nẵng cho anh/chị tham khảo ngay lúc này:

${fallbackList}

- **Hồ sơ xin mua**: Anh/chị lưu ý phải chưa sở hữu nhà đất tại TP. Đà Nẵng, có đăng ký thường trú hoặc tạm trú trên 1 năm kèm tham gia đóng Bảo hiểm Xã hội (BHXH) đầy đủ tại Đà Nẵng và thuộc diện thu nhập không chịu thuế TNCN thường xuyên.
- **Thủ tục**: Phải chuẩn bị Đơn 01 (Đơn xin mua) và Đơn 03 (Đơn xác nhận thực trạng nhà đất của địa phương/công ty).

*Bảo mật & Kích hoạt:* Anh/chị có thể cập nhật khóa API Gemini AI vào file cấu hình \`.env\` để kích hoạt chatbot thông thái toàn năng hoạt động ngay lập tức! Thay đổi dữ liệu trong Admin sẽ phản ánh trực tiếp ở đây ạ!`;
      
      const words = demoResponse.split(" ");
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 20));
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


// ─── FIRESTORE POWERED PROJECTS API ROUTES ───────────────────────────────────

app.get("/api/projects", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "projects"));
    const list = snap.docs.map(doc => {
      const data = doc.data();
      if (!data.id) {
        data.id = doc.id;
      }
      return data;
    });
    res.json(list);
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const item = req.body;
    if (!item.name) {
      return res.status(400).json({ error: "Tên dự án là bắt buộc" });
    }

    if (!item.id) {
      item.id = "proj-" + Date.now();
    }

    await setDoc(doc(db, "projects", item.id), item);
    res.json({ success: true, project: item });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Direct delete by ID
    await deleteDoc(doc(db, "projects", id));

    // 2. Multi-strategy query: scan and delete items where doc.id or data.id matches
    const snap = await getDocs(collection(db, "projects"));
    for (const d of snap.docs) {
      const data = d.data();
      if (d.id === id || data.id === id) {
        await deleteDoc(doc(db, "projects", d.id));
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── FIRESTORE POWERED NEWS API ROUTES ───────────────────────────────────────

app.get("/api/news", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "news"));
    const list = snap.docs.map(doc => {
      const data = doc.data();
      if (!data.id) {
        data.id = doc.id;
      }
      return data;
    });
    
    // Sort news decending
    list.sort((a: any, b: any) => {
      const idA = a.id || "";
      const idB = b.id || "";
      return idB.localeCompare(idA);
    });
    res.json(list);
  } catch (err: any) {
    console.error("GET /api/news error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/news", async (req, res) => {
  try {
    const item = req.body;

    // Optional Check for External/Webhook clients (e.g. n8n push automation)
    const clientToken = req.headers["x-webhook-token"] || 
                        (req.headers["authorization"] ? req.headers["authorization"].toString().replace(/^Bearer\s+/i, "") : null) || 
                        req.query.token;

    // Retrieve global webhook token from Firestore config
    const globalSnap = await getDoc(doc(db, "configs", "global"));
    const configData = globalSnap.exists() ? globalSnap.data() : { n8nWebhookToken: "" };
    const dbWebhookToken = configData.n8nWebhookToken;

    const isWebhook = !req.headers["referer"] || clientToken;
    if (dbWebhookToken && isWebhook) {
      if (clientToken !== dbWebhookToken) {
        return res.status(401).json({ 
          error: "Xác thực Webhook thất bại! Webhook Token không khớp hoặc chưa được cung cấp qua header 'X-Webhook-Token'." 
        });
      }
    }

    if (!item.title) {
      return res.status(400).json({ error: "Tiêu đề là bắt buộc" });
    }

    if (!item.id) {
      item.id = "news-" + Date.now();
    }

    await setDoc(doc(db, "news", item.id), item);
    res.json({ success: true, article: item });
  } catch (err: any) {
    console.error("POST /api/news error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Direct delete by ID
    await deleteDoc(doc(db, "news", id));

    // 2. Scan and delete matching pieces where doc.id or data.id matches
    const snap = await getDocs(collection(db, "news"));
    for (const d of snap.docs) {
      const data = d.data();
      if (d.id === id || data.id === id) {
        await deleteDoc(doc(db, "news", d.id));
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/news/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── FIRESTORE POWERED STATS API ROUTES ──────────────────────────────────────

app.get("/api/stats", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "stats"));
    const list = snap.docs.map(doc => doc.data());
    
    // Maintain stable order
    list.sort((a: any, b: any) => {
      const idA = a.id || "";
      const idB = b.id || "";
      return idA.localeCompare(idB);
    });
    res.json(list);
  } catch (err: any) {
    console.error("GET /api/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stats", async (req, res) => {
  try {
    const statsArray = req.body;
    if (Array.isArray(statsArray)) {
      let idx = 0;
      for (const item of statsArray) {
        const docId = `stat-${idx}`;
        await setDoc(doc(db, "stats", docId), { id: docId, ...item });
        idx++;
      }
    }
    res.json({ success: true, stats: statsArray });
  } catch (err: any) {
    console.error("POST /api/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── CONFIGS API ROUTES ──────────────────────────────────────────────────────

app.get("/api/config", async (req, res) => {
  try {
    const globalSnap = await getDoc(doc(db, "configs", "global"));
    const configData = globalSnap.exists() ? globalSnap.data() : { geminiApiKey: "", n8nWebhookToken: "" };

    const apiKey = process.env.GEMINI_API_KEY || configData.geminiApiKey || "";
    let masked = "";
    if (apiKey) {
      masked = apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "***";
    }

    let n8nToken = configData.n8nWebhookToken;
    if (!n8nToken) {
      n8nToken = "noxh_danang_secret_n8n_token_" + Math.random().toString(36).substring(2, 8);
      await setDoc(doc(db, "configs", "global"), { n8nWebhookToken: n8nToken }, { merge: true });
    }

    res.json({
      geminiApiKeyMasked: masked,
      hasApiKey: !!apiKey,
      n8nWebhookToken: n8nToken
    });
  } catch (err: any) {
    console.error("GET /api/config error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/config", async (req, res) => {
  try {
    const { geminiApiKey, n8nWebhookToken } = req.body;
    const writeData: any = {};
    
    if (geminiApiKey !== undefined) {
      writeData.geminiApiKey = geminiApiKey.trim();
      process.env.GEMINI_API_KEY = writeData.geminiApiKey;
      console.log("[Config Update] New Gemini API Key written to environment and Firestore configs.");
    }

    if (n8nWebhookToken !== undefined) {
      writeData.n8nWebhookToken = n8nWebhookToken.trim();
    }

    await setDoc(doc(db, "configs", "global"), writeData, { merge: true });

    const globalSnap = await getDoc(doc(db, "configs", "global"));
    const finalData = globalSnap.exists() ? globalSnap.data() : { geminiApiKey: "", n8nWebhookToken: "" };

    res.json({ 
      success: true, 
      hasApiKey: !!(process.env.GEMINI_API_KEY || finalData.geminiApiKey),
      n8nWebhookToken: finalData.n8nWebhookToken 
    });
  } catch (err: any) {
    console.error("POST /api/config error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── AI ASSISTANT GENERATE API ROUTE ────────────────────────────────────────

app.post("/api/assistant/generate", async (req, res) => {
  try {
    const { prompt, type, field } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { ai, key } = await getLiveAIClient();

    if (key && key !== "AIzaSy..." && key !== "") {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Bạn là trợ lý AI chuyên viên phân tích hạ tầng và soạn thảo nội dung của Ban Quản lý Quy hoạch Đà Nẵng chuyên về Nhà ở xã hội (NOXH). 
Hãy viết nội dung dựa trên yêu cầu sau. 

Yêu cầu cụ thể: "${prompt}"
Phân loại: ${type || "general"}
Trường dữ liệu cần soạn thảo: ${field || "general"}

Quy tắc quan trọng:
1. Trả lời bằng tiếng Việt, sử dụng ngôn từ chính thức, nghiêm túc, chuẩn mực pháp lý về nhà đất xã hội Việt Nam.
2. Trả về đúng nội dung được yêu cầu. Tuyệt đối KHÔNG có lời mở đầu, không giải thích, không "Dưới đây là...", không có bất kỳ ký hiệu thừa nào ngoài nội dung chính.
3. Không định dạng markdown kiểu tiêu đề lớn (#, ##) hay bôi đậm dồn dập, chỉ trả về văn bản sạch.
4. Nếu trường dữ liệu là Yêu cầu / Điều kiện nộp hồ sơ (requirements), hãy viết dưới dạng các dòng gạch đầu dòng ngắn, rõ ràng, phân tách nhau bằng dấu xuống dòng (Enter), ví dụ:
- Chưa sở hữu đất đai hoặc nhà ở tại Đà Nẵng
- Đăng trú cư trú trên 1 năm tại địa phương`,
        config: {
          temperature: 0.7,
        }
      });

      const responseText = result.text || "";
      return res.json({ text: responseText.trim() });
    } else {
      // Mock assistant output based on field type if no Gemini API Key is stored
      let mockText = "";
      if (field === "requirements") {
        mockText = "- Chưa từng đứng tên quyền sử dụng đất hoặc sở hữu nhà riêng tại TP. Đà Nẵng\n- Thời gian đăng trú cư trú/tạm trú thực tế liên tục từ 1 năm trở lên\n- Thu nhập hộ gia đình không thuộc diện phải đóng thuế thu nhập cá nhân (TNCN) thường xuyên\n- Đang trực tiếp tham gia đóng Bảo hiểm Xã hội tại Đà Nẵng tối thiểu 12 tháng";
      } else if (field === "scale") {
        mockText = `Cụm công trình hiện đại gồm có 2 tòa chung cư cao 18 tầng nổi, cung ứng 650 căn hộ phân khúc xã hội với mật độ xây dựng chỉ 38%. Căn hộ đa dạng từ 1.5 phòng ngủ đến 3 phòng ngủ (diện tích 48m² - 74m²), đáp ứng chuẩn về phòng cháy chữa cháy, an ninh camera số hóa và hành lang thông thoáng gió tự nhiên.`;
      } else if (field === "excerpt") {
        mockText = `Hướng dẫn chi tiết thủ tục hành chính bổ sung hồ sơ và hồ sơ số hóa đợt bốc thăm nhà ở xã hội mới nhất trên địa bàn TP. Đà Nẵng.`;
      } else if (field === "content") {
        mockText = `Nhằm bảo đảm tính công khai, minh bạch tuyệt đối trong việc thụ hưởng điều kiện an sinh xã hội, Cơ quan chức năng TP. Đà Nẵng chính thức đưa vào vận hành hệ thống số hóa hồ sơ tự động. Toàn bộ quy trình kiểm tra chéo cơ sở dữ liệu đất đai cư trú và mã số thuế cá nhân sẽ được xử lý tự động trong vòng 5 ngày làm việc.\n\nNgười dân lưu ý chỉ chuẩn bị Đơn đăng ký theo đúng Mẫu số 01 của Bộ Xây dựng ban hành và trực tiếp nộp tại Văn phòng Tiếp nhận một cửa, cam kết không mất bất kỳ khoản chi phí bôi trơn nào cho cò mồi bên ngoài.`;
      } else if (field === "name" || field === "title") {
        mockText = `Chung cư Nhà ở Xã hội Sunshine Hòa Khánh`;
      } else {
        mockText = `Hệ thống hạ tầng tiện ích được thiết kế phục vụ tối đa nhu cầu của cán bộ công nhân viên thu nhập trung bình thấp, bao gồm vườn hoa cảnh quan trung tâm, nhà giữ trẻ công lập nội khu và sảnh cộng đồng khép kín.`;
      }
      return res.json({ text: mockText + " (Mô phỏng AI)" });
    }
  } catch (error: any) {
    console.error("AI Assistant Generation error:", error);
    res.status(505).json({ error: error.message });
  }
});


// ─── EXTREMELY SOPHISTICATED WEBHOCK DOCK GENERATOR ──────────────────────────

function getMockNewsTemplates() {
  return [
    {
      title: "Khởi công Block C chung cư NOXH Liên Chiểu đón 800 hộ dân công nghiệp",
      excerpt: "Sáng nay, dự án căn hộ thu nhập thấp tại Phường Hòa Khánh đã chính thức khởi công tháp thứ 3 nâng tổng quy mô quỹ nhà lên 1.500 căn.",
      content: `Dự án mở rộng tháp C của cụm nhà ở xã hội Liên Chiểu đã chính thức nhận quyết định phê duyệt khởi công sáng nay.\n\nĐại diện Ban quản lý hạ tầng đô thị Đà Nẵng thông báo, tháp C gồm 18 tầng nổi và 1 bán hầm sẽ cung ứng thêm khoảng 800 căn hộ diện tích hợp lý từ 48m² đến 65m² dành cho đối tượng chính là công nhân khu công nghiệp Hòa Khánh.\n\nTập đoàn Liên doanh xây dựng cam kết áp dụng công nghệ cốp pha trượt hiện đại để rút ngắn thời gian xây dựng còn 14 tháng, bảo đảm tiến độ bàn giao chìa khóa trao tay vào quý III năm 2027.`,
      category: "Construction",
      categoryLabel: "Tiến Độ Dự Án",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
      author: "Phòng Dự án - Ban quản lý đô thị Đà Nẵng (n8n automated)"
    },
    {
      title: "Hỗ trợ vay 4.8%/năm mua nhà ở xã hội từ gói tín dụng ưu đãi 120.000 tỷ",
      excerpt: "Ngân hàng Chính sách Xã hội Chi nhánh Đà Nẵng bổ sung hạn mức vay mua nhà ở xã hội lên đến 25 năm cho các cặp vợ chồng trẻ.",
      content: `Ban quản lý dự án thành phố phối hợp cùng Ngân hàng Chính sách Xã hội công bố chương trình tăng hạn mức và nới lỏng điều kiện tiếp cận nguồn vốn vay ưu đãi.\n\nTheo đó, lãi suất cho vay hỗ trợ tạo lập nhà ở xã hội sẽ giữ ổn định ở mức 4.8%/năm. Thời gian vay được kéo dài tối đa lên tới 25 năm nhằm đảm bảo mỗi tháng gia đình chỉ phải chi trả gốc lãi dao động từ 3 - 5 triệu đồng, phù hợp túi tiền của người lao động phổ thông.\n\nHồ sơ bao gồm Đơn đăng ký theo mẫu của Ngân hàng kèm xác nhận thực trạng chưa sở hữu đất ở của UBND Phường nơi đăng trú.`,
      category: "Policy",
      categoryLabel: "Kính Gửi Cử Tri",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      author: "Ngân hàng Chính sách Xã hội VN (n8n automated)"
    },
    {
      title: "Nghiêm cấm bán chênh, sang nhượng suất mua nhà xã hội sai đối tượng",
      excerpt: "Thanh tra thành phố ban hành chỉ thị rà soát kiểm tra toàn diện 10 khu chung cư xã hội đã bàn giao để xử lý các chung cư mua bán sang tay.",
      content: `Chiều qua, Thanh tra thành phố đã có văn bản hỏa tốc đôn đốc chấn chỉnh việc mua bán lại căn hộ tại các khu dự án thu nhập thấp.\n\nTheo Luật Nhà ở hiện hành, căn hộ thuộc diện ưu đãi bất động sản xã hội chỉ được phép bán lại sau tối thiểu 05 năm kể từ ngày hoàn tất tiền mua và được cấp Sổ hồng. Mọi giao dịch bằng Giấy viết phôi tay, Văn bản ủy quyền lập lờ tại văn phòng công chứng tự do đều không có giá trị pháp lý và sẽ bị cưỡng chế thu hồi lại nhà lập tức.\n\nĐường dây nóng hỗ trợ (0236.3822123) sẵn sằng tiếp nhận tố giác của công dân từ hôm nay.`,
      category: "Announcement",
      categoryLabel: "Cảnh Giác Cao",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
      author: "Thanh tra Đô thị Đà Nẵng (n8n automated)"
    }
  ];
}

app.post("/api/news/test-push", async (req, res) => {
  try {
    let title = "";
    let excerpt = "";
    let content = "";
    let category: "Policy" | "Announcement" | "Construction" = "Policy";
    let categoryLabel = "Thông tin chính sách";
    let image = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800";
    let author = "Cổng Tra Cứu (AI n8n push)";

    const { ai, key } = await getLiveAIClient();

    if (key && key !== "AIzaSy..." && key !== "") {
      try {
        const prompt = `Bạn là biên tập viên tin tức cho Cổng thông tin Nhà Ở Xã Hội Đà Nẵng. 
Hãy viết một bài báo hoàn toàn MỚI, cực kỳ thời sự về tiến độ xây dựng căn hộ hoặc hướng dẫn làm thủ tục nộp hồ sơ nhà ở xã hội (NOXH) tại Đà Nẵng năm 2026.
Hãy xuất kết quả dưới dạng JSON object hợp lệ chứa các trường sau:
{
  "title": "Tiêu đề bài viết hấp dẫn, thời sự",
  "excerpt": "Đoạn trích tóm tắt ngắn từ 1-2 câu",
  "content": "Nội dung chi tiết của bài viết, có phân tách đoạn bằng dấu xuống dòng. Độ dài khoảng 3-4 đoạn.",
  "category": "Chọn một trong 3 giá trị: 'Policy' hoặc 'Announcement' hoặc 'Construction'",
  "categoryLabel": "Nhãn tương ứng tiếng Việt (ví dụ: 'Điểm tin tiến độ', 'Văn bản chính sách', 'Thông báo nóng')",
  "image": "Một cấu hình ảnh Unsplash ngẫu nhiên về thành phố hoặc tòa nhà, ví dụ: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'",
  "author": "Phòng Thông tin - Cổng Tra Cứu"
}
Chú ý: Vui lòng TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ không có markdown block hay rác ký tự ngoài JSON.`;

        const responseObj = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.8,
            responseMimeType: "application/json"
          }
        });

        const generatedText = responseObj.text;
        if (generatedText) {
          const parsed = JSON.parse(generatedText.trim());
          title = parsed.title || "Chính sách đăng ký NOXH Đà Nẵng đổi mới";
          excerpt = parsed.excerpt || "Hội đồng Đà Nẵng chuẩn bị điều chỉnh thủ tục làm hồ sơ nộp trực tuyến.";
          content = parsed.content || "Nội dung đang được cập nhật.";
          category = (parsed.category || "Policy") as any;
          categoryLabel = parsed.categoryLabel || "Thông tin chính sách";
          image = parsed.image || image;
          author = parsed.author || author;
        }
      } catch (err) {
        console.error("Lỗi tạo tin bằng AI:", err);
        const templates = getMockNewsTemplates();
        const t = templates[Math.floor(Math.random() * templates.length)];
        title = t.title;
        excerpt = t.excerpt;
        content = t.content;
        category = t.category as any;
        categoryLabel = t.categoryLabel;
        image = t.image;
        author = t.author;
      }
    } else {
      const templates = getMockNewsTemplates();
      const t = templates[Math.floor(Math.random() * templates.length)];
      title = t.title;
      excerpt = t.excerpt;
      content = t.content;
      category = t.category as any;
      categoryLabel = t.categoryLabel;
      image = t.image;
      author = t.author;
    }

    const testId = "news-" + Date.now();
    const newArticle = {
      id: testId,
      title,
      excerpt,
      content,
      date: new Date().toLocaleDateString("vi-VN"),
      category,
      categoryLabel,
      image,
      author
    };

    await setDoc(doc(db, "news", testId), newArticle);
    res.json({ success: true, article: newArticle });
  } catch (err: any) {
    console.error("POST /api/news/test-push error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── ADMIN FORCE REST DATABASE ENDPOINT ──────────────────────────────────────

app.post("/api/reset-all", async (req, res) => {
  try {
    console.log("[Firebase Reset] Clearing existing documents and applying core presets...");

    // 1. Projects Clear & Re-seed
    const pSnap = await getDocs(collection(db, "projects"));
    for (const d of pSnap.docs) {
      await deleteDoc(doc(db, "projects", d.id));
    }
    for (const item of DEFAULT_PROJECTS) {
      await setDoc(doc(db, "projects", item.id), item);
    }

    // 2. News Clear & Re-seed
    const nSnap = await getDocs(collection(db, "news"));
    for (const d of nSnap.docs) {
      await deleteDoc(doc(db, "news", d.id));
    }
    for (const item of DEFAULT_NEWS) {
      await setDoc(doc(db, "news", item.id), item);
    }

    // 3. Stats Clear & Re-seed
    const sSnap = await getDocs(collection(db, "stats"));
    for (const d of sSnap.docs) {
      await deleteDoc(doc(db, "stats", d.id));
    }
    let idx = 0;
    for (const item of DEFAULT_STATS) {
      const docId = `stat-${idx}`;
      await setDoc(doc(db, "stats", docId), { id: docId, ...item });
      idx++;
    }

    res.json({ 
      success: true, 
      db: {
        projects: DEFAULT_PROJECTS,
        news: DEFAULT_NEWS,
        stats: DEFAULT_STATS
      } 
    });
  } catch (err: any) {
    console.error("POST /api/reset-all error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─── VITE STARTER SERVING ───────────────────────────────────────────────────

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
