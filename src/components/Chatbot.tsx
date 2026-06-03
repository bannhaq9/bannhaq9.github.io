/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, User, Home, AlertCircle, Sparkles } from "lucide-react";
import { Property, CustomerLead } from "../types";

interface ChatbotProps {
  properties: Property[];
  onAddLead: (lead: CustomerLead) => void;
  onSelectProperty: (id: string) => void;
}

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
  propertyId?: string;
}

export default function Chatbot({ properties, onAddLead, onSelectProperty }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [leadState, setLeadState] = useState<{ step: "none" | "name" | "phone"; tempName?: string; tempPhone?: string; propertyOfInt?: string }>({
    step: "none"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        sender: "bot",
        text: "Xin chào! Em là Trợ lý Ảo Thanh Trà BĐS, rất vui được hỗ trợ quý khách hàng 24/7. Trà có các giỏ hàng nhà phố Thủ Đức giá cực tốt. Quý khách đang tìm kiếm phân khúc nào ạ?",
        timestamp: new Date(),
        suggestions: [
          "Tìm nhà dưới 5 tỷ",
          "Nhà quận Thủ Đức cũ",
          "Khu Long Trường Lò Lu",
          "Liên hệ ký gửi nhà đất"
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate thinking then respond
    setTimeout(() => {
      generateResponse(text);
    }, 700);
  };

  const generateResponse = (input: string) => {
    const rawInput = input.toLowerCase().trim();
    let replyText = "";
    let suggestions: string[] = [];
    let matchedPropId: string | undefined = undefined;

    // Lead Capture flow
    if (leadState.step === "name") {
      setLeadState(prev => ({ ...prev, step: "phone", tempName: input }));
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Cảm ơn anh/chị ${input} ạ! Quý khách vui lòng cho Trà xin số điện thoại (Zalo) để gửi sổ đỏ tài sản và tư vấn chuyên sâu hơn nhé.`,
          timestamp: new Date()
        }
      ]);
      return;
    }

    if (leadState.step === "phone") {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      const cleanPhone = input.replace(/\s+/g, "");
      const isPhoneValid = phoneRegex.test(cleanPhone) || cleanPhone.length >= 10;

      if (!isPhoneValid) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Dạ, số điện thoại có vẻ không hợp lệ, quý khách vui lòng nhập lại số điện thoại 10 chữ số để Trà tiện liên lạc nhé.",
            timestamp: new Date()
          }
        ]);
        return;
      }

      // We got all lead info! Create lead
      const newLead: CustomerLead = {
        id: `lead_${Date.now()}`,
        name: leadState.tempName || "Khách vãng lai",
        phone: cleanPhone,
        note: `Quan tâm: ${leadState.propertyOfInt || "Tư vấn chung qua Chatbot"}`,
        propertyTitle: leadState.propertyOfInt,
        source: "chatbot",
        created_at: new Date().toISOString(),
        status: "new"
      };

      onAddLead(newLead);
      setLeadState({ step: "none" });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `🎉 Tuyệt vời! Trà đã nhận được thông tin đăng ký tư vấn của anh/chị ${leadState.tempName} (${cleanPhone}). Nhân viên Thanh Trà BĐS sẽ trực tiếp gọi điện/Zalo hỗ trợ trong ít phút tới ạ!`,
          timestamp: new Date(),
          suggestions: ["Xem lại danh sách nhà", "Nhắn tin Zalo trực tiếp"]
        }
      ]);
      return;
    }

    // Direct Keywords
    if (rawInput.includes("dưới 5 tỷ") || rawInput.includes("dưới 5 tỉ") || rawInput.includes("5 ty") || rawInput.includes("5 tỉ")) {
      const cheapProps = properties.filter(p => p.price <= 5);
      if (cheapProps.length > 0) {
        replyText = `Dạ, hiện Trà đang có ${cheapProps.length} căn giá cực tốt dưới 5 tỷ đồng tại Thủ Đức. Quý khách bấm vào để xem ngay detail nhé:`;
        cheapProps.forEach(p => {
          replyText += `\n🏠 ${p.tieu_de} (${p.price} Tỷ - DT: ${p.area}m²)`;
        });
        suggestions = cheapProps.map(p => `Chi tiết: ${p.id}`);
      } else {
        replyText = "Hiện giỏ hàng dưới 5 tỷ đang tạm hết, Trà sẽ cập nhật thêm sớm. Anh/Chị có muốn gửi thông tin tìm nhà theo yêu cầu không?";
        suggestions = ["Yêu cầu tư vấn tìm nhà", "Xem nhà trên 5 tỷ"];
      }
    } else if (rawInput.startsWith("chi tiết:") || rawInput.includes("prod_")) {
      const prodId = rawInput.replace("chi tiết:", "").trim();
      const matched = properties.find(p => p.id === prodId || p.id.toLowerCase() === prodId);
      if (matched) {
        replyText = `Dạ, dưới đây là thông tin chi tiết căn nhà quý khách vừa hỏi:\n📌 ${matched.tieu_de}\n💰 Giá bán: ${matched.price} Tỷ\n📐 Diện tích: ${matched.area}m² | Kết cấu: ${matched.sotang} tầng\n📍 Vị trí: Đường ${matched.duongpho}, P. ${matched.phuongxa}, TP. Thủ Đức.\n\nSổ hồng chính chủ sẵn sàng sang tên. Quý khách muốn đăng ký tư vấn trực tiếp chứ ạ?`;
        suggestions = ["Tôi muốn đi xem nhà", "Đăng ký tư vấn", "Gửi sổ đỏ qua Zalo"];
        matchedPropId = matched.id;
        setLeadState(prev => ({ ...prev, propertyOfInt: matched.tieu_de }));
      } else {
        replyText = "Dạ, Trà không tìm thấy mã sản phẩm này. Quý khách vui lòng thử chọn danh sách đề xuất bên dưới:";
        suggestions = ["Tìm nhà dưới 5 tỷ", "Xem nhà mới nhất"];
      }
    } else if (rawInput.includes("long trường") || rawInput.includes("lò lu") || rawInput.includes("trường thạnh")) {
      const matchProps = properties.filter(p => p.phuongxa.toLowerCase().includes("long trường") || p.phuongxa.toLowerCase().includes("trường thạnh") || p.duongpho.toLowerCase().includes("lò lu"));
      if (matchProps.length > 0) {
        replyText = `Khu vực Long Trường & Trường Thạnh đang rất sốt nhờ dự án Vành Đai 3 đi qua. Trà có ${matchProps.length} căn cực đẹp ở đây:\n`;
        matchProps.forEach(p => {
          replyText += `\n🏠 Đường ${p.duongpho} - ${p.price} Tỷ - DT: ${p.area}m²`;
        });
        suggestions = matchProps.map(p => `Chi tiết: ${p.id}`);
      } else {
        replyText = "Khu vực này hiện Trà vừa bán hết, quý khách có muốn Trà cập nhật giỏ hàng ngộp mới về không ạ?";
        suggestions = ["Có, muốn cập nhật", "Tìm khu vực khác"];
      }
    } else if (rawInput.includes("ký gửi") || rawInput.includes("ký gui") || rawInput.includes("bán nhà")) {
      replyText = "Dạ, Thanh Trà BĐS hỗ trợ ra hàng miễn phí cực nhanh cho quý chủ nhà tại TP. Thủ Đức. Anh/Chị vui lòng để lại Tên và Số điện thoại, Trà sẽ liên hệ tiếp nhận hồ sơ ngay ạ!";
      suggestions = ["Đăng ký ký gửi bán nhà", "Hủy bỏ"];
      setLeadState({ step: "name", propertyOfInt: "Ký gửi mua bán nhà đất" });
    } else if (rawInput.includes("tư vấn") || rawInput.includes("xem nhà") || rawInput.includes("sổ đỏ") || rawInput.includes("quan tâm")) {
      replyText = "Dạ tuyệt vời ạ! Quý khách vui lòng cho Trà xin Họ Tên đầy đủ để xưng hô được chu đáo nhất nhé.";
      suggestions = ["Nhập họ tên", "Nhắn qua Hotline 0854.100.036"];
      setLeadState({ step: "name" });
    } else if (rawInput.includes("xin chào") || rawInput.includes("hello") || rawInput.includes("hi") || rawInput.includes("chào")) {
      replyText = "Dạ em chào anh/chị! Trà có thể hỗ trợ gì cho mình về nhà đất Thủ Đức hôm nay ạ?";
      suggestions = ["Tìm nhà dưới 5 tỷ", "Nhà trên 5 tỷ", "Ký gửi bán nhà"];
    } else {
      replyText = "Dạ, nội dung quý khách hỏi nằm ngoài phạm vi tìm kiếm nhanh hỗ trợ tự động. Tuy nhiên, Trà là trợ lý thông minh có thể chuyển lời tới bộ phận sale của Thanh Trà BĐS hỗ trợ anh/chị ngay nhé! \n\nĐể hỗ trợ lập tức, quý khách cho Trà xin Họ Tên đầy đủ được không ạ?";
      suggestions = ["Ký gửi bán nhà", "Gọi số: 0854.100.036"];
      setLeadState({ step: "name", propertyOfInt: "Yêu cầu tư vấn đặc biệt: " + input });
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: replyText,
        timestamp: new Date(),
        suggestions,
        propertyId: matchedPropId
      }
    ]);
  };

  const handleSuggestionClick = (suggestText: string) => {
    // Check if suggestion starts with Chi tiết
    if (suggestText.startsWith("Chi tiết: ")) {
      const pid = suggestText.split(": ")[1];
      if (pid) {
        onSelectProperty(pid);
        setIsOpen(false);
        return;
      }
    }

    if (suggestText === "Nhắn tin Zalo trực tiếp") {
      window.open("https://zalo.me/0854100036", "_blank");
      return;
    }

    if (suggestText.includes("Hotline") || suggestText.includes("0854.100.036")) {
      window.open("tel:0854100036");
      return;
    }

    if (suggestText === "Đăng ký tư vấn" || suggestText === "Tôi muốn đi xem nhà" || suggestText === "Gửi sổ đỏ qua Zalo" || suggestText === "Đăng ký ký gửi bán nhà" || suggestText === "Nhập họ tên") {
      setMessages(prev => [...prev, { sender: "user", text: suggestText, timestamp: new Date() }]);
      setLeadState({ step: "name", propertyOfInt: leadState.propertyOfInt || "Đăng ký xem nhà" });
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "bot",
          text: "Dạ vâng! Anh/chị vui lòng nhập Họ Tên của mình để em cập nhật hồ sơ đăng ký nhé ạ.",
          timestamp: new Date()
        }]);
      }, 300);
      return;
    }

    handleSendMessage(suggestText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end id-chatbot-root">
      {/* Expanded chat window */}
      {isOpen ? (
        <div className="w-[360px] max-w-[calc(100vw-32px)] h-[500px] border border-slate-200 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-orange-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-green border-2 border-brand-primary rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">Trợ Lý Ảo Thanh Trà</h4>
                <p className="text-[10px] text-white/80">Tự động trả lời 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-opacity h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-brand-primary text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                
                {/* Suggestions triggers */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.suggestions.map((sug, sIdx) => {
                      const isDetailLink = sug.startsWith("Chi tiết: ");
                      const label = isDetailLink ? `Xem nhà mã #${sug.split(": ")[1]}` : sug;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="text-[11px] font-semibold text-brand-primary bg-white border border-brand-primary/20 hover:bg-brand-primary hover:text-white px-2.5 py-1.5 rounded-full transition-all shadow-sm"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            {leadState.step !== "none" && (
              <div className="absolute top-[52px] left-0 right-0 bg-orange-50 text-orange-800 text-[11px] py-1.5 px-3 border-y border-orange-100 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                <span>Bạn đang trong luồng <b>Đăng ký tư vấn</b> ({leadState.step === "name" ? "Nhập tên" : "Nhập số điện thoại"})</span>
              </div>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                leadState.step === "name"
                  ? "Ví dụ: Nguyễn Văn A..."
                  : leadState.step === "phone"
                  ? "Ví dụ: 0854100036..."
                  : "Hỏi Trà về giá bán, khu vực, ký gửi..."
              }
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-primary focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-9 h-9 bg-brand-primary hover:bg-red-600 disabled:bg-slate-200 text-white rounded-full flex items-center justify-center transition-colors shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Bubble UI button */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-primary hover:bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-105 active:scale-95 transition-all group border-2 border-white"
          title="Chat với Trợ lý ảo 24/7"
        >
          <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-yellow-300" /> Chat hỗ trợ 24/7
          </span>
          <MessageCircle className="w-7 h-7" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-brand-green border border-white rounded-full animate-ping"></span>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-brand-green border border-white rounded-full"></span>
        </button>
      )}
    </div>
  );
}
