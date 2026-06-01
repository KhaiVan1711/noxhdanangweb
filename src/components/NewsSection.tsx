import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Search, 
  Calendar, 
  FileText, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Tag, 
  Layers, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  Cpu, 
  Compass, 
  Globe, 
  Sparkles, 
  User,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "Policy" | "Announcement" | "Construction";
  categoryLabel: string;
  image: string;
  author: string;
}

const fallbackArticles: Article[] = [
  {
    id: "news-1",
    title: "Đà Nẵng công bố đề án phát triển 10.000 căn hộ nhà ở xã hội đến năm 2030",
    excerpt: "UBND thành phố vừa thông qua lộ trình phân bổ quỹ đất xây dựng định hướng chuỗi dự án trọng vùng tại các xã phường trọng điểm nhằm đảm bảo nơi an cư cho người lao động, gia đình cận nghèo địa phương.",
    content: `Chiều ngày 20/5/2026, UBND TP. Đà Nẵng đã chính thức ký duyệt Đề án quy hoạch tổng thể nhà ở xã hội (NOXH) giai đoạn 2026 - 2030. 

Mục tiêu cụ thể của đề án là hoàn thiện xây dựng ít nhất 10.000 căn hộ chất lượng cao với các chính sách trợ giá hấp dẫn. Trong đó, tập trung khai thác đồng bộ các khu đô thị vệ tinh xung quanh Phường Hòa Khánh Bắc, Phường Hòa Hiệp Nam và dọc theo các trục giao thông chính của thành phố.

Sở Xây dựng Đà Nẵng sẽ đóng vai trò chủ trì điều phối quỹ đất công, thực hiện đấu thầu chủ đầu tư công khai, minh bạch nhằm bảo đảm tiêu chuẩn an toàn kỹ thuật xây dựng và thời gian bàn bàn giao đúng hạn. Người dân thuộc diện độc thân thu nhập dưới 25 triệu/tháng hoặc đã kết hôn dưới 50 triệu/tháng sẽ được ưu tiên bốc thăm quỹ nhà đợt đầu.`,
    date: "20/05/2026",
    category: "Announcement",
    categoryLabel: "Thông Báo Sắp Mở",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    author: "Văn phòng Sở Xây dựng Đà Nẵng"
  },
  {
    id: "news-2",
    title: "Hướng dẫn xác nhận điều kiện nhà ở bình quân đạt chuẩn dưới 15m² sàn/người",
    excerpt: "Cẩm nang chi tiết hướng dẫn công dân nộp đơn trực tiếp tại cơ quan UBND Phường/Xã để lấy đóng dấu mộc xác nhận diện tích nhà ở bình quân theo Nghị định số 54/2026/NĐ-CP mới ban hành.",
    content: `Theo Nghị định số 54/2026/NĐ-CP của Chính phủ chính thức áp dụng sửa đổi Luật Nhà ở, điều kiện về thực trạng nhà ở của hộ gia đình chính thức nâng hạn mức diện tích bình quân đầu người lên tối đa 15 m² sàn/người (thay vì 10 m² sàn như quy định cũ).

Đây là tin vui lớn, mở rộng cửa cho hàng nghìn hộ gia đình khó khăn có đông con em sinh sống chen chúc tại khu vực đô thị Đà Nẵng có cơ hội tiếp cận NOXH.

**Quy trình hồ sơ xin xác nhận:**
1. Người đứng đơn tải xuống Mẫu Đơn xác nhận diện tích nhà ở bình quân (Mẫu 03 Phụ lục Nghị định).
2. Kê khai đúng danh sách thành viên cùng đăng ký thường trú tại căn nhà hiện tại.
3. Nộp hồ sơ tại UBND cấp Xã/Phường nơi đăng ký thường trú. UBND cấp xã có nhiệm vụ xác minh thực tế, phản hồi giải quyết đóng dấu đỏ phê duyệt trong thời hạn tối đa 07 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.`,
    date: "14/05/2026",
    category: "Policy",
    categoryLabel: "Phân Tích Chính Sách",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    author: "Phòng Quản lý nhà và thị trường Bất Động Sản"
  },
  {
    id: "news-3",
    title: "Danh sách bốc thăm đợt 1 dự án chung cư NOXH tại Phường Hòa Khánh Bắc",
    excerpt: "Công khai kết quả thẩm định điểm và công bố số lượng căn hộ bốc thăm cụ thể thuộc Dự án Căn hộ Sun Garden Hòa Khánh. Tổng cộng có 350 căn hoàn tất bàn bàn giao kỹ thuật.",
    content: `Sở Xây dựng thành phố Đà Nẵng đã phối hợp cùng Công ty Liên doanh Phát triển Đô thị Sun Garden tổ chức nghiệm thu kỹ thuật và công bố danh sách hộ gia đình đủ điều kiện vào vòng bốc thăm đợt 1.

Dự án Sun Garden Hòa Khánh ghi nhận 1.200 hồ sơ nộp đăng ký đợt 2, qua đó Sở đã thẩm duyệt rút gọn và xếp tuyển thang điểm 100 chọn ra 350 hộ gia đình đạt điểm số cao nhất (đáp ứng trọn vẹn điểm ưu tiên công nhân và khó khăn về nhà ở hiện trạng).

Buổi lễ bốc thăm căn hộ sẽ diễn ra công khai dưới sự giám sát trực tiếp của cơ quan thanh tra thành phố vào sáng ngày 01/06/2026 tại Nhà văn hóa Phường Hòa Khánh Bắc và truyền hình trực tuyến qua cổng dữ liệu thông tin đại chúng.`,
    date: "05/05/2026",
    category: "Construction",
    categoryLabel: "Tiến Độ Dự Án",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    author: "Hội đồng Thẩm định dự án Đà Nẵng"
  }
];

export function NewsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  
  const loadNewsData = () => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(fallbackArticles);
        }
      })
      .catch((err) => {
        console.error("Lỗi kết nối API Server:", err);
        setArticles(fallbackArticles);
      });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "news"),
      (snapshot) => {
        const liveArticles = snapshot.docs.map((doc) => doc.data() as Article);
        liveArticles.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
        if (liveArticles.length > 0) {
          setArticles(liveArticles);
        } else {
          loadNewsData();
        }
      },
      (error) => {
        console.error("News real-time subscription error:", error);
        loadNewsData(); // Fallback
      }
    );

    window.addEventListener("refresh-noxh-data", loadNewsData);
    return () => {
      unsubscribe();
      window.removeEventListener("refresh-noxh-data", loadNewsData);
    };
  }, []);

  // Filters & Search
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return articles.length;
    return articles.filter(a => a.category === catId).length;
  };

  // Split featured (latest) and list
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const standardArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up relative">
      


      {/* Detail View Modal (Premium Reader View) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[200] bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left shadow-2xl border border-slate-200 animate-scale-up">
            
            {/* Header image area */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                src={selectedArticle.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent"></div>
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-950/40 hover:bg-slate-950/60 rounded-full text-white transition-all cursor-pointer backdrop-blur-sm shadow border border-white/15"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              
              <div className="absolute bottom-5 left-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider shadow">
                  <Tag className="w-3 h-3" />
                  {selectedArticle.categoryLabel}
                </span>
                <h4 className="font-sans font-extrabold text-white text-lg md:text-xl leading-tight mt-2 max-w-xl text-shadow-sm">
                  {selectedArticle.title}
                </h4>
              </div>
            </div>

            {/* Content body layout */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 font-sans border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center gap-2 font-bold text-slate-500">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Ngày đăng: {selectedArticle.date}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                  <User className="h-3.5 w-3.5 text-blue-500/70" />
                  <span>{selectedArticle.author}</span>
                </div>
              </div>

              <div className="text-slate-700 font-sans text-[13px] md:text-sm leading-relaxed whitespace-pre-line space-y-4">
                {selectedArticle.content}
              </div>

              {/* Automation notice inside reading panel */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-start gap-3">
                <Cpu className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase block">Hệ thống đồng bộ tin tức</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Bài viết này được quản lý và cập nhật qua API tự động bảo mật. Bạn có thể kết nối bất kỳ hệ thống ngoài (n8n, Make, Custom Python Scraper) qua Webhook Token đã được cấu hình.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky close action footer bar */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-sm flex justify-end shrink-0">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-slate-900 border border-slate-950 text-white hover:bg-slate-850 font-sans font-bold text-xs rounded-xl cursor-pointer shadow transition-all active:scale-[0.98]"
              >
                Đóng bài viết
              </button>
            </div>

          </div>
        </div>
      )}



      {/* ── CENTRALIZED FILTER AND SEARCH CONTROLLER ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
              Kênh Tin Tức & Phân Tích Địa Ốc NOXH ĐÀ NẴNG
            </h3>
            <p className="text-slate-400 text-[10.5px] font-medium leading-none mt-1">Đồng bộ chính thức dữ liệu quy hoạch Nhà ở Xã hội thành phố</p>
          </div>
        </div>

        {/* Categories sliding tabs with counters */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 shrink-0 items-center">
          {[
            { id: "all", label: "Tất cả" },
            { id: "Announcement", label: "Thông báo" },
            { id: "Policy", label: "Chính sách" },
            { id: "Construction", label: "Tiến độ" }
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 font-sans text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-950/15"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500 font-bold"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ARTICLES FEED PRESENTATION (FEATURED + GRID) ── */}
      <div className="space-y-6">
        
        {/* Featured Post (Full-Bleed Header Design) */}
        {featuredArticle && activeCategory === "all" && searchQuery === "" && (
          <div 
            onClick={() => setSelectedArticle(featuredArticle)}
            className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer flex flex-col md:grid md:grid-cols-12 max-w-full text-left"
          >
            {/* Banner block */}
            <div className="md:col-span-7 h-64 md:h-96 relative overflow-hidden shrink-0">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent"></div>
              
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow border border-amber-400/20 z-10 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Tin nổi bật
              </span>
            </div>

            {/* Content summary block */}
            <div className="md:col-span-5 p-6 md:p-10 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-slate-50/50">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 text-slate-400 font-sans text-[11px] font-bold">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-700 shrink-0 select-none uppercase">
                    {featuredArticle.categoryLabel}
                  </span>
                  <span>{featuredArticle.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.max(2, Math.ceil(featuredArticle.content.split(' ').length / 150))} phút đọc
                  </span>
                </div>
                
                <h4 className="font-sans font-black text-slate-900 text-md sm:text-lg md:text-[20px] leading-snug group-hover:text-blue-700 transition-colors">
                  {featuredArticle.title}
                </h4>
                
                <p className="font-sans text-xs text-slate-500 leading-relaxed line-clamp-4">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-700">
                <div className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/50 px-4 py-2 rounded-2xl transition">
                  Đọc toàn văn <ArrowRight className="h-3.5 w-3.5 text-blue-700 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic">Sở Xây dựng ĐN</span>
              </div>
            </div>
          </div>
        )}

        {/* Standard News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* If looking at all news, standard list renders index 1+, otherwise we render everything if filtered */}
          {(activeCategory !== "all" || searchQuery !== "" ? filteredArticles : standardArticles).map((art) => {
            const estRead = Math.max(1, Math.ceil(art.content.split(' ').length / 150));
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden relative shrink-0">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-xl text-[10px] font-black text-slate-900 tracking-wider shadow border border-slate-100 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-600" /> {art.categoryLabel}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[10.5px] font-bold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{art.date}</span>
                      <span className="text-slate-300">•</span>
                      <span>{art.author}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-semibold">{estRead} phút đọc</span>
                    </div>
                    
                    <h4 className="font-sans font-extrabold text-slate-900 text-xs sm:text-[13px] md:text-[14px] leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    
                    <p className="font-sans text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-700 self-stretch">
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Đọc chi tiết <ArrowRight className="h-3.5 w-3.5" /></span>
                    <span className="text-[10px] text-slate-400 font-medium">Bản tin nhanh</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state fallback screen */}
        {filteredArticles.length === 0 && (
          <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-xl max-w-lg mx-auto">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-sans font-extrabold text-xs text-slate-800 uppercase tracking-widest">Không tìm thấy bản tin tương ứng</p>
            <p className="font-sans text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Hãy thay đổi từ khóa lọc tìm kiếm hoặc nhấn nút mô phỏng n8n ở trên để tự sinh tin tức bằng AI ngay!</p>
          </div>
        )}

      </div>

    </div>
  );
}
