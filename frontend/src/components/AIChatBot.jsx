import { useState, useRef, useEffect } from "react";
import api from "../services/productService";
import { FaRobot, FaPaperPlane, FaTimes, FaStar, FaUser } from "react-icons/fa";

// ── Quick Suggestion Config ──────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
    { label: "Sản phẩm bán chạy? 🔥", text: "Shop có những sản phẩm nào bán chạy nhất hiện nay?" },
    { label: "Chính sách đổi trả? 📦", text: "Chính sách bảo hành và đổi trả sản phẩm của shop như thế nào?" },
    { label: "Mã giảm giá mới? 🎫", text: "Hiện tại shop đang có chương trình khuyến mãi hay mã giảm giá nào không?" },
    { label: "Liên hệ hỗ trợ 📞", text: "Tôi muốn liên hệ trực tiếp với nhân viên tư vấn khách hàng thì làm thế nào?" }
];

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [messages, setMessages] = useState([
        { role: "bot", content: "Chào bạn! Mình là SnapBot, trợ lý mua sắm AI của SnapCart. Mình có thể giúp gì cho bạn hôm nay? Bạn có thể nhập câu hỏi hoặc chọn các câu hỏi gợi ý nhanh bên dưới nhé!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Tự động cuộn xuống khi có tin nhắn mới hoặc đang load câu trả lời
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isLoading]);

    // Ẩn tooltip sau 8 giây tự động để tránh cản trở tầm nhìn
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async (messageText) => {
        const textToSend = typeof messageText === "string" ? messageText : input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg = textToSend.trim();
        if (typeof messageText !== "string") {
            setInput("");
        }
        
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await api.post("/ai/chat", {
                message: userMsg
            });
            setMessages(prev => [...prev, { role: "bot", content: response.data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: "bot", 
                content: "Rất tiếc, mình đang gặp chút trục trặc kỹ thuật kết nối. Bạn vui lòng thử lại sau nhé!" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Tooltip Bubble (Hiển thị phía bên trái của Toggle Button khi chat đang đóng) */}
            {!isOpen && showTooltip && (
                <div className="absolute bottom-16 right-2 mr-2 bg-slate-900/95 text-white text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-slate-800 animate-float pointer-events-auto z-40 select-none">
                    <span>Trò chuyện với SnapBot ✨</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(false);
                        }}
                        className="text-gray-400 hover:text-white ml-1 focus:outline-none transition-colors"
                    >
                        <FaTimes className="w-2.5 h-2.5" />
                    </button>
                    {/* Arrow */}
                    <div className="absolute right-6 top-full w-2 h-2 bg-slate-900 border-r border-b border-slate-800 rotate-45"></div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[360px] sm:w-[410px] h-[550px] bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-chatIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 flex items-center justify-between text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative shadow-inner">
                                <FaRobot className="w-5 h-5 text-white" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm flex items-center gap-1">
                                    SnapBot
                                    <span className="bg-yellow-400/20 text-yellow-300 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-yellow-400/30 flex items-center gap-0.5">
                                        <FaStar className="w-2 h-2 fill-current" /> AI
                                    </span>
                                </h3>
                                <p className="text-[10px] text-blue-100/90 font-medium">Hỗ trợ khách hàng tự động</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-150 active:scale-95"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
                    >
                        {messages.map((msg, i) => (
                            <div 
                                key={i} 
                                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-messageIn`}
                            >
                                {/* Bot Avatar */}
                                {msg.role === 'bot' && (
                                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FaRobot className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                )}
                                
                                <div className={`max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium' 
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none font-medium'
                                }`}>
                                    {msg.content}
                                </div>

                                {/* User Avatar */}
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FaUser className="w-3 h-3 text-indigo-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing / Loading Indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-2.5 animate-messageIn">
                                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                    <FaRobot className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div className="bg-white border border-gray-100 py-3.5 px-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Replies suggestions bar */}
                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                            {QUICK_SUGGESTIONS.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(item.text)}
                                    disabled={isLoading}
                                    className="snap-center flex-shrink-0 bg-white hover:bg-blue-50 border border-gray-200/80 hover:border-blue-200 text-[11px] font-bold text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-full transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Hỏi SnapBot bất cứ điều gì..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400 font-medium"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`absolute right-1.5 p-2.5 rounded-xl transition-all duration-150 ${
                                    input.trim() && !isLoading 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 active:scale-95' 
                                    : 'text-gray-300 bg-transparent'
                                }`}
                            >
                                <FaPaperPlane className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">
                            Trợ lý SnapBot hoạt động tự động trên công nghệ AI Gemini.
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button with Custom Pulse Glow and Floating Motion */}
            <button 
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowTooltip(false);
                }}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 relative z-50 ${
                    isOpen 
                    ? 'bg-slate-100 text-slate-600 rotate-90 border border-gray-200' 
                    : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 text-white animate-float hover:shadow-indigo-500/20'
                }`}
            >
                {isOpen ? <FaTimes className="w-5 h-5" /> : (
                    <div className="relative">
                        <FaRobot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                )}
            </button>

            {/* Custom Animation and Glow CSS Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes chatIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-chatIn { animation: chatIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-messageIn { animation: messageIn 0.2s ease-out forwards; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
