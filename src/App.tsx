import React, { useState, useEffect } from "react";
import { Project } from "./types";
import { ProjectCard } from "./components/ProjectCard";
import { GisMap } from "./components/GisMap";
import { DocumentRequirements } from "./components/DocumentRequirements";
import { NewsSection } from "./components/NewsSection";
import { ChatAssistant } from "./components/ChatAssistant";
import { AdminPanel } from "./components/AdminPanel";
import { 
  Building2, 
  Map, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  HelpCircle, 
  Filter, 
  X,
  MessageSquareCode, 
  Send,
  Building,
  Briefcase,
  Users,
  Compass,
  Download,
  CheckCircle,
  FileText,
  ExternalLink
} from "lucide-react";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs - preserved exactly as requested with added admin mode
  const [activeTab, setActiveTab] = useState<"home" | "map" | "hoso" | "tintuc" | "admin">("home");
  
  // System indicators configuration
  const [stats, setStats] = useState<any[]>([
    { count: "15", label: "Tổng dự án NOXH", subDec: "Đang triển khai quy hoạch", icon: "domain" },
    { count: "12.4k", label: "Tổng số căn hộ", subDec: "Sản phẩm bàn giao", icon: "vpn_key" },
    { count: "8,540", label: "Đơn hồ sơ thụ lý", subDec: "Tiếp nhận trực tiếp ở Sở", icon: "drafts" },
    { count: "92%", label: "Tỷ lệ giải quyết", subDec: "Hoàn thiện duyệt thành công", icon: "task_alt" }
  ]);
  
  // Catalog filters state
  const [searchKey, setSearchKey] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  // Selected GIS details
  const [gisSelectedProject, setGisSelectedProject] = useState<Project | null>(null);

  // Modular Project Details Modal state
  const [modalProject, setModalProject] = useState<Project | null>(null);

  // Floating Chat Assistant Drawer visible
  const [chatOpen, setChatOpen] = useState(false);

  // Hero search trigger simulation
  const [heroSearchText, setHeroSearchText] = useState("");
  const [heroWardText, setHeroWardText] = useState("");

  // FAQ accordion support
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Load project records and statistics dynamically
  const loadMasterData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setGisSelectedProject((currentSelected) => {
            // Keep the currently highlighted project if it still exists in the new list, otherwise default to first
            const exists = data.find((p: any) => p.id === currentSelected?.id);
            return exists || data[0];
          });
        }
      }
    } catch (err) {
      console.error("Lỗi nạp dữ liệu dự án từ máy chủ:", err);
    } finally {
      setLoading(false);
    }

    try {
      const resStats = await fetch("/api/stats");
      if (resStats.ok) {
        const statsData = await resStats.json();
        if (statsData && statsData.length > 0) {
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error("Lỗi nạp chỉ số hoạt động:", err);
    }
  };

  useEffect(() => {
    loadMasterData();

    // Listen for refresh event from Admin Panel for real-time local updates
    window.addEventListener("refresh-noxh-data", loadMasterData);
    return () => window.removeEventListener("refresh-noxh-data", loadMasterData);
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKey(heroSearchText);
    setSelectedWard(heroWardText);
    setActiveTab("map");
    
    // Smooth scroll down to main content catalogs
    const catalogueSec = document.getElementById("main-catalogue-ref");
    if (catalogueSec) {
      catalogueSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Switch to Map & Highlight specific project pin
  const handleShowProjectOnGisMap = (project: Project) => {
    setGisSelectedProject(project);
    setActiveTab("map");
    // Scroll to map context region
    const mapSec = document.getElementById("map-region-anchor");
    if (mapSec) {
      mapSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter projects computation
  const filteredCollection = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchKey.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchKey.toLowerCase()) ||
                          p.investor.toLowerCase().includes(searchKey.toLowerCase());
    const matchesWard = !selectedWard || p.districts.toLowerCase() === selectedWard.toLowerCase();
    const matchesStatus = statusFilter === "all" || p.tag === statusFilter;
    return matchesSearch && matchesWard && matchesStatus;
  });

  const faqs = [
    {
      id: 1,
      q: "Ai được ưu tiên tiếp cận mua nhà ở xã hội (NOXH) tại Đà Nẵng?",
      a: "Theo quy định mới, có 10 nhóm đối tượng ưu tiên mua NOXH bao gồm: Người có công với cách mạng; Cán bộ, công chức, viên chức Nhà nước; Sĩ quan, quân nhân chuyên nghiệp; Công nhân làm việc tại các nhà máy, doanh nghiệp thuộc khu công nghiệp; Hộ nghèo, hộ cận nghèo đô thị; Người thu nhập thấp tại đô thị không chịu thuế TNCN thường xuyên; Học sinh, sinh viên các trường đại học, cao đẳng (gói thuê) và các đối tượng tái định cư đặc biệt khác."
    },
    {
      id: 2,
      q: "Gia đình chưa có hộ khẩu thường trú tại Đà Nẵng có nộp đơn được không?",
      a: "Dạ được! Người ngoại tỉnh hoàn toàn được xét duyệt mua NOXH tại Đà Nẵng nếu đáp ứng hai điều kiện cư trú thay thế: Có đăng ký tạm trú (giấy CT07/CT08) tại TP. Đà Nẵng liên tục từ 12 tháng trở lên; Khai báo và chứng minh có đóng Bảo hiểm Xã hội (BHXH) tỉnh Đà Nẵng tối thiểu 1 năm thông qua đơn vị lao động."
    },
    {
      id: 3,
      q: "Hồ sơ giấy tờ cần đóng dấu chức năng nào để nộp hợp lệ?",
      a: "Tất cả đối tượng mua đều cần chuẩn bị Đơn mẫu số 01 (Đơn xin mua) và đặc biệt là Đơn mẫu số 03 (Xác nhận thực trạng nhà ở và thu nhập). Đơn mẫu số 03 phải được ký kết và đóng dấu mộc đỏ giáp lai bởi UBND Phường/Xã nơi đăng ký thường trú hoặc tạm trú cư trú."
    },
    {
      id: 4,
      q: "Lãi suất ưu đãi khi vay mua Nhà ở Xã hội ở Đà Nẵng là bao nhiêu?",
      a: "Hiện tại, người dân thuộc diện mua NOXH được hỗ trợ vay vốn ưu đãi thông qua Ngân hàng Chính sách Xã hội (VBSP) với lãi suất cố định cực kỳ hỗ trợ: 4.8%/năm, thời hạn hỗ trợ vay tối đa lê tới 25 năm và hỗ trợ giải ngân bảo trợ đến 80% giá trị hợp đồng căn hộ mua."
    },
    {
      id: 5,
      q: "Quy trình tính điểm xét tuyển ưu tiên NOXH hoạt động như thế nào?",
      a: "Sở Xây dựng Đà Nẵng áp dụng thang điểm 100 để thẩm định hồ sơ công bằng: Điểm đối tượng ưu tiên tối đa 40 điểm; Khó khăn về nhà ở hiện tại tối đa 30 điểm; Điều kiện cư trú, thâm niên cống hiến đóng góp tối đa 30 điểm. Các hồ sơ đạt thang điểm cao nhất sẽ được công khai phê duyệt bốc thăm vị trí căn hộ trước."
    }
  ];

  return (
    <div className="bg-[#f9f9fe] text-slate-800 font-sans min-h-screen flex flex-col selection:bg-primary-dark/10 selection:text-primary-dark">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="bg-white/90 backdrop-blur-2xl fixed top-0 w-full z-50 border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-24 px-4 sm:px-10 max-w-7xl mx-auto gap-4">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img 
              alt="Logo" 
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl object-cover shadow-sm bg-[#00355f] p-0.5" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADZtvTLTxoOML8T0CTe1qjQTm-c4pl8zclCN_9aXymkdfptM96UJxPiv0LXnsjVmlMHGV6A7Gp-fSNsp8qpiCi9Fos495UAE1gOCyrUE8xhY03dV7XaoySi3YKM1Q7NL2XuJU2Xs5iuAWeGoAhAN3JeI5lEWT4sZ9O8kfIaS2-mH4agO0pLvd3IO6rdiWuhvl-2d4c3yzbv2UI8OpWxbtYOqo8bKnil_im7Kt8jeuxPeZ73_G8wSy-nC1zq7JzcGnLKtWyQOeIqz4"
            />
            <div className="text-left">
              <span className="font-sans font-black text-[#00355f] text-sm sm:text-base leading-none block uppercase">
                NOXH ĐÀ NẴNG
              </span>
              <span className="font-sans text-[8px] tracking-widest font-bold text-slate-500 uppercase block mt-1">
                Cổng thông tin & bản đồ
              </span>
            </div>
          </div>

          {/* Links and routes navigation tabs */}
          <nav className="flex gap-1.5 sm:gap-2 items-center bg-slate-100 hover:bg-slate-150/80 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-full transition-all border border-slate-200/50 overflow-x-auto scrollbar-none">
            {[
              { id: "home", label: "Trang chủ" },
              { id: "map", label: "Bản đồ" },
              { id: "hoso", label: "Hồ sơ & Điều kiện" },
              { id: "tintuc", label: "Tin tức" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-sans text-[11px] sm:text-xs font-bold transition-all select-none cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#00355f] text-white shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Action trigger buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="p-2.5 bg-blue-50 border border-blue-150 hover:bg-blue-100 text-blue-900 rounded-full transition-all flex items-center justify-center cursor-pointer"
              title="Trò chuyện với Trợ lý ảo"
            >
              <span className="material-symbols-outlined text-[20px] text-blue-800">forum</span>
            </button>
            <button 
              onClick={() => {
                setIsRegisteringUser(true);
              }}
              className="px-5 py-2.5 font-sans font-bold text-xs text-white bg-primary-dark rounded-full hover:bg-opacity-90 hover:scale-102 hover:shadow-md transition-all cursor-pointer shadow"
            >
              Cổng Đăng Ký
            </button>
            <button 
              onClick={() => {
                setActiveTab("admin");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-2.5 font-sans font-bold text-xs rounded-full border transition-all cursor-pointer flex items-center gap-1 shadow ${
                activeTab === "admin"
                  ? "bg-[#00355f] text-white border-[#00355f]"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
              title="Khóa cán bộ quản trị"
            >
              🔑 Quản Trị
            </button>
          </div>

        </div>
      </header>

      {/* Hero Registration dialog mockup */}
      {isRegisteringUser && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl border border-slate-200 animate-fade-up">
            <button 
              onClick={() => setIsRegisteringUser(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Đăng Ký Tài Khoản Công Dân</h4>
              <p className="text-xs text-slate-500 mt-1">Sử dụng để theo dõi điểm hồ sơ và xếp số định danh căn hộ</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsRegisteringUser(false); alert("Chào mừng! Bạn đã đăng ký thành công tài khoản định danh công dân Đà Nẵng."); }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mã Số Định Danh CCCD</label>
                <input required type="text" placeholder="Gồm 12 chữ số hợp lệ..." className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/25 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu bảo mật</label>
                <input required type="password" placeholder="Tối thiểu 6 ký tự..." className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/25 focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#00355f] text-white text-xs font-bold rounded-xl hover:bg-opacity-95 shadow">Thành viên mới Đăng Ký</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MAIN BODY */}
      <main className="flex-1 pt-24">
        
        {activeTab === "home" && (
          <section className="relative min-h-[85vh] flex items-center justify-center pt-12 pb-24 px-4 sm:px-10 overflow-hidden">
            {/* Background Image from Resolved Google Photos */}
            <img
              src="/api/hero-image"
              alt="Cổng thông tin Nhà ở Xã hội Đà Nẵng"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none animate-fade-in"
              referrerPolicy="no-referrer"
            />

            {/* Glass blurring over and deep dim overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#f9f9fe]/90 backdrop-blur-[0.5px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-6">
              
              {/* Display headers */}
              <h1 className="font-sans font-extrabold text-[32px] sm:text-[44px] lg:text-[54px] text-primary-dark lg:leading-[1.15] tracking-tight max-w-5xl animate-fade-up">
                Cổng Tra Cứu Nhà Ở Xã Hội <br /> 
                <span className="text-gradient">Thành phố Đà Nẵng</span>
              </h1>
              
              <p className="font-sans text-sm sm:text-base text-slate-600 max-w-3xl mt-6 mb-10 leading-relaxed font-semibold animate-fade-up">
                Công cụ tra cứu thông tin chính sách, bản đồ quy hoạch GIS định hướng, đánh giá điều kiện sở hữu và theo dõi tiến độ nộp phê duyệt căn hộ công bằng, thực tế cho công dân và người lao động thành phố.
              </p>

              {/* Comprehensive Search Panel */}
              <div className="w-full max-w-4xl glass-panel rounded-3xl p-3 shadow-glass border border-white/60 mb-8 animate-fade-up">
                <form onSubmit={handleHeroSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  
                  {/* Text query input */}
                  <div className="md:col-span-6 relative flex items-center">
                    <Search className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={heroSearchText}
                      onChange={(e) => setHeroSearchText(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/75 hover:bg-white focus:bg-white border-0 focus:ring-2 focus:ring-primary-dark/20 focus:border-0 rounded-2xl font-sans text-xs sm:text-sm shadow-sm transition-all text-slate-800 placeholder:text-slate-400 focus:outline-none animate-pulse-once"
                      placeholder="Nhập tên dự án, chủ đầu tư, phường/xã cần tra..."
                    />
                  </div>

                  {/* Ward selector drop */}
                  <div className="md:col-span-3 relative flex items-center">
                    <MapPin className="absolute left-4 h-4.5 w-4.5 text-blue-600" />
                    <select
                      value={heroWardText}
                      onChange={(e) => setHeroWardText(e.target.value)}
                      className="w-full pl-11 pr-8 py-3.5 bg-white/75 hover:bg-white border-0 rounded-2xl font-sans text-xs sm:text-sm shadow-sm cursor-pointer focus:outline-none text-slate-800"
                    >
                      <option value="">Tất cả Phường/Xã (93 đơn vị)</option>
                      <option value="Phường Hòa Khánh Bắc">Phường Hòa Khánh Bắc</option>
                      <option value="Phường Hòa Hiệp Nam">Phường Hòa Hiệp Nam</option>
                      <option value="Phường Nại Hiên Đông">Phường Nại Hiên Đông</option>
                      <option value="Phường Hòa Thọ Đông">Phường Hòa Thọ Đông</option>
                      <option value="Phường Khuê Mỹ">Phường Khuê Mỹ</option>
                      <option value="Phường Thạch Thang">Phường Thạch Thang</option>
                      <option value="Phường Hải Châu I">Phường Hải Châu I</option>
                      <option value="Phường Mỹ An">Phường Mỹ An</option>
                      <option value="Phường An Hải Bắc">Phường An Hải Bắc</option>
                      <option value="Xã Hòa Tiến">Xã Hòa Tiến</option>
                    </select>
                  </div>

                  {/* Submit trigger button */}
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary-dark hover:bg-opacity-95 text-white rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      Tra cứu ngay
                    </button>
                  </div>

                </form>
              </div>

              {/* Fast link buttons of main resources */}
              <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up">
                <button
                  onClick={() => {
                    setActiveTab("map");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/85 hover:bg-white border border-slate-200 hover:border-slate-350 text-primary-dark font-sans font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-800">map</span>
                  Xem bản đồ quy hoạch số GIS
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab("hoso");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/85 hover:bg-white border border-slate-200 hover:border-slate-350 text-slate-800 font-sans font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-green-700 font-bold">folder_open</span>
                  Xem hồ sơ & điều kiện mua
                </button>
              </div>

            </div>
          </section>
        )}

        {activeTab === "home" && (
          <section className="bg-white border-y border-slate-200 py-24 px-4 sm:px-10 relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
            <div className="max-w-7xl mx-auto relative z-10 text-center">
              
              <span className="text-[10px] bg-blue-50 text-[#00355f] font-bold px-3 py-1 rounded-full border border-blue-150 uppercase tracking-wider block mx-auto w-fit mb-3">
                Dịch vụ trực tuyến
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-primary-dark">
                Hệ thống xử lý thông tin số hóa
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mt-2.5">
                Hỗ trợ công dân tra cứu dữ liệu, khảo sát chính sách tiện lợi và trực tiếp thay vì xếp hàng chờ tại cơ quan hành chính xã phường.
              </p>

              {/* Service boxes grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 text-left">
                {[
                  {
                    id: "map",
                    title: "Tra cứu Bản đồ GIS & Dự án",
                    desc: "Định vị tòa độ thực tế của từng tòa nhà, bán kính liên thông trường học, bệnh viện Đà Nẵng một cách trực quan.",
                    icon: "map",
                    accent: "bg-blue-50 text-blue-800 border-blue-200",
                  },
                  {
                    id: "hoso",
                    title: "Thẩm định Hồ sơ & Điều kiện",
                    desc: "Đối tượng ưu tiên, điều kiện nhà ở dưới 15m² diện tích sàn và hạn mức thu nhập theo pháp luật mới nhất.",
                    icon: "fact_check",
                    accent: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  },
                  {
                    id: "tintuc",
                    title: "Tin tức phát triển mới",
                    desc: "Cập nhật kịp thời quyết sách phân bổ quỹ đất mở bán căn hộ, cảnh giác lừa đảo cọc giữ chỗ và tiến độ thi công.",
                    icon: "newspaper",
                    accent: "bg-purple-50 text-purple-800 border-purple-200",
                  },
                  {
                    id: "chat",
                    title: "Trợ lý ảo tư vấn tự động",
                    desc: "Trò chuyện trực tiếp với trợ lý ảo 'NOXH Bot' được cấu hình bằng trí tuệ nhân tạo thông minh nhất của Sở.",
                    icon: "smart_toy",
                    accent: "bg-amber-50 text-[#00355f] border-amber-200 animate-pulse",
                  },
                ].map((bex, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (bex.id === "chat") {
                        setChatOpen(true);
                      } else {
                        setActiveTab(bex.id as any);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="group bg-white border border-slate-150 p-6.5 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className={`p-2.5 rounded-xl border w-fit mb-5 ${bex.accent} shadow-inner`}>
                        <span className="material-symbols-outlined block text-[24px]">{bex.icon}</span>
                      </div>
                      <h3 className="font-sans font-bold text-slate-900 text-sm md:text-base group-hover:text-primary-dark transition-colors mb-2">
                        {bex.title}
                      </h3>
                      <p className="font-sans text-[11px] md:text-xs text-slate-500 leading-relaxed mb-6">
                        {bex.desc}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-[#00355f] group-hover:translate-x-1.5 transition-transform duration-300">
                      <span>Trải nghiệm ngay</span>
                      <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* 5. VISUALIZER & TABS SECTION */}
        {activeTab !== "home" && (
          <section 
            id="visualizer-container-anchor" 
            className="border-t border-slate-200/50 py-16 px-4 sm:px-10 max-w-7xl mx-auto text-center animate-fade-in"
          >
            {/* ACTIVE TAB VIEWS CONTAINER GRID */}
            <div className="min-h-[500px]">
              {loading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
                  <span className="flex gap-1 mb-2">
                    <span className="w-2 h-2 bg-blue-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-800 rounded-full animate-bounce"></span>
                  </span>
                  <p className="font-sans text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                    Đang đồng bộ dữ liệu dự án từ Sở...
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. VIEW INTERACTIVE MAP & PROJECTS CATALOG */}
                  {activeTab === "map" && (
                    <div className="space-y-12 animate-fade-up" id="map-region-anchor">
                      <div className="text-left bg-blue-50/50 p-4 rounded-2xl border border-blue-150 inline-flex items-center gap-3">
                        <span className="material-symbols-outlined text-[24px] text-blue-900 shrink-0">map</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          💡 <strong>DI CHUYỂN BẢN ĐỒ:</strong> Click vào danh mục các phường xã bên trái Bản đồ GIS hoặc ấn vào các vòng tròn biểu tượng vị trí dự án để cập nhật thông số tọa độ và giá cả dự toán thực tế.
                        </p>
                      </div>

                      <GisMap
                        projects={projects}
                        selectedProject={gisSelectedProject}
                        onSelectProject={(proj) => setGisSelectedProject(proj)}
                        onViewDetails={(id) => {
                          const found = projects.find((p) => p.id === id);
                          if (found) setModalProject(found);
                        }}
                      />

                      {/* Compact Project Cards Grid right under the Map block! */}
                      <div className="pt-12 border-t border-slate-200 text-left" id="main-catalogue-ref">
                        <div className="mb-8 space-y-1">
                          <h3 className="font-sans font-black text-slate-900 text-base md:text-lg uppercase">
                            Danh Sách Toàn Bộ Dự Án Nhà Ở Xã Hội
                          </h3>
                          <p className="text-xs text-slate-500">Khảo sát thông tin quy mô, chủ đầu tư, tiến độ xây dựng của từng phân khu tòa nhà.</p>
                        </div>

                        {/* Filter ribbon */}
                        <div className="bg-white p-5 border border-slate-150 rounded-2.5xl flex flex-col md:flex-row justify-between items-center gap-4 text-left shadow-sm mb-8">
                          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full md:w-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block shrink-0">
                              Bộ lọc trạng thái:
                            </span>
                            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                              {[
                                { tag: "all", label: "Tất cả" },
                                { tag: "receiving", label: "Đang nhận hồ sơ" },
                                { tag: "coming_soon", label: "Sắp mở bán" },
                                { tag: "completed", label: "Đã bàn giao" }
                              ].map((pill, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setStatusFilter(pill.tag)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold select-none transition-colors cursor-pointer ${
                                    statusFilter === pill.tag
                                      ? "bg-primary-dark/10 text-primary-dark border border-primary-dark/20"
                                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {(searchKey || selectedWard || statusFilter !== "all") && (
                            <button
                              onClick={() => {
                                setSearchKey("");
                                setSelectedWard("");
                                setStatusFilter("all");
                              }}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors self-end md:self-center cursor-pointer border border-rose-200/50"
                            >
                              <X className="h-4 w-4" /> Xóa bộ lọc khảo sát
                            </button>
                          )}

                          <span className="font-sans text-xs text-brand-muted tracking-wide font-medium self-end md:self-center">
                            Tìm thấy <span className="font-bold text-slate-900">{filteredCollection.length}</span> dự án phù hợp
                          </span>
                        </div>

                        {filteredCollection.length === 0 ? (
                          <div className="py-20 text-center border border-dashed border-slate-200 bg-white rounded-3xl max-w-lg mx-auto">
                            <span className="material-symbols-outlined text-[48px] text-slate-400 mb-3">apartment_disabled</span>
                            <p className="font-sans text-sm font-semibold text-slate-800">
                              Không tìm thấy dự án nhà ở xã hội phù hợp tiêu chí của bạn.
                            </p>
                            <button
                              onClick={() => {
                                setSearchKey("");
                                setSelectedWard("");
                                setStatusFilter("all");
                              }}
                              className="mt-6 px-4 py-2 bg-primary-dark text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                            >
                              Tải lại tất cả dự án
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCollection.map((proj) => (
                              <div 
                                key={proj.id}
                                onMouseEnter={() => setHoveredProject(proj)}
                                onMouseLeave={() => setHoveredProject(null)}
                                className="transition-transform duration-300"
                              >
                                <ProjectCard
                                  project={proj}
                                  onViewDetails={(id) => {
                                    const found = projects.find((p) => p.id === id);
                                    if (found) setModalProject(found);
                                  }}
                                  onShowLoc={handleShowProjectOnGisMap}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. REQUISITE POLICY DOCUMENTS */}
                  {activeTab === "hoso" && (
                    <div className="animate-fade-up">
                      <DocumentRequirements />
                    </div>
                  )}

                  {/* 3. NEWS FEED ARTICLE LIST */}
                  {activeTab === "tintuc" && (
                    <div className="animate-fade-up">
                      <NewsSection />
                    </div>
                  )}

                  {/* 4. BACK-OFFICE ADMINISTRATIVE PANEL */}
                  {activeTab === "admin" && (
                    <div className="animate-fade-up">
                      <AdminPanel />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {activeTab === "home" && (
          <section className="bg-[#00355f] text-white py-24 px-4 sm:px-10 relative overflow-hidden select-none mb-12">
            {/* Subtle grid pattern block */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00355f] to-slate-905 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00daf3]">
                  Tổng quan tình hình NOXH Đà Nẵng
                </span>
                <h2 className="font-sans font-extrabold text-[28px] sm:text-[36px] mt-2 mb-4">
                  Số liệu hoạt động thực tế thời gian thực
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#8ebdf9] max-w-3xl mx-auto leading-relaxed font-semibold">
                  Bảo đảm sự công khai, minh bạch, liêm chính của cơ quan Nhà nước trong các công tác xét duyệt dự án và chuyển duyệt hồ sơ nộp căn hộ cho công dân thành phố.
                </p>
              </div>

              {/* Grid of indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, idx) => (
                  <div 
                    key={idx}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8.5 rounded-3xl hover:bg-white/10 transition-colors duration-300 flex flex-col items-center text-center group"
                  >
                    <div className="p-3 bg-white/10 text-accent-cyan rounded-2xl w-fit mb-5 shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <span className="material-symbols-outlined block text-[32.5px]">{stat.icon}</span>
                    </div>
                    <div className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
                      {stat.count}
                    </div>
                    <p className="font-sans text-xs font-bold text-accent-cyan uppercase tracking-wider mb-1.5">
                      {stat.label}
                    </p>
                    <p className="font-sans text-[10px] text-slate-300">
                      {stat.subDec}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* IN-DEPTH MODAL LANDING DETAILS COMPONENT */}
        {modalProject && (
          <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-3xl w-full max-h-[92vh] overflow-y-auto text-left relative shadow-2xl border border-slate-200 animate-fade-up">
              
              {/* Image Header with float exit x */}
              <div className="relative h-64 md:h-80 overflow-hidden shrink-0">
                <img
                  alt={modalProject.name}
                  className="w-full h-full object-cover"
                  src={modalProject.image}
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <button
                  onClick={() => setModalProject(null)}
                  className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors cursor-pointer"
                  title="Thoát chi tiết"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                {/* Status tag badge */}
                <span className="absolute top-4 left-4 bg-white px-3.5 py-1.5 rounded-full font-sans text-xs font-bold text-primary-dark shadow-md">
                  {modalProject.status}
                </span>

                <div className="absolute bottom-5 left-6 right-6">
                  <h4 className="font-sans font-black text-white text-xl md:text-2xl leading-snug drop-shadow">
                    {modalProject.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs mt-1 drop-shadow-sm">
                    <MapPin className="h-4 w-4 text-accent-cyan shrink-0" />
                    {modalProject.location}
                  </div>
                </div>
              </div>

              {/* Modal Contents Body list */}
              <div className="p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">CHỦ ĐẦU TƯ CHÍNH THỨC</span>
                    <p className="font-sans font-bold text-slate-800 text-xs md:text-sm">{modalProject.investor}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">ĐƠN GIÁ BÁN DỰ KIẾN</span>
                    <p className="font-sans font-extrabold text-blue-700 text-base md:text-lg">{modalProject.price}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">QUY MÔ DỰ ÁN</span>
                  <p className="font-sans text-xs md:text-[13px] text-slate-700 leading-relaxed font-semibold">
                    {modalProject.scale}
                  </p>
                  <p className="font-sans text-xs md:text-[13px] text-slate-700 leading-relaxed">
                    Thiết kế sản phẩm căn hộ: <strong>{modalProject.types}</strong>. Tiến độ dự tính hoàn tất bàn bàn giao: <strong>{modalProject.deadline}</strong>.
                  </p>
                </div>

                {/* Criteria items required to apply */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">YÊU CẦU THEO CHÍNH SÁCH ĐÀ NẴNG</span>
                  
                  <div className="space-y-2">
                    {modalProject.requirements.map((req, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="font-sans text-xs text-slate-600 leading-relaxed">
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold pt-5">
                  <div className="flex gap-2.5 items-center">
                    <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Đường dây nóng chủ đầu tư</span>
                      <span className="font-sans font-bold text-slate-800">{modalProject.hotline}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                    <button
                      onClick={() => {
                        handleShowProjectOnGisMap(modalProject);
                        setModalProject(null);
                      }}
                      className="px-6 py-2.5 bg-[#00355f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-opacity-95 shadow w-full md:w-auto"
                    >
                      Định vị GIS
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 6. FLOATING CHATBOT AI ASSISTANT LAYOUT */}
        <div className="fixed bottom-6 right-6 z-40 select-none">
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="bg-primary-dark text-white p-4.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transform transition-all flex items-center gap-2 group cursor-pointer relative"
            >
              {/* Small ping glow indicator */}
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-primary-dark"></span>
              
              <span className="material-symbols-outlined text-[24px] text-accent-cyan block animate-pulse">forum</span>
              <span className="font-sans font-extrabold text-xs tracking-wide max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                HỎI TRỢ LÝ ẢO AI
              </span>
            </button>
          ) : (
            <div className="w-[320px] sm:w-[400px] shadow-2xl animate-fade-up">
              <ChatAssistant onClose={() => setChatOpen(false)} />
            </div>
          )}
        </div>

      </main>

      {/* 4. MAIN FOOTER */}
      <footer className="bg-gradient-to-b from-[#011425] to-[#002544] text-slate-300 py-16 sm:py-20 px-6 sm:px-10 mt-auto border-t border-white/5 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-white/10">
            {/* Left side brand column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="font-sans font-black text-white text-lg tracking-wider uppercase">
                  NOXH Đà Nẵng
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                Nền tảng tra cứu thông tin nhà ở xã hội tại thành phố Đà Nẵng.
              </p>
            </div>

            {/* Right side link grid column */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                LIÊN KẾT LIÊN QUAN
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {[
                  { label: "Cổng thông tin Đà Nẵng", url: "https://danang.gov.vn/" },
                  { label: "Sở Xây dựng Đà Nẵng", url: "https://sxd.danang.gov.vn/" },
                  { label: "Trung tâm hành chính công Đà Nẵng", url: "https://dichvucong.danang.gov.vn/" },
                  { label: "Cổng dữ liệu mở Đà Nẵng", url: "https://opendata.danang.gov.vn/" },
                  { label: "NOXH.net", url: "https://noxh.net/" },
                  { label: "Báo Đà Nẵng", url: "https://baodanang.vn/" }
                ].map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="group flex items-center justify-between py-1 text-xs text-slate-300 hover:text-white transition-all duration-200 border-b border-transparent hover:border-slate-500/10 max-w-sm"
                  >
                    <span className="relative pb-0.5 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-450 opacity-60 group-hover:opacity-100 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[11px] text-slate-400 font-medium">
            <p className="tracking-wide">
              © 2026 <strong className="text-slate-300">NOXH Đà Nẵng Smart Portal</strong>
            </p>
            <p className="text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[10px]">
              Ứng dụng công nghệ GIS & Phân tích số liệu thông minh Đà Nẵng
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// User registration trigger popup toggle helper
let isRegisteringUser: boolean = false;
function setIsRegisteringUser(val: boolean) {
  const customEvent = new CustomEvent("toggle-citizen-reg", { detail: val });
  window.dispatchEvent(customEvent);
}

// Subscribe user registration trigger event to connect component
import { useSyncExternalStore } from "react";
const citizenSub = {
  subscribe(cb: () => void) {
    window.addEventListener("toggle-citizen-reg", cb);
    return () => window.removeEventListener("toggle-citizen-reg", cb);
  },
  getSnapshot() {
    return isRegisteringUser;
  }
};

function useCitizenReg() {
  const state = useSyncExternalStore(citizenSub.subscribe, citizenSub.getSnapshot);
  const [localVal, setLocalVal] = useState(false);
  useEffect(() => {
    setLocalVal(state);
  }, [state]);
  return [localVal, (val: boolean) => { isRegisteringUser = val; window.dispatchEvent(new CustomEvent("toggle-citizen-reg")); }] as const;
}
