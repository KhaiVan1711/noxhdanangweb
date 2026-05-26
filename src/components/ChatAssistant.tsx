import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, X, HelpCircle } from "lucide-react";
import { Message } from "../types";

interface ChatAssistantProps {
  onClose?: () => void;
}

export function ChatAssistant({ onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Dạ chào anh/chị! Em là NOXH Bot - Trợ lý ảo tư vấn Nhà ở Xã hội của thành phố Đà Nẵng. Anh/chị cần em hỗ trợ giải đáp chính sách, điều kiện hồ sơ hay tìm hiểu tiến độ của dự án nào ạ?",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Hòa Khánh còn nhận hồ sơ không?",
    "Hồ sơ mua NOXH Đà Nẵng gồm những gì?",
    "Chưa có hộ khẩu Đà Nẵng mua được không?",
    "Mức thu nhập tối đa được phép mua?"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setErrorText(null);

    // Prepare container for bot message chunks
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
          history: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ tư vấn.");
      }

      // Add empty bot message so we can stream into it
      setMessages((prev) => [...prev, initialBotMsg]);
      setIsLoading(false); // Stop loading indicator once streaming begins!

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
                console.warn("Parse error:", parseErr, cleanLine);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Lỗi máy chủ hoặc mất mạng cơ sở dữ liệu.");

      // Intelligent mock responses when API keys are not ready or offline
      let fallbackText = "Dạ, hệ thống đang bận phản hồi trực tuyến. ";
      const lower = textToSend.toLowerCase();
      if (lower.includes("hòa khánh") || lower.includes("hoa khanh")) {
        fallbackText += "Dự án NOXH Hòa Khánh nằm ở Phường Hòa Khánh Bắc, giá khoảng 9.4 triệu/m², đang thu hồ sơ đợt bổ sung. Bạn cần chuẩn bị Đơn 01, Đơn 03 Phường đóng mộc xác nhận sổ thường trú/tạm trú và hợp đồng lao động tại KCN nha.";
      } else if (lower.includes("khẩu") || lower.includes("ho khau") || lower.includes("tạm trú")) {
        fallbackText += "Nếu chưa có hộ khẩu thường trú tại Đà Nẵng, anh/chị hoàn toàn mua được nếu có Giấy tạm trú CT07/CT08 liên tục từ 1 năm trở lên kèm hợp đồng lao động và Sổ đóng Bảo hiểm Xã hội tại Đà Nẵng trên 12 tháng.";
      } else if (lower.includes("hồ sơ") || lower.includes("giấy tờ") || lower.includes("thủ tục")) {
        fallbackText += "Bộ hồ sơ cơ bản bao gồm: Đơn đăng ký mua NOXH (Mẫu số 01), Giấy chứng nhận thực trạng nhà ở của gia đình được đóng mộc UBND Phường (Mẫu số 03), CCCD công chứng và Hồ sơ cư trú (hộ khẩu thường trú hoặc tạm trú CT07 + Bảo hiểm xã hội Đà Nẵng) trực thuộc Phường Xã.";
      } else if (lower.includes("thu nhập") || lower.includes("tiền") || lower.includes("lương")) {
        fallbackText += "Điều kiện tiên quyết về thu nhập là các đối tượng đăng ký không được thuộc diện phải nộp Thuế thu nhập cá nhân thường xuyên. Nghĩa là tổng thu nhập thực tế chưa đạt tới ngạch chịu thuế của cơ quan thuế nhà nước.";
      } else {
        fallbackText += "Để giải đáp nhanh: NOXH của thành phố Đà Nẵng ưu tiên người thu nhập thấp, viên chức biên chế nhà nước, người lao động tại các KCN chưa sở hữu bất kỳ nhà đất nào trên cả tỉnh thành.";
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => {
        // If initial message hasn't been added yet due to failing early
        const filterBotStub = prev.filter((m) => m.id !== botMsgId);
        return [...filterBotStub, botMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl md:rounded-3xl shadow-2xl flex flex-col h-[520px] md:h-[620px] overflow-hidden">
      
      {/* Chat header panel */}
      <div className="bg-primary-dark p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot className="h-5 w-5 text-accent-cyan" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-primary-dark"></span>
          </div>
          <div className="text-left">
            <h4 className="font-sans font-bold text-xs md:text-sm tracking-wide">
              TRỢ LÝ ẢO TRỰC TUYẾN
            </h4>
            <span className="font-sans text-[10px] text-accent-cyan/90 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Trợ lý NOXH Bot đang hoạt động
            </span>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Messages Feed body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isBot = m.sender === "bot";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isBot ? "justify-start text-left" : "justify-end text-right flex-row-reverse"}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${isBot ? "bg-blue-105 text-primary-dark" : "bg-slate-200 text-slate-800"}`}>
                {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>
              
              <div className="max-w-[75%] space-y-1">
                <div className={`p-3 md:p-3.5 rounded-2xl font-sans text-xs md:text-[13px] leading-relaxed shadow-sm break-words whitespace-pre-line ${
                  isBot 
                    ? "bg-white text-slate-800 hover:shadow-md transition-shadow" 
                    : "bg-primary-dark text-white"
                }`}>
                  {m.text}
                </div>
                <span className="font-sans text-[9px] text-brand-muted px-1.5 block">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start text-left">
            <div className="p-2 bg-blue-105 text-primary-dark rounded-xl shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl shadow-sm text-xs text-brand-muted flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              </span>
              NOXH Bot đang ghi nhận chính sách...
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggestion Chips and Chat Inputs */}
      <div className="bg-white p-4 border-t border-brand-border select-none shrink-0 text-left">
        {/* Suggestion pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-brand-muted rounded-full font-sans text-[11px] font-medium whitespace-nowrap border border-slate-200/60 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Form controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Đặt câu hỏi về thủ tục, dự án, quy trình..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 font-sans text-xs md:text-sm border border-slate-200 hover:border-slate-350 bg-slate-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 bg-primary-dark hover:bg-opacity-95 text-white rounded-xl shadow transition-colors flex items-center justify-center ${
              (!input.trim() || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95 transform duration-150"
            }`}
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
