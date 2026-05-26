import React, { useState, useEffect } from "react";
import { Search, Calendar, FileText, ArrowRight, BookOpen, Clock, Tag } from "lucide-react";

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
    categoryLabel: "Thông Báo Sửa",
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
  },
  {
    id: "news-4",
    title: "Cảnh báo mạo danh chuyên viên ban ngành Sở để nhận tiền 'cọc giữ chỗ' nhà ở xã hội",
    excerpt: "Sở Xây dựng Đà Nẵng đưa ra thông báo khẩn cấp khuyến cáo người lao động tránh các hội nhóm môi giới thu phí hoa hồng để đặt chỗ mua căn hộ trái luật.",
    content: `Sở Xây dựng thành phố Đà Nẵng vừa phát đi thông báo khẩn số 112/TB-SXD về việc phát hiện một số đối tượng, sàn giao dịch bất động sản mạo danh là chuyên viên Ban chính sách nhà ở để thu nhận phí dịch vụ, tiền cọc 'đảm bảo 100% bốc trúng' căn hộ NOXH tại khu vực Phường Khuê Mỹ.

Sở Xây dựng tái khẳng định:
- Tất cả quy trình tiếp nhận, hướng dẫn khai phôi đơn và thẩm duyệt chấm điểm hồ sơ hoàn toàn **MIỄN PHÍ** 100%.
- Không hề có bất kỳ ủy quyền môi giới trung gian cho bất kỳ đơn vị sàn thương mại tự do nào.
- Mọi hình thức hứa hẹn giữ chỗ đóng tiền mặt đều là hành vi gian lận pháp luật, người dân khi phát hiện vui lòng trình báo ngay cho cơ quan công an phường gần nhất để kịp thời can thiệp xử lý hình sự.`,
    date: "28/04/2026",
    category: "Announcement",
    categoryLabel: "Tin Cảnh Giác",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
    author: "Văn phòng Thanh tra xây dựng thành phố"
  }
];

export function NewsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  // Periodically listen to event changes to instantly keep updated in multi-tab syncing
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
    loadNewsData();

    // Custom event to force internal trigger in single-page updates
    window.addEventListener("refresh-noxh-data", loadNewsData);
    return () => window.removeEventListener("refresh-noxh-data", loadNewsData);
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      
      {/* Detail view Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto text-left relative shadow-2xl border border-slate-200 animate-fade-up">
            
            <div className="relative h-56 overflow-hidden">
              <img
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                src={selectedArticle.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              
              <div className="absolute bottom-4 left-6">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                  {selectedArticle.categoryLabel}
                </span>
                <h4 className="font-sans font-black text-white text-md md:text-lg leading-snug mt-1 max-w-xl">
                  {selectedArticle.title}
                </h4>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-sans border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  <span>Ngày đăng: {selectedArticle.date}</span>
                </div>
                <span>Tác giả: {selectedArticle.author}</span>
              </div>

              <div className="text-slate-700 font-sans text-xs md:text-sm leading-relaxed whitespace-pre-line space-y-3">
                {selectedArticle.content}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 bg-primary-dark hover:bg-opacity-95 text-white font-sans font-bold text-xs rounded-xl cursor-pointer shadow-sm"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main filter categories header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4.5 border border-slate-150 rounded-2.5xl shadow-sm text-left">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="font-sans font-bold text-slate-800 text-sm md:text-base uppercase tracking-tight">
            TIN TỨC PHÁT TRIỂN & CHÍNH SÁCH NOXH ĐÀ NẴNG
          </h3>
        </div>

        {/* Categories toggler */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: "all", label: "Tất cả" },
            { id: "Announcement", label: "Thông báo sửa" },
            { id: "Policy", label: "Thông tin chính sách" },
            { id: "Construction", label: "Tiến độ công trình" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 font-sans text-xs rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-primary-dark text-white font-bold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of articles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5 text-left">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="group bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={art.image}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-bold text-primary-dark tracking-wider border border-slate-200 uppercase">
                {art.categoryLabel}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[10px] font-bold">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{art.date}</span>
                  <span className="text-slate-300">•</span>
                  <span>{art.author}</span>
                </div>
                <h4 className="font-sans font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                  {art.title}
                </h4>
                <p className="font-sans text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:translate-x-1.5 transition-transform duration-300 self-start">
                <span className="flex items-center gap-1">Đọc chi tiết <ArrowRight className="h-3 w-3" /></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl max-w-md mx-auto">
          <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="font-sans font-semibold text-xs text-slate-700">Không tìm thấy tin tức tương ứng.</p>
          <p className="font-sans text-[10px] text-slate-400 mt-1">Hãy đổi từ khóa tìm kiếm hoặc lọc danh mục khác.</p>
        </div>
      )}

    </div>
  );
}
