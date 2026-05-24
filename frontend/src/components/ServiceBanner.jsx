import { FaTruck, FaHeadphones, FaShieldAlt, FaUndo } from "react-icons/fa";

const SERVICES = [
    {
        id: 1,
        icon: <FaTruck className="w-7 h-7" />,
        title: "Miễn phí vận chuyển",
        subtitle: "Cho đơn hàng từ 10.000.000đ",
        color: "text-blue-600",
    },
    {
        id: 2,
        icon: <FaHeadphones className="w-7 h-7" />,
        title: "Hỗ trợ 24/7",
        subtitle: "Hỗ trợ tận tâm mọi lúc",
        color: "text-emerald-600",
    },
    {
        id: 3,
        icon: <FaShieldAlt className="w-7 h-7" />,
        title: "Thanh toán an toàn",
        subtitle: "Giao dịch được bảo vệ 100%",
        color: "text-purple-600",
    },
    {
        id: 4,
        icon: <FaUndo className="w-7 h-7" />,
        title: "Cam kết hoàn tiền",
        subtitle: "Đổi trả dễ dàng trong 30 ngày",
        color: "text-yellow-600",
    },
];

export default function ServiceBanner() {
    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {SERVICES.map((s) => (
                    <div
                        key={s.id}
                        className="flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {/* Icon */}
                        <div className={`flex-shrink-0 ${s.color} flex items-center justify-center`}>
                            {s.icon}
                        </div>
                        {/* Text */}
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-800 leading-snug">{s.title}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-snug">{s.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
