import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Sparkles, X, 
  Volume2, VolumeX, Trash2, Copy, Check, 
  Calculator, MessageSquare, Mic, MicOff, 
  CheckCircle2, ArrowRight, RotateCcw, AlertTriangle
} from "lucide-react";
import { Message } from "../types";

interface ChatAssistantProps {
  onClose?: () => void;
}

export function ChatAssistant({ onClose }: ChatAssistantProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "calculator">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Score Calculator states
  const [groupPoints, setGroupPoints] = useState<number>(40);
  const [housingPoints, setHousingPoints] = useState<number>(30);
  const [residencePoints, setResidencePoints] = useState<number>(30);

  const groupDetails: Record<number, string> = {
    40: "Lao động khu công nghiệp, Cán bộ, Công chức, Viên chức hoặc Lực lượng vũ trang",
    30: "Hộ nghèo, cận nghèo khu vực đô thị tại Đà Nẵng",
    20: "Người lao động tự do có mức thu nhập thấp chung",
    10: "Các đối tượng khác thuộc diện ưu tiên phụ",
  };

  const housingDetails: Record<number, string> = {
    30: "Chưa có nhà đất, hiện ở thuê cực chật dột dưới 10m²/người",
    20: "Sống chung nhiều thế hệ gia đình dưới 15m²/người",
    15: "Đã có nhà tạm dột nát nguy hiểm xuống cấp",
    0: "Đã có đất trống hoặc nhà tương đối ổn định",
  };

  const residenceDetails: Record<number, string> = {
    30: "Thường trú / Tạm trú trên 3 năm kèm Bảo hiểm xã hội ĐN > 36 tháng",
    20: "Thường trú / Tạm trú trên 1 năm kèm Bảo hiểm xã hội ĐN > 12 tháng",
    0: "Chưa đủ 1 năm cư trú/đóng BHXH tại địa bàn Đà Nẵng",
  };

  const totalCalculatedScore = groupPoints + housingPoints + residencePoints;

  const suggestions = [
    "Hồ sơ mua gồm những gì?",
    "Chưa có hộ khẩu ĐN mua được không?",
    "Hòa Khánh còn nhận hồ sơ không?",
    "Thu nhập tối đa để đăng ký?"
  ];

  // Load chat memory from localStorage on startup
  useEffect(() => {
    const cached = localStorage.getItem("noxh_chat_history_v2");
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        resetToWelcome();
      }
    } else {
      resetToWelcome();
    }
  }, []);

  // Save chat to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("noxh_chat_history_v2", JSON.stringify(messages));
    }
  }, [messages]);

  // Smooth scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, activeTab]);

  const resetToWelcome = () => {
    const welcome: Message = {
      id: "welcome",
      sender: "bot",
      text: "Dạ kính chào anh/chị! Em là NOXH Bot - Trợ lý thông thái của Cổng Tra cứu Nhà ở Xã hội Đà Nẵng.\n\nAnh/chị muốn được hướng dẫn làm hồ sơ, thủ tục đóng thuế, cách tính thang điểm hay tiến độ các dự án ở các quận huyện Liên Chiểu, Ngũ Hành Sơn, Cẩm Lệ ạ?",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([welcome]);
    localStorage.setItem("noxh_chat_history_v2", JSON.stringify([welcome]));
  };

  const clearChatHistory = () => {
    if (window.confirm("Anh/chị có muốn xóa toàn bộ lịch sử tư vấn hiện tại và bắt đầu hội thoại mới?")) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      resetToWelcome();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const botMsgId = Math.random().toString();
    const initialBotMsg: Message = {
      id: botMsgId,
      sender: "bot",
      text: "",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Không kết nối được máy chủ.");
      }

      setMessages((prev) => [...prev, initialBotMsg]);
      setIsLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.slice(6);
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                const chunkText = parsed.text || "";

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, text: m.text + chunkText } : m
                  )
                );
              } catch (parseErr) {
                console.warn(parseErr);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      
      // Smart Fallback
      let fallbackText = "Dạ, hệ thống đang bận phản hồi trực tuyến. ";
      const lower = textToSend.toLowerCase();
      if (lower.includes("hòa khánh") || lower.includes("hoa khanh")) {
        fallbackText += "Dự án NOXH Hòa Khánh nằm ở Phường Hòa Khánh Bắc, giá khoảng 9.4 triệu/m², đang thu hồ sơ bổ sung. Anh/chị cần nộp kèm biểu mẫu Đơn 01 nộp mua và Đơn 03 Phường đóng mộc xác nhận chưa sở hữu nhà riêng tại Đà Nẵng nha.";
      } else if (lower.includes("hộ khẩu") || lower.includes("tạm trú") || lower.includes("thường trú")) {
        fallbackText += "Đúng vậy ạ! Nếu chưa có hộ khẩu thường trú tại Đà Nẵng, anh/chị vẫn đăng ký mua được nếu cung cấp Giấy xác nhận tạm trú mẫu CT07 liên tục từ 1 năm kèm bảng đóng BHXH Đà Nẵng trên 12 tháng.";
      } else if (lower.includes("hồ sơ") || lower.includes("thủ tục") || lower.includes("biểu mẫu")) {
        fallbackText += "Để làm hồ sơ gồm: Đơn đăng ký mua theo mẫu 01 của Bộ Xây dựng, giấy xác nhận tình trạng nhà ở mẫu 03 (UBND Phường phê chuẩn), căn cước công chứng và giấy tờ chứng minh diện thu nhập thấp (không nộp thuế TNCN thường xuyên).";
      } else if (lower.includes("điểm") || lower.includes("chấm điểm") || lower.includes("thẩm định")) {
        fallbackText += "Hội đồng sử dụng thang điểm chuẩn tối đa 100 để xét tuyển: Nhóm đối tượng ưu tiên max 40đ, Khó khăn thực tế nhà ở max 30đ, Thâm niên cư trú và BHXH Đà Nẵng max 30đ. Điểm càng cao cơ hội bốc thăm căn đẹp càng lớn.";
      } else {
        fallbackText += "Hệ thống khuyến cáo anh/chị liên hệ trực tiếp văn phòng một cửa để nộp hồ sơ chuẩn xác nhất. Hãy tránh xa các cò mồi trung gian, trung tâm môi giới đòi cọc bôi trơn vì quy trình xét tuyển hoàn toàn miễn phí!";
      }

      const botFailedMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => {
        const cleaned = prev.filter((m) => m.id !== botMsgId);
        return [...cleaned, botFailedMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Text-To-Speech (Vietnamese read aloud)
  const speakMessage = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Trình duyệt không hỗ trợ tổng hợp giọng nói.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown symbols for speech synthesis friendly reading
    const cleanText = text.replace(/[*#`_\-]/g, "")
                          .replace(/&nbsp;/g, " ")
                          .replace(/đ\b/g, "đồng");
                          
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = 1.0;

    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (Vietnamese dictation microphone)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt di động hoặc máy tính này chưa kích hoạt micro nhận diện tiếng Việt. Bạn vui lòng sử dụng Google Chrome để trải nghiệm tốt nhất!");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput((prev) => prev ? prev + " " + transcript : transcript);
      }
    };

    recognition.onerror = (err: any) => {
      console.warn("Speech recognition error", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Copy message to clipboard helper
  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export calculated eligibility score to client chat input
  const submitScoreToAI = () => {
    const prompt = `Tôi vừa sử dụng Bảng tính tự động của Cổng Tra Cứu và đạt ${totalCalculatedScore}/100 điểm ưu tiên.
- Nhóm đối tượng: ${groupDetails[groupPoints]} (${groupPoints} điểm)
- Thực trạng nhà ở: ${housingDetails[housingPoints]} (${housingPoints} điểm)
- Điều kiện cư trú & BHXH: ${residenceDetails[residencePoints]} (${residencePoints} điểm)

Hãy tư vấn chi tiết cho tôi: Với số điểm này thì cơ hội xem xét hồ sơ của tôi tại các dự án nhà ở xã hội Đà Nẵng thế nào? Dự án nào đang khả thi nhất?`;
    
    setActiveTab("chat");
    handleSendMessage(prompt);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col h-[560px] md:h-[640px] overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="bg-gradient-to-r from-[#00355f] to-[#014c85] px-4 py-3.5 flex justify-between items-center text-white shrink-0 relative">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-white/10 p-2 rounded-xl border border-white/10">
              <Bot className="h-5 w-5 text-accent-cyan" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#00355f] animate-pulse"></span>
          </div>
          <div className="text-left">
            <h4 className="font-sans font-extrabold text-xs md:text-[13px] tracking-wide uppercase flex items-center gap-1">
              Trợ Lý Số NOXH Bot
              <span className="bg-accent-cyan/20 text-accent-cyan text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-accent-cyan/10">AI</span>
            </h4>
            <span className="font-sans text-[10px] text-slate-300 flex items-center gap-1 font-medium">
              <Sparkles className="h-2.5 w-2.5 text-yellow-300 animate-spin-slow" /> Hỗ trợ nộp hồ sơ tự động
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={clearChatHistory}
            title="Làm mới cuộc hội thoại"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB CONTROLS (UPGRADED STYLES) */}
      <div className="flex bg-slate-50 border-b border-slate-150 p-1.5 shrink-0 text-xs font-bold gap-1 select-none">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-white text-[#00355f] shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Trò chuyện AI
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "calculator"
              ? "bg-white text-[#00355f] shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          Tự Tính Điểm
          <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.2 rounded-full">Hot</span>
        </button>
      </div>

      {/* 3. ACTIVE VIEW SPACE */}
      {activeTab === "chat" ? (
        <>
          {/* Chat conversations list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isBot ? "justify-start text-left" : "justify-end text-right flex-row-reverse"}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 border shadow-sm ${
                    isBot 
                      ? "bg-blue-50 text-[#00355f] border-blue-100" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    {isBot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  
                  <div className="max-w-[80%] space-y-1">
                    <div className={`p-3 rounded-2xl font-sans text-xs md:text-[13px] leading-relaxed shadow-sm break-words whitespace-pre-line relative group transition-all duration-300 ${
                      isBot 
                        ? "bg-white text-slate-800 hover:shadow-md border border-slate-150" 
                        : "bg-[#00355f] text-white font-medium"
                    }`}>
                      {m.text}

                      {/* Floating actions utility for bot messages */}
                      {isBot && m.text.length > 5 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 justify-end md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => speakMessage(m.id, m.text)}
                            title={speakingId === m.id ? "Dừng đọc" : "Đọc nội dung này"}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition"
                          >
                            {speakingId === m.id ? (
                              <VolumeX className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(m.id, m.text)}
                            title="Sao chép nội dung"
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="font-sans text-[8px] text-slate-400 px-1 block font-semibold uppercase tracking-wider">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start text-left">
                <div className="p-2 bg-blue-50 text-[#00355f] rounded-xl border border-blue-100 shrink-0">
                  <Bot className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-150 text-xs text-slate-500 flex items-center gap-2 font-medium">
                  <span className="flex gap-1.2 shrink-0">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  </span>
                  Trợ lý đang truy lục dữ liệu NOXH Đà Nẵng...
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* User controls footer */}
          <div className="bg-white p-3 border-t border-slate-150 text-left shrink-0">
            
            {/* Quick chips mapping */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-2.5 py-1.2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-full font-sans text-[10px] font-bold border border-slate-200/50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input area Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-2 items-center"
            >
              {/* Mic Icon for Voice Recognition */}
              <button
                type="button"
                onClick={toggleListening}
                title="Nhận văn bản bằng giọng nói"
                className={`p-2.5 border rounded-xl flex items-center justify-center transition-all ${
                  isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500 scale-105" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-250 cursor-pointer"
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                placeholder={isListening ? "Đang lắng nghe giọng nói của bạn..." : "Đặt câu hỏi về thủ tục, dự án hoặc quy cách tính điểm..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`flex-1 px-3 py-2.5 font-sans text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-105 transition-all placeholder:text-slate-400 ${
                  isListening 
                  ? "border-red-300 bg-red-50/20 text-red-800 placeholder:text-red-300"
                  : "border-slate-200 hover:border-slate-350 bg-slate-50 focus:bg-white"
                }`}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2.5 bg-[#00355f] hover:bg-opacity-95 text-white border border-[#00355f] rounded-xl flex items-center justify-center transition-all shadow ${
                  (!input.trim() || isLoading) ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95 transform duration-150"
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : (
        /* INTERACTIVE ELIGIBILITY WORKSHEET TAB */
        <div className="flex-1 overflow-y-auto p-4 space-y-4.5 bg-slate-50/50 text-left font-sans">
          <div className="bg-[#00355f]/5 border border-[#00355f]/10 p-3 rounded-xl flex gap-2 w-full">
            <CheckCircle2 className="h-5 w-5 text-[#00355f] mt-0.5 shrink-0" />
            <div className="text-left">
              <h5 className="font-sans font-bold text-xs text-[#00355f]">Bảng Tính Điểm Ưu Tiên Mua NOXH</h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Dựa theo thang điểm 100 chính quy được áp dụng tại địa bàn thành phố Đà Nẵng.</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* 1. SELECT GROUP */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Nhóm đối tượng nộp đơn (Tối đa 40 điểm)
              </label>
              <select
                value={groupPoints}
                onChange={(e) => setGroupPoints(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-700"
              >
                <option value={40}>Lao động trong KCN, Công chức, VC Nhà nước hoặc Lực lượng vũ trang (40đ)</option>
                <option value={30}>Hộ nghèo, hộ cận nghèo tại Đà Nẵng (30đ)</option>
                <option value={20}>Người lao động tự do, thu nhập thấp tại thành phố (20đ)</option>
                <option value={10}>Các diện ưu tiên phụ khác (10đ)</option>
              </select>
              <p className="text-[9px] text-slate-400 italic">Hiện trạng: {groupDetails[groupPoints]}</p>
            </div>

            {/* 2. SELECT HOUSING */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                2. Thực trạng nhà ở gia đình (Tối đa 30 điểm)
              </label>
              <select
                value={housingPoints}
                onChange={(e) => setHousingPoints(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-700"
              >
                <option value={30}>Chưa có nhà, đang thuê trọ chật hẹp &lt;10m²/người (30đ)</option>
                <option value={20}>Sống ghép chung hộ lớn &lt;15m²/người (20đ)</option>
                <option value={15}>Nhà riêng đã mục nát, nguy cơ mất an toàn xây dựng (15đ)</option>
                <option value={0}>Đã sở hữu căn hộ nhỏ diện tích đảm bảo cũ (0đ)</option>
              </select>
              <p className="text-[9px] text-slate-400 italic">Hiện trạng: {housingDetails[housingPoints]}</p>
            </div>

            {/* 3. SELECT RESIDENCY & TAX */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                3. Điều kiện cư trú & Đóng bảo hiểm xã hội (Tối đa 30 điểm)
              </label>
              <select
                value={residencePoints}
                onChange={(e) => setResidencePoints(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-700"
              >
                <option value={30}>Đăng ký cư trú ĐN &gt; 3 năm kèm đóng BHXH ĐN &gt; 36 tháng (30đ)</option>
                <option value={20}>Đăng ký cư trú ĐN &gt; 1 năm kèm đóng BHXH ĐN &gt; 12 tháng (20đ)</option>
                <option value={0}>Chưa đạt chuẩn 1 năm cư trú hoặc chưa đóng bảo hiểm xã hội (0đ)</option>
              </select>
              <p className="text-[9px] text-slate-400 italic">Hiện trạng: {residenceDetails[residencePoints]}</p>
            </div>

          </div>

          {/* DYNAMIC METRIC GAUGE DISPLAY */}
          <div className="bg-slate-100/80 border border-slate-200/60 p-4.5 rounded-xl text-center space-y-2 mt-4">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">TỔNG ĐIỂM DỰ KIẾN CỦA ANH/CHỊ</span>
            
            <div className="inline-flex items-end justify-center gap-1.5">
              <span className="font-sans font-extrabold text-[#00355f] text-4xl leading-none">
                {totalCalculatedScore}
              </span>
              <span className="text-slate-400 text-sm font-bold pb-0.5">/ 100 điểm</span>
            </div>

            {/* Visual range status color bars */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1.5 flex gap-0.5">
              <div className="h-full bg-amber-400" style={{ width: `${Math.min(30, totalCalculatedScore)}%` }}></div>
              <div className="h-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(40, totalCalculatedScore - 30))}%` }}></div>
              <div className="h-full bg-blue-600" style={{ width: `${Math.max(0, totalCalculatedScore - 70)}%` }}></div>
            </div>

            {/* Qualitative eligibility interpretation */}
            <div className="text-[11px] text-slate-600 font-semibold pt-1">
              {totalCalculatedScore >= 80 ? (
                <span className="text-blue-700">⭐ Đạt nhóm điểm tối ưu rất cao. Hồ sơ hầu như được xét duyệt nhận bốc thăm đợt đầu!</span>
              ) : totalCalculatedScore >= 50 ? (
                <span className="text-emerald-700">✔️ Cơ hội rất triển vọng. Bạn hoàn toàn đáp ứng các điều kiện của hầu hết dự án Đà Nẵng.</span>
              ) : (
                <span className="text-amber-700">⚠️ Mức điểm tương đối hạn chế. Bạn cần bổ sung ưu tiên thành viên cống hiến hoặc thâm niên cư trú.</span>
              )}
            </div>

            {/* Action launcher CTA button */}
            <button
              onClick={submitScoreToAI}
              className="w-full bg-[#00355f] hover:bg-opacity-95 text-white py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transform duration-150 flex items-center justify-center gap-2 group cursor-pointer pt-3"
            >
              Phân tích cơ hội qua Trợ lý AI <ArrowRight className="h-3.5 w-3.5 text-accent-cyan group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-[9.5px] leading-relaxed text-red-700 font-medium flex gap-1.5 items-start">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>* Chú ý: Kết quả chấm điểm dựa theo các thông tin điền phỏng đoán và chỉ có tính chất tham khảo sơ duyệt để hỗ trợ nộp đơn, không thay thế văn bản thẩm duyệt thực tế của cơ quan có thẩm quyền.</span>
          </div>
        </div>
      )}

    </div>
  );
}
