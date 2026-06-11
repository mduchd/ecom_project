import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { getProducts } from "../services/productService";
import { FaRobot, FaPaperPlane, FaTimes, FaStar, FaUser } from "react-icons/fa";

const QUICK_SUGGESTIONS = [
    { label: "Sản phẩm bán chạy? 🔥", text: "Shop có những sản phẩm nào bán chạy nhất hiện nay?" },
    { label: "Chính sách đổi trả? 📦", text: "Chính sách bảo hành và đổi trả sản phẩm của shop như thế nào?" },
    { label: "Mã giảm giá mới? 🎁", text: "Hiện tại shop đang có chương trình khuyến mãi hay mã giảm giá nào không?" },
    { label: "Liên hệ hỗ trợ ☎️", text: "Tôi muốn liên hệ trực tiếp với nhân viên tư vấn khách hàng thì làm thế nào?" }
];

const BOT_WELCOME_MESSAGE = {
    role: "bot",
    content:
        "Chào bạn! Mình là SnapBot, trợ lý mua sắm AI của SnapCart. Mình có thể giúp gì cho bạn hôm nay? Bạn có thể nhập câu hỏi hoặc chọn các câu hỏi gợi ý nhanh bên dưới nhé!",
    products: []
};

const formatCurrency = (value) => {
    if (value == null) return "";
    return Number(value).toLocaleString("vi-VN") + " VND";
};

const cleanMessageText = (text) => {
    if (!text) return "";
    return text
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/`/g, "")
        .replace(/^\s*[-*]\s+/gm, "")
        .replace(/\r/g, "")
        .trim();
};

const shouldHideSuggestedProducts = (text) => {
    if (!text) return false;
    const normalized = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    return (
        normalized.includes("chi co the giup ban tim kiem thong tin ve san pham") ||
        normalized.includes("chi co the ho tro thong tin ve san pham") ||
        normalized.includes("khong lien quan den mua sam") ||
        normalized.includes("minh chi co the giup ve san pham") ||
        normalized.includes("toi chi co the giup ve san pham")
    );
};

const inferProductNamesFromReply = (text) => {
    if (!text) return [];

    const normalized = text.replace(/\r/g, "");
    const candidates = [];

    const numberedMatches = normalized.matchAll(/\d+\.\s*\*{0,2}([^*\n:]+?)\*{0,2}(?::|\n|$)/g);
    for (const match of numberedMatches) {
        const name = match[1]?.trim();
        if (name && name.length > 4) {
            candidates.push(name);
        }
    }

    const emphasisMatches = normalized.matchAll(/\*{2}([^*\n]+?)\*{2}/g);
    for (const match of emphasisMatches) {
        const name = match[1]?.trim();
        if (name && /^laptop|^iphone|^samsung|^asus|^dell|^macbook/i.test(name)) {
            candidates.push(name);
        }
    }

    return [...new Set(candidates)].slice(0, 4);
};

const enrichProductsFromReply = async (replyText) => {
    const inferredNames = inferProductNamesFromReply(replyText);
    if (inferredNames.length === 0) {
        return [];
    }

    const results = await Promise.all(
        inferredNames.map(async (name) => {
            try {
                const products = await getProducts(null, name);
                return products?.find((product) =>
                    product.name?.toLowerCase().includes(name.toLowerCase())
                ) ?? products?.[0] ?? null;
            } catch (error) {
                console.error("Failed to enrich AI product suggestion:", error);
                return null;
            }
        })
    );

    return results.filter(Boolean);
};

function ProductSuggestionCard({ product }) {
    const salePrice = product.discountPrice ?? product.price;
    const originalPrice = product.discountPrice ? product.price : null;
    const isAvailable = (product.stockQuantity ?? 0) > 0;

    return (
        <Link
            to={`/product/${product.id}`}
            className="block rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/80 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="flex gap-3">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[11px] font-semibold text-gray-400">
                            No image
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                        {product.name}
                    </p>

                    {(product.brand || product.category) && (
                        <p className="mt-1 text-[11px] font-medium text-gray-500">
                            {[product.brand, product.category].filter(Boolean).join(" • ")}
                        </p>
                    )}

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-bold text-blue-700">{formatCurrency(salePrice)}</span>
                        {originalPrice && (
                            <span className="text-[11px] text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                            </span>
                        )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                                isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                            }`}
                        >
                            {isAvailable ? "Còn hàng" : "Hết hàng"}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600">Xem chi tiết</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [messages, setMessages] = useState([BOT_WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isLoading]);

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

        setMessages((prev) => [...prev, { role: "user", content: userMsg, products: [] }]);
        setIsLoading(true);

        try {
            const response = await api.post("/ai/chat", { message: userMsg });
            const replyText = cleanMessageText(response.data?.reply);
            let suggestedProducts = response.data?.products ?? [];

            if (shouldHideSuggestedProducts(replyText)) {
                suggestedProducts = [];
            } else if (suggestedProducts.length === 0) {
                suggestedProducts = await enrichProductsFromReply(response.data?.reply);
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    content: replyText,
                    products: suggestedProducts
                }
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    content: "Rất tiếc, mình đang gặp trục trặc kỹ thuật kết nối. Bạn vui lòng thử lại sau nhé!",
                    products: []
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {!isOpen && showTooltip && (
                <div className="absolute bottom-16 right-2 mr-2 z-40 flex items-center gap-1.5 whitespace-nowrap rounded-2xl border border-slate-800 bg-slate-900/95 px-3.5 py-2 text-xs font-bold text-white shadow-xl pointer-events-auto select-none animate-float">
                    <span>Trò chuyện với SnapBot ✨</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(false);
                        }}
                        className="ml-1 text-gray-400 transition-colors hover:text-white focus:outline-none"
                    >
                        <FaTimes className="h-2.5 w-2.5" />
                    </button>
                    <div className="absolute right-6 top-full h-2 w-2 rotate-45 border-b border-r border-slate-800 bg-slate-900" />
                </div>
            )}

            {isOpen && (
                <div className="mb-4 flex h-[550px] w-[360px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl animate-chatIn sm:w-[410px]">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner">
                                <FaRobot className="h-5 w-5 text-white" />
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                            </div>
                            <div>
                                <h3 className="flex items-center gap-1 text-sm font-bold">
                                    SnapBot
                                    <span className="flex items-center gap-0.5 rounded border border-yellow-400/30 bg-yellow-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-yellow-300">
                                        <FaStar className="h-2 w-2 fill-current" /> AI
                                    </span>
                                </h3>
                                <p className="text-[10px] font-medium text-blue-100/90">Hỗ trợ khách hàng tự động</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl bg-white/10 p-2 transition-all duration-150 active:scale-95 hover:bg-white/20"
                        >
                            <FaTimes className="h-4 w-4" />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-4"
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={`${msg.role}-${i}`}
                                className={`flex items-start gap-2.5 animate-messageIn ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "bot" && (
                                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                                        <FaRobot className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                )}

                                <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                                    {!!msg.content && (
                                        <div
                                            className={`rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm sm:text-sm ${
                                                msg.role === "user"
                                                    ? "rounded-tr-none bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                                                    : "rounded-tl-none border border-gray-100 bg-white text-gray-700"
                                            }`}
                                        >
                                            <p className="whitespace-pre-line">{msg.content}</p>
                                        </div>
                                    )}

                                    {msg.role === "bot" && msg.products?.length > 0 && (
                                        <div className="w-full space-y-2">
                                            {msg.products.map((product) => (
                                                <ProductSuggestionCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {msg.role === "user" && (
                                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
                                        <FaUser className="h-3 w-3 text-indigo-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-start gap-2.5 animate-messageIn">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                                    <FaRobot className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-2">
                        <div className="scrollbar-none flex snap-x gap-2 overflow-x-auto pb-1">
                            {QUICK_SUGGESTIONS.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(item.text)}
                                    disabled={isLoading}
                                    className="snap-center flex-shrink-0 rounded-full border border-gray-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-white p-4">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Hỏi SnapBot bất cứ điều gì..."
                                className="w-full rounded-2xl border border-gray-200/80 bg-gray-50/80 py-3 pl-4 pr-12 text-xs font-medium transition-all placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`absolute right-1.5 rounded-xl p-2.5 transition-all duration-150 ${
                                    input.trim() && !isLoading
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95"
                                        : "bg-transparent text-gray-300"
                                }`}
                            >
                                <FaPaperPlane className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[9px] font-medium text-gray-400">
                            Trợ lý SnapBot hoạt động tự động trên công nghệ AI Gemini.
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowTooltip(false);
                }}
                className={`relative z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isOpen
                        ? "rotate-90 border border-gray-200 bg-slate-100 text-slate-600"
                        : "animate-float bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 text-white hover:shadow-indigo-500/20"
                }`}
            >
                {isOpen ? (
                    <FaTimes className="h-5 w-5" />
                ) : (
                    <div className="relative">
                        <FaRobot className="h-6 w-6" />
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                )}
            </button>

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
