import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function ThongSo({ product }){
    const [expanded, setExpanded] = useState(false);
    const defaultThongSo = [
        {label: "Công nghệ âm thanh", vl:"Chống ồn chủ động ANC, Chế độ xuyên âm"},
        {label: "Micro", vl:"2 micro mỗi bên"},
        {label: "Cổng kết nối", vl:"3.5mm, Type-C"},
        {label: "Thời lượng sử dụng", vl:"Lên đến 60 giờ (tắt ANC)"},
        {label: "Phương thức điều khiển", vl:"Chạm cảm ứng thông minh"},
        {label: "Tính năng khác", vl:"Tạm dừng thông minh, Tự động bật/tắt khi nhấc lên"},
        {label: "Hãng sản xuất", vl:"Sennheiser"},
        {label: "Trọng lượng", vl:"250g"},
        {label: "Phạm vi kết nối", vl:"Bluetooth 5.2 lên đến 10m"},
    ];

    const dynamicThongSo = product ? [
        {label: "Hãng sản xuất", vl: product.name.split(" ")[0]},
        {label: "Tên sản phẩm", vl: product.name},
        {label: "Danh mục", vl: product.category},
        {label: "Đánh giá", vl: `${product.rating} sao (${product.reviews} đánh giá)`},
        {label: "Tình trạng", vl: product.inStock ? "Còn hàng" : "Ngừng kinh doanh"},
        {label: "Bảo hành", vl: "12 tháng chính hãng (1 đổi 1 trong 30 ngày)"},
        {label: "Cam kết", vl: "Sản phẩm chính hãng 100%, nguyên seal"},
        {label: "Hỗ trợ", vl: "Trả góp 0%, giao hàng siêu tốc 2h"},
    ] : defaultThongSo;

    const thongso = product ? dynamicThongSo : defaultThongSo;
    return(
        <div className="flex flex-col gap-4 mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
               <h2 className="font-black text-xl text-gray-900 uppercase tracking-tight">Thông số kỹ thuật</h2>
            </div>
            <div className="w-full border border-gray-100 overflow-hidden rounded-xl bg-gray-50/50 transition-all duration-300">
                {(expanded ? thongso : thongso.slice(0, 4)).map((item, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} hover:bg-blue-50/50 transition-colors`}>
                        <div className="w-[40%] sm:w-[35%] border-r border-gray-100 p-3 sm:p-4">
                            <p className="text-sm font-bold text-gray-600 leading-snug">{item.label}</p>
                        </div>
                        <div className="flex-1 p-3 sm:p-4 flex items-center">
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">{item.vl}</p>
                        </div>
                    </div>
                ))}
            </div>
            {thongso.length > 4 && (
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="w-full py-3 mt-2 text-blue-600 font-bold text-sm bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
                >
                    {expanded ? "Thu gọn cấu hình" : "Xem cấu hình chi tiết"}
                    <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    )
}