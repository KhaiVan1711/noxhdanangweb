import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  KeyRound, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  RotateCcw, 
  Sliders, 
  Building, 
  Newspaper, 
  TrendingUp,
  X,
  Check,
  AlertTriangle
} from "lucide-react";
import { Project } from "../types";

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

interface StatItem {
  count: string;
  label: string;
  subDec: string;
  icon: string;
}

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeSubTab, setActiveSubTab] = useState<"projects" | "news" | "stats" | "config">("projects");
  
  // Data lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<Article[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingNews, setEditingNews] = useState<Partial<Article> | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Config states
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const resProj = await fetch("/api/projects");
      if (resProj.ok) setProjects(await resProj.json());

      // Fetch news
      const resNews = await fetch("/api/news");
      if (resNews.ok) setNews(await resNews.json());

      // Fetch stats
      const resStats = await fetch("/api/stats");
      if (resStats.ok) setStats(await resStats.json());

      // Fetch API Key Config
      const resConfig = await fetch("/api/config");
      if (resConfig.ok) {
        const configData = await resConfig.json();
        setMaskedKey(configData.geminiApiKeyMasked || "");
        setHasApiKey(configData.hasApiKey || false);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey })
      });
      if (res.ok) {
        showToast("Đã cập nhật khóa Gemini API Key thành công!");
        setGeminiApiKey("");
        // Reload configurations
        const resConfig = await fetch("/api/config");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setMaskedKey(configData.geminiApiKeyMasked || "");
          setHasApiKey(configData.hasApiKey || false);
        }
      } else {
        alert("Có lỗi xảy ra khi lưu API Key!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Truongkhai171199@") {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Mật khẩu không chính xác! Vui lòng nhập mật khẩu hợp lệ.");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn trả tất cả cơ sở dữ liệu về nguyên bản ban đầu? Điều này sẽ xóa toàn bộ các điều chỉnh hiện tại.")) return;
    
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset-all", { method: "POST" });
      if (res.ok) {
        showToast("Khôi phục cấu hình hệ thống ban đầu thành công!");
        loadAllData();
        // Notify other widgets
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      } else {
        alert("Khôi phục thất bại.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  // Saved structures
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject)
      });

      if (res.ok) {
        setEditingProject(null);
        showToast("Đã lưu thông tin dự án thành công!");
        loadAllData();
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      } else {
        alert("Lỗi lưu dự án!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa dự án này khỏi hệ thống? Trạng thái bản đồ GIS sẽ cập nhật ngay.")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa dự án thành công!");
        loadAllData();
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // News Save / Delete
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingNews)
      });

      if (res.ok) {
        setEditingNews(null);
        showToast("Đã xuất bản/cập nhật tin tức thành công!");
        loadAllData();
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("Bạn thực sự muốn xóa tin tức này?")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã loại bỏ bài viết.");
        loadAllData();
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats Save
  const handleSaveStats = async (index: number, field: string, value: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    setStats(updated);
  };

  const submitStats = async () => {
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats)
      });
      if (res.ok) {
        showToast("Đã cập nhật chỉ số thống kê trên Trang chủ!");
        window.dispatchEvent(new CustomEvent("refresh-noxh-data"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 shadow-xl rounded-[32px] p-8 text-center animate-fade-up">
        <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="font-sans font-black text-slate-800 text-lg uppercase tracking-tight">Khu vực điều hành</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">Xin vui lòng đăng nhập tài khoản Cán bộ Quản trị hệ thống để sửa đổi thông tin trực tiếp</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left relative">
            <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">Mật khẩu xác định cán bộ quản lý</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full text-xs py-3 pl-10 pr-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-[11px] rounded-xl text-left flex items-start gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#00355f] hover:bg-[#002646] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Mở Cánh Cửa Quản Trị
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">

      {/* Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-[250] bg-emerald-600 text-white font-sans px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-slide-in">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span className="text-xs font-extrabold">{successToast}</span>
        </div>
      )}

      {/* Control cabinet header dashboard banner */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6.5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 uppercase border border-blue-200">BẢN REAL-TIME</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00355f]">• PHÂN KHU HÀNH CHÍNH</span>
          </div>
          <h2 className="font-sans font-black text-slate-800 text-base md:text-lg mt-1">CƠ SỞ DỮ LIỆU CHỦ ĐỘNG QUẢN TRỊ</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sửa đổi trực tiếp dự án, tin tức phát biểu, hoặc chỉ số tổng quan mà không viết một dòng mã nào.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleResetDefaults}
            disabled={isResetting}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-150 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Khôi phục dữ liệu gốc</span>
          </button>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        {[
          { id: "projects", label: "Quản lý Dự án", count: projects.length, icon: Building },
          { id: "news", label: "Quản lý Tin tức", count: news.length, icon: Newspaper },
          { id: "stats", label: "Chỉ số Thống kê", icon: Sliders },
          { id: "config", label: "Cấu hình & API Key", icon: KeyRound }
        ].map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`pb-3.5 px-4 font-sans text-xs md:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === sub.id
                  ? "border-[#00355f] text-[#00355f]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{sub.label}</span>
              {sub.count !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                  {sub.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MODULES CONTENT AREA */}
      <div className="text-left bg-transparent">
        
        {/* TAB 1: PROJECTS MANAGEMENT */}
        {activeSubTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2.5xl border border-slate-150 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Tất cả {projects.length} dự án NOXH hiển thị trên GIS Bản đồ</span>
              <button
                onClick={() => setEditingProject({
                  name: "",
                  location: "",
                  investor: "",
                  status: "Đang nhận hồ sơ",
                  price: "~10tr/m²",
                  priceRaw: 10000000,
                  progress: 50,
                  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
                  tag: "receiving",
                  coordinates: { x: 50, y: 50 },
                  lat: 16.05,
                  lng: 108.20,
                  districts: "Phường Hòa Khánh Bắc",
                  scale: "Chung cư quy chuẩn hiện đại",
                  types: "Căn hộ 1-3 phòng ngủ",
                  deadline: "Dự kiến 2027",
                  hotline: "(0236) 3",
                  requirements: [
                    "Chưa đứng tên sở hữu bất động sản tại Đà Nẵng",
                    "Thu nhập thực tế không đóng thuế TNCN thường kỳ"
                  ]
                })}
                className="px-4.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Thêm Dự Án Mới</span>
              </button>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-[#f8fafc] text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-150">
                    <tr>
                      <th className="px-6 py-4">Dự án</th>
                      <th className="px-6 py-4">Phường/Xã</th>
                      <th className="px-6 py-4">Đơn giá</th>
                      <th className="px-6 py-4">Chủ đầu tư / Thiết kế</th>
                      <th className="px-6 py-4">Tiến độ</th>
                      <th className="px-6 py-4">Pháp lý</th>
                      <th className="px-6 py-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <img src={proj.image} alt={proj.name} className="h-10 w-10 object-cover rounded-lg border border-slate-150" />
                            <div>
                              <div className="font-extrabold text-slate-900">{proj.name}</div>
                              <div className="text-[10px] text-slate-400 font-semibold line-clamp-1 mt-0.5">{proj.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 font-bold text-slate-650">{proj.districts}</td>
                        <td className="px-6 py-4.5 font-extrabold text-blue-800">{proj.price}</td>
                        <td className="px-6 py-4.5">
                          <div className="text-slate-600 font-bold max-w-[150px] truncate">{proj.investor}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Hotline: {proj.hotline}</div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[80px]">
                              <div className="bg-emerald-500 h-full" style={{ width: `${proj.progress}%` }}></div>
                            </div>
                            <span className="font-bold text-[10px] text-slate-600">{proj.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            proj.tag === "receiving" ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                            proj.tag === "coming_soon" ? "bg-amber-50 text-amber-700 border border-amber-150" :
                            "bg-blue-50 text-blue-700 border border-blue-150"
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-1.5 hover:bg-slate-100/80 rounded-lg text-slate-600 hover:text-blue-700 transition-colors inline-block cursor-pointer"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors inline-block cursor-pointer"
                            title="Xóa dự án"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEWS MANAGEMENT */}
        {activeSubTab === "news" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2.5xl border border-slate-150 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">Tất cả {news.length} bài viết cập nhật trên trang</span>
              <button
                onClick={() => setEditingNews({
                  title: "",
                  excerpt: "",
                  content: "",
                  date: new Date().toLocaleDateString("vi-VN"),
                  category: "Announcement",
                  categoryLabel: "Thông báo mới",
                  image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
                  author: "Ban Quản lý NOXH Đà Nẵng"
                })}
                className="px-4.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Viết Bài Mới</span>
              </button>
            </div>

            {/* News List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {news.map((item) => (
                <div key={item.id} className="bg-white border border-slate-150 rounded-2.5xl p-5 flex flex-col justify-between shadow-sm relative group">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.title} className="h-20 w-20 object-cover rounded-xl border shrink-0" />
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest leading-none">
                        {item.categoryLabel}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs md:text-sm mt-1.5 leading-snug line-clamp-2">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.excerpt}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Đăng bởi: <b>{item.author}</b> • {item.date}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingNews(item)}
                        className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Sửa bài viết"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STATS REALTIME INDICATORS PANEL */}
        {activeSubTab === "stats" && (
          <div className="bg-white border border-slate-150 rounded-3xl p-6.5 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm md:text-base uppercase">ĐIỀU CHỈNH CHÌA KHÓA BÁO CÁO TRÊN TRANG CHỦ</h3>
              <p className="text-xs text-slate-400 mt-1">Các con số này được liên kết trực tiếp với 4 thẻ tóm tắt năng lực thực tế ở phía dưới trang chủ.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((indicator, index) => (
                <div key={index} className="border border-slate-200 rounded-2.5xl p-5 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 bg-[#00355f] text-white rounded-lg text-[10px] font-bold">Thẻ {index + 1}</div>
                      <span className="text-xs text-slate-400 font-semibold uppercase">{indicator.label}</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Số liệu chỉ thị (count)</label>
                      <input
                        type="text"
                        value={indicator.count}
                        onChange={(e) => handleSaveStats(index, "count", e.target.value)}
                        placeholder="e.g. 15, 12.4k..."
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên tiêu chí (label)</label>
                      <input
                        type="text"
                        value={indicator.label}
                        onChange={(e) => handleSaveStats(index, "label", e.target.value)}
                        placeholder="e.g. Tổng dự án..."
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Mô tả tóm tắt (subDec)</label>
                      <input
                        type="text"
                        value={indicator.subDec}
                        onChange={(e) => handleSaveStats(index, "subDec", e.target.value)}
                        placeholder="e.g. Đang tiếp quản..."
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={submitStats}
                className="px-5 py-3 bg-[#00355f] hover:bg-opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Cập nhật số liệu tức thì</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIG & GEMINI API KEY */}
        {activeSubTab === "config" && (
          <div className="bg-white border border-slate-150 rounded-3xl p-6.5 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm md:text-base uppercase">CẤU HÌNH AI BOT & GEMINI API KEY</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Cài đặt trực tiếp khóa API Gemini AI để kích hoạt chức năng Trợ lý ảo NOXH Bot đa tài năng.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Note / Instruction */}
              <div className="lg:col-span-2 space-y-4 text-xs text-slate-650 leading-relaxed border-r border-slate-100 pr-0 lg:pr-6">
                <div className="p-4 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-blue-700 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wide text-xs mb-1">Cách cấu hình tối ưu trên Render hoặc Máy chủ đám mây</h4>
                    <p className="mb-2">Do bạn đã xuất bản (public) hệ thống này sang Render, cách tốt nhất và bảo mật nhất là đặt biến môi trường trong trang quản lí của Render:</p>
                    <ol className="list-decimal list-inside space-y-1.5 font-medium ml-1">
                      <li>Truy cập vào trang quản trị <b>Render Dashboard</b>.</li>
                      <li>Chọn dịch vụ ứng dụng của bạn (Web Service).</li>
                      <li>Vào tab <b>Environment</b> (Biến môi trường).</li>
                      <li>Thêm một biến mới với tên là <code className="bg-blue-100/80 px-1 border border-blue-250 rounded font-mono text-[11px] font-black">GEMINI_API_KEY</code> và điền giá trị Khóa API của bạn vào đó.</li>
                      <li>Nhấn <b>Save Changes</b> để Render tự động tải lại máy chủ và khởi chạy chatbot tối tân!</li>
                    </ol>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100 text-amber-900 rounded-2xl flex items-start gap-3">
                  <KeyRound className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <h4 className="font-bold uppercase tracking-wide text-xs mb-1">Cách cấu hình nhanh trực tiếp tại đây</h4>
                    <p>Nếu bạn không muốn thay đổi trên Render hoặc muốn cập nhật tức thì phục vụ mục đích test nhanh, bạn có thể lưu trực tiếp Khóa API ngay trong form bên phải. Chìa khóa sẽ được mã hóa và lưu trữ an toàn trong tệp cơ sở dữ liệu <code className="bg-amber-150 px-1 rounded font-mono text-[11px] font-bold">db_noxh.json</code> của dự án của bạn và có thể sử dụng được ngay tức khắc mà không cần khởi động lại máy chủ.</p>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-5 bg-slate-50/50 border border-slate-200/60 p-6 rounded-2.5xl">
                <div>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase mb-1">Trạng thái hiện tại</span>
                  {hasApiKey ? (
                    <div className="flex items-center gap-2 text-emerald-750 font-sans font-extrabold text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ĐÃ CẤU HÌNH ({maskedKey})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-600 font-sans font-extrabold text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span>CHƯA CẤU HÌNH (Chạy chế độ mô phỏng)</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase tracking-wider">Khóa API Mới (Gemini API Key)</label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Nhập khóa AIzaSy... mới để ghi đè"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={savingConfig || !geminiApiKey.trim()}
                      className="flex-1 py-3 bg-[#00355f] hover:bg-[#002646] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{savingConfig ? "Đang lưu..." : "Lưu Khóa API"}</span>
                    </button>
                    
                    {hasApiKey && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Bạn có chắc chắn muốn xóa khóa API Gemini đang lưu? Hệ thống sẽ quay trở lại chế độ mô phỏng.")) return;
                          try {
                            const res = await fetch("/api/config", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ geminiApiKey: "" })
                            });
                            if (res.ok) {
                              showToast("Đã xóa khóa cứu hộ thành công!");
                              const resConfig = await fetch("/api/config");
                              if (resConfig.ok) {
                                const configData = await resConfig.json();
                                setMaskedKey(configData.geminiApiKeyMasked || "");
                                setHasApiKey(configData.hasApiKey || false);
                              }
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3.5 py-3 border border-rose-250 hover:bg-rose-50 text-rose-600 hover:text-rose-705 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PROJECT EDITOR DIALOG MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto text-left relative shadow-2xl border border-slate-200 animate-fade-up flex flex-col">
            
            <HeaderModal 
              title={editingProject.id ? "Hiệu Chỉnh Chi Tiết Dự Án NOXH" : "Thêm Dự Án Xã Hội Mới"}
              onClose={() => setEditingProject(null)} 
            />

            <form onSubmit={handleSaveProject} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Tên dự án *</label>
                  <input
                    required
                    type="text"
                    value={editingProject.name || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                    placeholder="e.g. Chung cư Nhà ở xã hội Sunshine..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Chủ đầu tư (Investor) *</label>
                  <input
                    required
                    type="text"
                    value={editingProject.investor || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, investor: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                    placeholder="e.g. Tập đoàn Hoàn cầu..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Phường/Xã *</label>
                  <select
                    value={editingProject.districts || "Phường Hòa Khánh Bắc"}
                    onChange={(e) => setEditingProject({ ...editingProject, districts: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none bg-white font-semibold"
                  >
                    {[
                      "Phường Hòa Khánh Bắc",
                      "Phường Hòa Hiệp Nam",
                      "Phường Nại Hiên Đông",
                      "Phường Hòa Thọ Đông",
                      "Phường Khuê Mỹ",
                      "Phường Thạch Thang",
                      "Phường Hải Châu I",
                      "Phường Mỹ An",
                      "Xã Hòa Tiến"
                    ].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Đơn giá hiển thị *</label>
                  <input
                    required
                    type="text"
                    value={editingProject.price || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none font-bold"
                    placeholder="e.g. ~9.4tr/m² hoặc Đã tạm hết"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Đơn giá số nguyên (VNĐ/m²)</label>
                  <input
                    type="number"
                    value={editingProject.priceRaw || 0}
                    onChange={(e) => setEditingProject({ ...editingProject, priceRaw: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Địa điểm chi tiết (Vị trí thực địa) *</label>
                <input
                  required
                  type="text"
                  value={editingProject.location || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="Điền tên đường, phường..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Trạng thái hồ sơ *</label>
                  <select
                    value={editingProject.tag || "receiving"}
                    onChange={(e) => {
                      const tag = e.target.value as any;
                      const statusMap = {
                        receiving: "Đang nhận hồ sơ",
                        coming_soon: "Sắp mở bán",
                        completed: "Đã bàn giao"
                      };
                      setEditingProject({ ...editingProject, tag, status: (statusMap as any)[tag] });
                    }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none bg-white font-semibold"
                  >
                    <option value="receiving">Đang nhận hồ sơ</option>
                    <option value="coming_soon">Sắp mở bán</option>
                    <option value="completed">Đã bàn giao</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Tiến độ xây dựng (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProject.progress || 0}
                    onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Tọa độ Vĩ Độ (Latitude)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={editingProject.lat || 16.05}
                    onChange={(e) => setEditingProject({ ...editingProject, lat: parseFloat(e.target.value) || 16.05 })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Tọa độ Kinh Độ (Longitude)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={editingProject.lng || 108.20}
                    onChange={(e) => setEditingProject({ ...editingProject, lng: parseFloat(e.target.value) || 108.20 })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">URL Hình ảnh dự án</label>
                <input
                  type="text"
                  value={editingProject.image || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Quy mô xây dựng</label>
                  <input
                    type="text"
                    value={editingProject.scale || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, scale: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Loại hình căn hộ</label>
                  <input
                    type="text"
                    value={editingProject.types || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, types: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Bốc thăm / Bàn giao dự kiến</label>
                  <input
                    type="text"
                    value={editingProject.deadline || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Hotline tư vấn</label>
                  <input
                    type="text"
                    value={editingProject.hotline || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, hotline: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Xác nhận Lưu dự án</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ARTICLES EDITOR DIALOG MODAL */}
      {editingNews && (
        <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto text-left relative shadow-2xl border border-slate-200 animate-fade-up flex flex-col">
            
            <HeaderModal 
              title={editingNews.id ? "Hiệu chỉnh bài viết" : "Xuất bản tin tức mới"}
              onClose={() => setEditingNews(null)} 
            />

            <form onSubmit={handleSaveNews} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Tiêu đề bài viết *</label>
                <input
                  required
                  type="text"
                  value={editingNews.title || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="e.g. Lộ trình bàn giao căn hộ..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Cơ quan / Tác giả *</label>
                  <input
                    required
                    type="text"
                    value={editingNews.author || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Ngày đăng bài</label>
                  <input
                    type="text"
                    value={editingNews.date || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                    placeholder="e.g. 25/05/2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Danh mục tin tức *</label>
                  <select
                    value={editingNews.category || "Announcement"}
                    onChange={(e) => {
                      const category = e.target.value as any;
                      const catLabels = {
                        Announcement: "Thông Báo Sửa",
                        Policy: "Phân Tích Chính Sách",
                        Construction: "Tiến Độ Công Trình"
                      };
                      setEditingNews({ ...editingNews, category, categoryLabel: (catLabels as any)[category] });
                    }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Announcement">Thông báo sửa</option>
                    <option value="Policy">Phân tích chính sách</option>
                    <option value="Construction">Tiến độ công trình</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">URL Hình ảnh minh họa</label>
                  <input
                    type="text"
                    value={editingNews.image || ""}
                    onChange={(e) => setEditingNews({ ...editingNews, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Mô tả ngắn gọn (Excerpt) *</label>
                <textarea
                  required
                  rows={2}
                  value={editingNews.excerpt || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none resize-none"
                  placeholder="Viết một đoạn khái quát ngắn..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 tracking-wider uppercase block mb-1">Nội dung chi tiết đẩy đủ *</label>
                <textarea
                  required
                  rows={8}
                  value={editingNews.content || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="Nội dung bài viết chi tiết..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 px-1">
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="px-5 py-2.5 border hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Đồng ý Đăng tải</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function HeaderModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
      <h3 className="font-sans font-black text-slate-900 text-sm md:text-base">{title}</h3>
      <button
        onClick={onClose}
        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
