import React, { useState } from "react";
import { 
  Scale, Users, Home, Wallet, BookOpen, AlertCircle, BookmarkCheck, 
  Calendar, ScrollText, CheckCircle2, XCircle, FileDown, ArrowRight,
  Info, HelpCircle, ShieldCheck, ChevronRight, Calculator, FileText
} from "lucide-react";

export function DocumentRequirements() {
  const [activeSection, setActiveSection] = useState<"doituong" | "nhao" | "thunhap" | "roadmap" | "wizard">("doituong");

  // State for Interactive Evaluation Wizard
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [userGroup, setUserGroup] = useState<string>("");
  const [hasHouse, setHasHouse] = useState<boolean | null>(null);
  const [houseAreaUnder15, setHouseAreaUnder15] = useState<boolean | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<"single" | "single_kid" | "married" | "">("");
  const [incomeValue, setIncomeValue] = useState<number>(0);

  // Helper calculation for result
  const evaluateQualification = () => {
    // Check if group is selected (Students/Businesses have other policies)
    if (!userGroup) return { qualified: false, reason: "Chưa chọn đối tượng ưu tiên phù hợp." };
    if (userGroup === "11") {
      return { qualified: true, reason: "Học sinh/Sinh viên thuộc diện được thuê nhà ở xã hội (nhà công vụ / ký túc xá công lập)." };
    }
    if (userGroup === "12") {
      return { qualified: true, reason: "Doanh nghiệp trong khu công nghiệp được hỗ trợ thuê đất/nhà xưởng theo quy chế riêng." };
    }

    // Housing condition check
    if (hasHouse === true && houseAreaUnder15 === false) {
      return { qualified: false, reason: "Bạn đã có nhà ở riêng và diện tích bình quân đầu người vượt mức tối thiểu 15m² sàn/người." };
    }

    // Income condition check
    if (maritalStatus === "single" && incomeValue > 25000000) {
      return { 
        qualified: false, 
        reason: "Thu nhập thực nhận hằng tháng của cá nhân độc thân vượt quá hạn mức quy định (Tối đa 25 triệu VNĐ/tháng)." 
      };
    }
    if (maritalStatus === "single_kid" && incomeValue > 35000000) {
      return { 
        qualified: false, 
        reason: "Thu nhập thực nhận hằng tháng của cá nhân đơn thân nuôi con nhỏ vượt quá hạn mức quy định (Tối đa 35 triệu VNĐ/tháng)." 
      };
    }
    if (maritalStatus === "married" && incomeValue > 50000000) {
      return { 
        qualified: false, 
        reason: "Tổng thu nhập thực nhận hằng tháng của hai vợ chồng vượt quá hạn mức quy định (Tối đa 50 triệu VNĐ/tháng)." 
      };
    }

    return { 
      qualified: true, 
      reason: "Hồ sơ của bạn bước đầu đáp ứng đầy đủ 3 điều kiện cốt lõi: thuộc nhóm đối tượng được hưởng chính sách, đáp ứng hạn mức diện tích nhà ở tinh gọn và nằm trong ngưỡng thu nhập chịu thuế tối thiểu." 
    };
  };

  const resetWizard = () => {
    setWizardStep(1);
    setUserGroup("");
    setHasHouse(null);
    setHouseAreaUnder15(null);
    setMaritalStatus("");
    setIncomeValue(0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " VNĐ";
  };

  // Mock template documents for downloads
  const sampleDocuments = [
    {
      title: "Mẫu số 01 - Đơn đăng ký mua NOXH",
      desc: "Bản đơn mẫu chuẩn khai báo các thông tin nhân thân, lý do và đề đạt nguyện vọng xét duyệt mua căn hộ trực thuộc Sở Xây dựng.",
      code: "Đơn 01-NOXH",
      size: "245 KB"
    },
    {
      title: "Mẫu số 03 - Xác nhận thực trạng nhà ở",
      desc: "Giấy xin xác nhận tình hình nhà ở và hộ khẩu hiện tại của các thành viên trong gia đình do UBND Phường/Xã chịu trách nhiệm lập biên bản.",
      code: "Đơn 03-NOXH",
      size: "180 KB"
    },
    {
      title: "Mẫu số 04 - Xác nhận điều kiện thu nhập",
      desc: "Mẫu bảng kê chi tiết thu nhập bình quân hằng tháng do thủ trưởng cơ quan, đơn vị công tác hoặc chủ quản doanh nghiệp ký đóng dấu xác nhận đóng thuế.",
      code: "Đơn 04-NOXH",
      size: "195 KB"
    }
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-premium grid grid-cols-1 lg:grid-cols-12 min-h-[680px] text-left">
      
      {/* Side Quick Navigation */}
      <div className="lg:col-span-3 bg-white p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-[#00355f] bg-blue-50 border border-blue-150 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Văn bản pháp luật & Tự Check
            </span>
            <h3 className="font-sans font-black text-[#00355f] text-sm md:text-base leading-snug">
              THỦ TỤC & ĐIỀU KIỆN NOXH
            </h3>
            <p className="font-sans text-[11px] text-slate-500 leading-normal">
              Cập nhật đồng bộ theo Luật Nhà ở 2023 và các Nghị định điều chỉnh sửa đổi mới nhất năm 2026.
            </p>
          </div>

          {/* Upgraded Left Buttons - More Deluxe Card style */}
          <div className="space-y-2 select-none">
            {[
              { id: "wizard", label: "Hệ thống tự kiểm tra", sub: "Interactive Self-Check Tool", icon: Calculator, accent: "border-blue-500" },
              { id: "doituong", label: "1. Đối tượng ưu đãi", sub: "12 nhóm đối tượng hưởng chính sách", icon: Users, accent: "border-emerald-500" },
              { id: "nhao", label: "2. Điều kiện về Nhà ở", sub: "Hạn mức diện tích & Sở hữu", icon: Home, accent: "border-indigo-500" },
              { id: "thunhap", label: "3. Điều kiện về Thu nhập", sub: "Hạn mức thu nhập mới 2026", icon: Wallet, accent: "border-amber-500" },
              { id: "roadmap", label: "Quy trình nộp & Phê duyệt", sub: "Quy trình 5 bước hành chính", icon: Calendar, accent: "border-purple-500" }
            ].map((bt) => {
              const IconComp = bt.icon;
              const isSelected = activeSection === bt.id;
              return (
                <button
                  key={bt.id}
                  onClick={() => setActiveSection(bt.id as any)}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left outline-none ${
                    isSelected
                      ? "bg-[#00355f] text-white shadow-md font-bold scale-[1.02] border-l-4 " + bt.accent
                      : "bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-700"
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isSelected ? "bg-white/10 text-white" : "bg-white text-slate-600 shadow-sm"}`}>
                    <IconComp className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-xs font-bold leading-normal truncate">{bt.label}</div>
                    <div className={`font-sans text-[9px] truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {bt.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal Disclaimer block */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-8">
          <div className="flex gap-2.5 items-start text-[11px] text-slate-600 leading-relaxed font-semibold">
            <AlertCircle className="h-4 w-4 text-[#00355f] shrink-0 mt-0.5" />
            <p className="font-sans">
              <strong>Khuyến cáo pháp lý:</strong> Trình tự công văn thẩm định và biểu mẫu nộp phải được công chứng đúng thẩm quyền địa phương nơi cư dân thường trú hoặc tạm trú dài hạn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Upgraded Content View */}
      <div className="lg:col-span-9 p-6 md:p-10 bg-white flex flex-col justify-between overflow-y-auto max-h-[750px]">
        
        {/* WIZARD: INTERACTIVE ASSESSMENT TOOL */}
        {activeSection === "wizard" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-150 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl shadow-inner">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
                    Hệ thống tự đánh giá sơ bộ điều kiện mua NOXH
                  </h4>
                  <p className="text-[11px] text-slate-500">Trả lời nhanh 3 câu hỏi để biết tỷ lệ hồ sơ được duyệt và thủ tục cụ thể</p>
                </div>
              </div>
              <button 
                onClick={resetWizard}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"
              >
                Làm lại từ đầu
              </button>
            </div>

            {/* Stepper Wizard Indicator */}
            <div className="flex items-center justify-between px-3 md:px-10 py-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
              {[
                { step: 1, label: "Đối tượng", active: wizardStep >= 1 },
                { step: 2, label: "Nhà ở", active: wizardStep >= 2 },
                { step: 3, label: "Thu nhập", active: wizardStep >= 3 },
                { step: 4, label: "Kết quả", active: wizardStep >= 4 }
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[11px] transition-all ${
                      wizardStep === s.step 
                        ? "bg-[#00355f] text-white ring-4 ring-blue-105" 
                        : s.active 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-200 text-slate-500"
                    }`}>
                      {s.step}
                    </span>
                    <span className={`font-sans text-[11px] font-bold hidden sm:inline ${
                      wizardStep === s.step ? "text-[#00355f]" : "text-slate-500"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && <ChevronRight className="h-4 w-4 text-slate-350 hidden sm:block" />}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 1: SELECT FOR GROUP DOITUONG */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-55/10 border border-blue-100 p-4 rounded-xl flex gap-2.5 items-start">
                  <Info className="h-4.5 w-4.5 text-blue-800 shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-slate-700 leading-relaxed font-semibold">
                    <strong>Bước 1:</strong> Chọn nhóm đối tượng thụ hưởng ưu đãi pháp lý của bạn. Theo Luật Nhà ở, chỉ người thuộc 12 nhóm ưu tiên dưới đây mới đủ pháp lý làm thủ tục xét duyệt.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {[
                    { val: "5", label: "Cá nhân thu nhập thấp tại khu vực đô thị" },
                    { val: "6", label: "Công nhân, người lao động tại KCN/Doanh nghiệp" },
                    { val: "7", label: "Sĩ quan, quân nhân, hạ sĩ quan lực lượng vũ trang" },
                    { val: "8", label: "Cán bộ, công chức, viên chức Nhà nước" },
                    { val: "1", label: "Người có công với cách mạng, thân nhân liệt sĩ" },
                    { val: "4", label: "Hộ gia đình nghèo, cận nghèo tại đô thị" },
                    { val: "11", label: "Học sinh, sinh viên tại các trường công lập" },
                    { val: "10", label: "Hộ thu hồi đất, giải tỏa chưa bồi thường bằng nhà ở" }
                  ].map((gp) => (
                    <button
                      key={gp.val}
                      onClick={() => setUserGroup(gp.val)}
                      className={`p-3.5 rounded-xl border text-left font-sans text-xs font-semibold leading-relaxed transition-all cursor-pointer ${
                        userGroup === gp.val
                          ? "bg-blue-50 border-blue-600 text-[#00355f] ring-2 ring-blue-600/10"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {gp.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!userGroup}
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 bg-[#00355f] disabled:bg-slate-200 disabled:text-slate-400 text-white font-sans text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    Tiếp tục chương trình <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: HOUSING CONDITION CORES */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h5 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                    Xác nhận điều kiện bất động sản & sở hữu
                  </h5>
                  <p className="font-sans text-xs text-slate-500">
                    Pháp luật quy định bạn phải chưa có nhà thuộc sở hữu riêng tại Thành phố Đà Nẵng, hoặc có nhà nhưng diện tích bình quân cực kỳ tinh gọn.
                  </p>
                </div>

                {/* Sub Question A */}
                <div className="bg-white border border-slate-200 p-5 rounded-2.5xl space-y-4 shadow-sm">
                  <p className="font-sans text-xs font-bold text-slate-800 leading-relaxed">
                    A. Bạn hoặc/và vợ/chồng (nếu có) có tên trong Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà tại tỉnh/thành phố Đà Nẵng hay chưa?
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      onClick={() => {
                        setHasHouse(true);
                      }}
                      className={`p-3.5 rounded-xl border font-sans text-xs font-bold transition-all ${
                        hasHouse === true 
                          ? "bg-[#00355f] border-[#00355f] text-white" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      Đã có nhà / Đất ở
                    </button>
                    <button
                      onClick={() => {
                        setHasHouse(false);
                        setHouseAreaUnder15(null); // Reset detail question
                      }}
                      className={`p-3.5 rounded-xl border font-sans text-xs font-bold transition-all ${
                        hasHouse === false 
                          ? "bg-[#00355f] border-[#00355f] text-white" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      Chưa có nhà ở nào
                    </button>
                  </div>
                </div>

                {/* Sub Question B (conditional) */}
                {hasHouse === true && (
                  <div className="bg-amber-50/40 border border-amber-200 p-5 rounded-2.5xl space-y-4 animate-fade-down">
                    <p className="font-sans text-xs font-bold text-amber-900 leading-relaxed">
                      B. Tuy đã có nhà ở chung cư/nhà đất, diện tích sàn bình quân hằng tháng đầu người các thành viên cùng đứng tên thường trú có THẤP HƠN 15m² sàn/người hay không?
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <button
                        onClick={() => setHouseAreaUnder15(true)}
                        className={`p-3.5 rounded-xl border font-sans text-xs font-bold transition-all ${
                          houseAreaUnder15 === true 
                            ? "bg-amber-700 border-amber-700 text-white" 
                            : "bg-white border-slate-250 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        Dưới 15m² sàn/người (Đạt)
                      </button>
                      <button
                        onClick={() => setHouseAreaUnder15(false)}
                        className={`p-3.5 rounded-xl border font-sans text-xs font-bold transition-all ${
                          houseAreaUnder15 === false 
                            ? "bg-rose-700 border-rose-750 text-white" 
                            : "bg-white border-slate-250 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        Trên 15m² sàn/người (Quá hạn)
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-200"
                  >
                    Quay lại
                  </button>
                  <button
                    disabled={hasHouse === null || (hasHouse === true && houseAreaUnder15 === null)}
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-2.5 bg-[#00355f] disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    Tiếp tục chương trình <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: INCOME VERIFICATION */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h5 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                    Xác nhận điều kiện thu nhập (Áp dụng từ 2026)
                  </h5>
                  <p className="font-sans text-xs text-slate-500">
                    Chọn tình trạng kết hôn của người làm đơn và kéo thanh trượt thu nhập bình quân hằng tháng sau thuế để đối chứng quy định.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2.5xl space-y-5 shadow-sm">
                  <div className="space-y-3">
                    <p className="font-sans text-xs font-bold text-slate-800">
                      A. Tình trạng hộ tịch & nhân khẩu đăng ký:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { val: "single", label: "Độc thân hưu trí/Lao động", limit: "Tối đa 25tr/tháng" },
                        { val: "single_kid", label: "Đơn thân nuôi con nhỏ", limit: "Tối đa 35tr/tháng" },
                        { val: "married", label: "Đã có gia đình / Cả vợ chồng", limit: "Tối đa 50tr/tháng" }
                      ].map((mr) => (
                        <button
                          key={mr.val}
                          onClick={() => {
                            setMaritalStatus(mr.val as any);
                            // Set dynamic initial defaults for easier drag-slider
                            if (mr.val === "single") setIncomeValue(18000000);
                            else if (mr.val === "single_kid") setIncomeValue(28000000);
                            else setIncomeValue(42000000);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            maritalStatus === mr.val
                              ? "bg-blue-50 border-blue-600 text-[#00355f]"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="font-sans text-xs font-bold">{mr.label}</div>
                          <div className="font-sans text-[10px] text-blue-700 font-extrabold mt-1">{mr.limit}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {maritalStatus && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-down">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="font-sans text-xs font-semibold text-slate-700">
                          B. Tổng thu nhập thực nhận hằng tháng của bạn (và bạn đời nếu có) là bao nhiêu?
                        </label>
                        <span className="font-sans text-sm font-black text-blue-800 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl">
                          {formatCurrency(incomeValue)}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="2000000"
                        max="65000000"
                        step="1000000"
                        value={incomeValue}
                        onChange={(e) => setIncomeValue(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                        <span>2.000.000 đ</span>
                        <span>20.000.000 đ</span>
                        <span>40.000.000 đ</span>
                        <span>60.000.000 đ</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 font-sans text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-200"
                  >
                    Quay lại
                  </button>
                  <button
                    disabled={!maritalStatus}
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-755 text-white font-sans text-xs font-bold rounded-xl flex items-center gap-1 shadow transition-all hover:scale-102 cursor-pointer"
                  >
                    Xem kết quả chính thức <CheckCircle2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL RESULTS & INSTRUCTION FOR TEMPLATE DOWNLOADS */}
            {wizardStep === 4 && (() => {
              const res = evaluateQualification();
              return (
                <div className="space-y-6 animate-fade-up">
                  
                  {/* Verdict Frame */}
                  <div className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 ${
                    res.qualified 
                      ? "bg-emerald-50 border-emerald-250 text-emerald-950" 
                      : "bg-rose-50 border-rose-250 text-rose-950"
                  }`}>
                    <div className="shrink-0">
                      {res.qualified ? (
                        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md">
                          <ShieldCheck className="h-8 w-8 animate-pulse" />
                        </div>
                      ) : (
                        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-md">
                          <XCircle className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                      <span className={`text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border shadow-inner ${
                        res.qualified ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-rose-100 border-rose-300 text-rose-800"
                      }`}>
                        {res.qualified ? "ĐỦ ĐIỀU KIỆN SƠ BỘ" : "KHÔNG ĐỦ ĐIỀU KIỆN"}
                      </span>
                      <h5 className="font-sans font-black text-base md:text-lg">
                        {res.qualified ? "Chúc mừng! Bạn bước đầu đáp ứng chính sách NOXH" : "Hồ sơ chưa đạt tiêu chí của UBND Thành Phố"}
                      </h5>
                      <p className="font-sans text-[12.5px] leading-relaxed text-slate-650 font-medium">
                        {res.reason}
                      </p>
                    </div>
                  </div>

                  {/* Document Requirements Advice */}
                  <div className="bg-white border border-slate-150 rounded-2.5xl p-5 md:p-6 space-y-4">
                    <div className="flex gap-2 items-center">
                      <FileText className="h-5 w-5 text-blue-900" />
                      <h5 className="font-sans font-extrabold text-xs uppercase tracking-wider text-slate-800">
                        CÁC GIẤY BIỂU MẪU CẦN CHUẨN BỊ (BAO GỒM TIẾN TRÌNH):
                      </h5>
                    </div>

                    <p className="font-sans text-xs text-slate-600 leading-relaxed">
                      Để thủ lý hồ sơ lên danh sách bốc thăm căn hộ tại các điểm nóng (như Nhà ở xã hội Hoà Khánh, An Phú Đông), bạn cần hoàn thiện các loại hồ sơ giấy tờ chính thức sau và nộp trực tiếp tại <strong>Tầng 15, Trung tâm Hành chính Thành phố Đà Nẵng</strong>:
                    </p>

                    {/* Form Download Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {sampleDocuments.map((doc, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl flex flex-col justify-between hover:shadow-sm transition-all text-left">
                          <div className="space-y-1.5 mb-4">
                            <span className="text-[9px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded-md">
                              {doc.code}
                            </span>
                            <h6 className="font-sans font-bold text-xs text-slate-900 leading-snug">
                              {doc.title}
                            </h6>
                            <p className="font-sans text-[10.5px] leading-normal text-slate-500">
                              {doc.desc}
                            </p>
                          </div>
                          <button 
                            onClick={() => alert(`Đã kích hoạt tải về mẫu phôi số hóa ${doc.code} định dạng .DOCX. Xin vui lòng ký điền đầy đủ thông tin.`)}
                            className="w-full py-1.5 bg-white border border-slate-250 hover:bg-slate-100 hover:text-black rounded-lg font-sans text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Tải về file phôi ({doc.size})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-4 py-2 bg-slate-150 hover:bg-slate-205 text-slate-750 font-sans text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      Quay lại điều chỉnh
                    </button>
                    <button
                      onClick={resetWizard}
                      className="px-5 py-2 hover:bg-[#00355f] hover:text-white bg-slate-100 text-slate-700 font-sans text-xs font-bold rounded-xl transition-colors border border-slate-200"
                    >
                      Bắt đầu kiểm tra cho người khác
                    </button>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* SECTION 1: DOITUONG */}
        {activeSection === "doituong" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-slate-150 pb-5">
              <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl shadow-inner">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
                  Đối tượng hưởng chính sách nhà ở xã hội
                </h4>
                <p className="text-xs text-slate-500 font-medium">Quy định cơ bản tại Điều 76 Luật Nhà ở ban hành năm 2023</p>
              </div>
            </div>

            <p className="font-sans text-xs md:text-[13px] text-slate-700 leading-relaxed font-semibold bg-slate-100 p-4.5 rounded-2xl border border-slate-200 mb-4">
              ✨ <strong>Luật Nhà ở năm 2023 (Hiệu lực chính thức)</strong> quy định nghiêm ngặt về đối tượng được quyền hưởng các chính sách trợ giá mua/thuê NOXH cụ thể bao gồm 12 nhóm sau đây:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { num: "1", text: "Người có công với cách mạng, thân nhân liệt sĩ thuộc diện ưu đãi cao cấp theo quy định Pháp lệnh người có công." },
                { num: "2", text: "Hộ gia đình nghèo, cận nghèo tại khu vực nông thôn của các tỉnh/thành." },
                { num: "3", text: "Hộ gia đình nông thôn nghèo tại khu vực thường xuyên chịu thiên tai, bão lũ miền Trung hoặc biến đổi khí hậu." },
                { num: "4", text: "Hộ gia đình nghèo, cận nghèo sinh sống tại các khu vực đô thị, thành phố Đà Nẵng." },
                { num: "5", text: "Người lao động có thu nhập thấp dưới diện chịu thuế cá nhân thường xuyên tại khu vực đô thị." },
                { num: "6", text: "Công nhân, người lao động đang làm việc tại doanh nghiệp KCN Đà Nẵng (Hòa Khánh, Liên Chiểu...)." },
                { num: "7", text: "Sĩ quan, quân nhân chuyên nghiệp, hạ sĩ quan lực lượng vũ trang nhân dân, công an đang phục vụ biên tế." },
                { num: "8", text: "Cán bộ, công chức, viên chức Nhà nước trực thuộc các sở, ban ngành đoàn thể thành phố." },
                { num: "9", text: "Đối tượng đã hồi trả lại nhà ở công vụ theo pháp luật đề ra mà chưa sở hữu nhà mới." },
                { num: "10", text: "Hộ gia đình, cá nhân thuộc diện bị thu hồi đất giải tỏa vỉa hè các công trình quận Hải Châu, Sơn Trà... mà chưa nhận đền bù." },
                { num: "11", text: "Học sinh, sinh viên đại học học viện dân tộc nội trú công lập thuê ký túc xá công." },
                { num: "12", text: "Hợp tác xã, liên hiệp hợp tác xã có dự án nhà xưởng muốn bố trí chỗ ở cho xã viên tại KCN." }
              ].map((item) => (
                <div key={item.num} className="bg-white hover:bg-slate-50/70 p-4 border border-slate-200/80 rounded-2xl flex gap-3.5 transition-colors hover:shadow-xs group">
                  <span className="w-7 h-7 rounded-lg bg-blue-105 text-[#00355f] group-hover:bg-[#00355f] group-hover:text-white flex items-center justify-center font-black text-xs shrink-0 transition-colors">
                    {item.num}
                  </span>
                  <p className="font-sans text-xs text-slate-650 leading-relaxed font-semibold">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: NHAO */}
        {activeSection === "nhao" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-slate-150 pb-5">
              <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl shadow-inner">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
                  Điều kiện định danh bất động sản nhà ở
                </h4>
                <p className="text-xs text-slate-500 font-medium">Quy định tại Điều 29 Nghị định số 100/2024/NĐ-CP (Cập nhật năm 2026)</p>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4.5 rounded-2xl border border-blue-150 mb-5">
              <p className="font-sans text-xs md:text-[13px] text-[#00355f] leading-relaxed font-bold">
                📜 Trích Điều 29 Nghị định số 100/2024/NĐ-CP ngày 26/07/2024 sửa đổi của Chính phủ (hợp thể các thông tư thi hành về an sinh nhà ở):
              </p>
            </div>

            <div className="space-y-6">
              
              {/* Point A */}
              <div className="bg-white border border-slate-200 rounded-2.5xl p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] tracking-wide">KHOẢN 1</span>
                  <strong className="font-sans text-xs text-slate-900">Chi tiết trường hợp người đứng đơn chưa có nhà ở sở hữu</strong>
                </div>
                <p className="font-sans text-xs text-slate-650 leading-relaxed font-semibold">
                  "1. Trường hợp chưa có nhà ở thuộc sở hữu của mình được xác định khi đối tượng đứng đơn và vợ hoặc chồng của đối tượng đó (nếu có) được cơ quan công thư văn phòng xác định là không đứng tên hoặc không có nội dung thông tin về sở hữu quyền sử dụng đất, nhà ở gắn liền với đất tại toàn tỉnh, thành phố Đà Nẵng nơi có dự án xã hội đó."
                </p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-155 mt-2.5">
                  <p className="font-sans text-[11px] text-slate-500 leading-normal font-semibold">
                    👉 <strong>Thủ tục kiểm tra:</strong> Trong vòng tối đa 07 ngày làm việc kể từ ngày tiếp nhận, Văn phòng Đăng ký Đất đai Sở Tài nguyên và Môi trường thành phố có thẩm quyền rà soát và cấp văn bản phê chuẩn.
                  </p>
                </div>
              </div>

              {/* Point B */}
              <div className="bg-white border border-slate-200 rounded-2.5xl p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] tracking-wide">KHOẢN 2</span>
                  <strong className="font-sans text-xs text-slate-900">Trường hợp diện tích đất/nhà dưới ngưỡng sống tối thiểu</strong>
                </div>
                <p className="font-sans text-xs text-slate-650 leading-relaxed font-semibold">
                  "2. Trường hợp ứng viên nộp hồ sơ có nhà ở riêng nhưng diện tích nhà ở bình quân đầu người các nhân khẩu thường trú hoặc tạm trú đăng ký cùng căn sổ hộ tịch thấp hơn 15 m² diện tích sàn sử dụng thực tế/người. Tính gộp trên tổng các nhân khẩu bao gồm: người đứng đơn, vợ (chồng), cha mẹ thường trú và con nhỏ dưới tuổi thành niên."
                </p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-155 mt-2.5">
                  <p className="font-sans text-[11px] text-slate-500 leading-normal font-semibold">
                    👉 <strong>Thủ tục xác nhận:</strong> UBND cấp Xã/Phường có trách nhiệm trực tiếp cử cán bộ đô thị phòng ban xuống nhà thẩm định diện tích thực trạng vách tường, sàn gác lửng và cấp giấy mộc xác nhận của Phường.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: THUNHAP */}
        {activeSection === "thunhap" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-slate-150 pb-5">
              <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
                  Điều kiện thu nhập quy chuẩn của người nộp đơn
                </h4>
                <p className="text-xs text-slate-500 font-medium">Quy định tại Điều 30 Nghị định số 100/2024/NĐ-CP (Chỉnh sửa năm 2026)</p>
              </div>
            </div>

            <div className="bg-amber-50/55 p-4 rounded-2xl border border-amber-200 mb-5 text-amber-955 text-xs font-semibold">
              ⚠️ Độc thân được nâng hạn mức thu nhập tối đa lên 25 triệu VNĐ/tháng, và gia đình đã kết hôn là 50 triệu VNĐ/tháng sau thuế thực tế để hỗ trợ người lao động đô thị Đà Nẵng tiếp cận nhà sạch hơn trong suy thoái kinh tế.
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#00355f] font-black text-[10px] uppercase tracking-wider">
                  Điều 30. Điều kiện về thu nhập hằng tháng
                </span>
                <p className="font-sans text-xs font-bold text-slate-500 mt-3">
                  "Để được phê chuẩn duyệt quyền bốc thăm mua căn hộ, người lao động tại khu vực đô thị phải chứng minh thu nhập thực tế thường xuyên như sau:
                </p>
              </div>

              {/* Box A */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <div className="flex gap-2 items-center text-xs font-bold text-[#00355f]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Cư dân độc thân chưa kết hôn</span>
                </div>
                <p className="font-sans text-xs text-slate-650 leading-relaxed pl-6">
                  Thu nhập thực nhận sau thuế bình quân hằng tháng <strong>không quá 25 triệu VNĐ/tháng</strong> (Xác minh qua sao kê lương 6 tháng gần nhất ngân hàng hoặc giấy đóng thuế TNCN).
                </p>
              </div>

              {/* Box B */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <div className="flex gap-2 items-center text-xs font-bold text-[#00355f]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Độc thân có người phụ thuộc (con nhỏ)</span>
                </div>
                <p className="font-sans text-xs text-slate-655 leading-relaxed pl-6">
                  Cơ chế tăng hạn mức mới: Có con nhỏ dưới tuổi lao động cần nuôi nấng được nới trần lên <strong>không quá 35 triệu VNĐ/tháng</strong>.
                </p>
              </div>

              {/* Box C */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <div className="flex gap-2 items-center text-xs font-bold text-[#00355f]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Các đối tượng đã xây dựng gia đình (kết hôn)</span>
                </div>
                <p className="font-sans text-xs text-slate-650 leading-relaxed pl-6">
                  Tổng thu nhập thực tế gộp chung của cả hai vợ chồng ứng viên <strong>không quá 50 triệu VNĐ/tháng</strong> để đủ điều kiện xét duyệt mua căn hộ ưu đãi an sinh.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 4: ROADMAP STEP INDICATORS */}
        {activeSection === "roadmap" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-2.5 border-b border-slate-150 pb-5">
              <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl shadow-inner">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
                  Quy trình 5 bước nộp & Phê duyệt hồ sơ NOXH Đà Nẵng
                </h4>
                <p className="text-xs text-slate-500 font-medium">Quy trình thủ tục hành chính khép kín của Sở Xây dựng để bảo đảm sự minh bạch tối đa</p>
              </div>
            </div>

            <div className="relative border-l-2 border-blue-100 pl-6 ml-4 space-y-8 py-3 text-left">
              {[
                { 
                  step: "BẮT ĐẦU", 
                  title: "Bước 1: Chuẩn bị biểu mẫu & Chứng thực địa phương", 
                  desc: "Ứng viên tải Mẫu 01, Mẫu 03 và Mẫu 04 tại văn phòng điện tử, khai báo thông tin trung thực, đem lên UBND Phường để phòng hộ tịch đối soát mộc đỏ về thực trạng cư trú, nhà đất và đơn vị sử dụng lao động ký xác thực lương.",
                  color: "bg-[#00355f]"
                },
                { 
                  step: "TIẾP NHẬN", 
                  title: "Bước 2: Nộp trực tiếp tại Bộ phận Một cửa Sở Xây dựng", 
                  desc: "Ứng viên mang bộ hồ sơ gốc đã đóng mộc tới Trung tâm hành chính Thành phố (địa chỉ 24 Trần Phú, Q. Hải Châu). Nhân viên quầy dịch vụ hành chính tiếp nhận, cấp mã số biên nhận hồ sơ tra cứu trực tuyến.",
                  color: "bg-blue-800"
                },
                { 
                  step: "THẨM ĐỊNH", 
                  title: "Bước 3: Sở Xây dựng rà soát, đối chiếu loại trừ trùng lặp", 
                  desc: "Sở Xây dựng chuyển danh sách cho các Văn phòng Đăng ký Đất đai thành phố đối chiếu chéo căn cước công dân xem có đứng tên nhà đất nơi khác không. Loại trừ hồ sơ cố tình lách luật.",
                  color: "bg-indigo-700"
                },
                { 
                  step: "CÔNG BỐ", 
                  title: "Bước 4: Công khai danh sách và tổ chức bốc thăm", 
                  desc: "Các hồ sơ đạt tiêu chuẩn sơ bộ sẽ được công khai danh sách minh bạch 20 ngày tại Cổng thông tin của Sở. Sau đó tổ chức ngày bốc thăm vị trí căn hộ ưu đãi có sự giám sát của thanh tra Sở.",
                  color: "bg-emerald-700"
                },
                { 
                  step: "HỢP ĐỒNG", 
                  title: "Bước 5: Ký Hợp đồng mua bán & Đăng ký đóng tiền tiến độ", 
                  desc: "Cư dân may mắn bốc được căn thực hiện ký HĐMB trực tiếp với chủ đầu tư dự án dưới sự giám sát của Sở, đăng ký giải ngân các gói vay tín dụng an sinh xã hội ưu đãi 4.8% của Nhà nước.",
                  color: "bg-purple-700"
                }
              ].map((rd, index) => (
                <div key={index} className="relative space-y-1.5 hover:bg-slate-50 p-4 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                  <span className={`absolute -left-10 top-4 w-7 h-7 rounded-full flex items-center justify-center font-sans font-bold text-[9px] text-white ${rd.color} shadow`}>
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-sans text-[9px] font-extrabold px-2 py-0.5 rounded-md text-white ${rd.color}`}>
                      {rd.step}
                    </span>
                    <h5 className="font-sans font-extrabold text-slate-900 text-xs sm:text-sm">
                      {rd.title}
                    </h5>
                  </div>
                  <p className="font-sans text-xs text-slate-500 leading-relaxed font-semibold">
                    {rd.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Authority footer seal inside document view */}
        <div className="mt-8 pt-4 border-t border-slate-150 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4.5 w-4.5 text-slate-400" />
            <span className="font-sans text-[11px]">Sở Xây dựng thành phố Đà Nẵng áp dụng thẩm duyệt biểu điểm</span>
          </div>
          <span className="font-sans font-extrabold text-[10px] text-[#00355f] tracking-wider uppercase bg-blue-50 border border-blue-150 px-3 py-1 rounded-full">
            Ban hành chính thức 2026
          </span>
        </div>

      </div>

    </div>
  );
}
