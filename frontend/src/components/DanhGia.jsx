import { FaStar, FaComment } from "react-icons/fa"; 

export default function DanhGia({ sanPhamHienTai }) {
    const sao = [1, 2, 3, 4, 5];
    const danhgia = [
        { sao: 5, tile: 95, sodg: 31 },
        { sao: 4, tile: 20, sodg: 2 },
        { sao: 3, tile: 10, sodg: 1 },
        { sao: 2, tile: 0, sodg: 0 },
        { sao: 1, tile: 0, sodg: 0 },
    ];
    const nguoidanhgia = [
        { mau: "bg-green-600", name: "Nguyễn Nam", bd: "N",  cmt: "Sản phẩm chất lượng tốt" },
        { mau: "bg-red-600", name: "Tran Quang", bd: "T", cmt: "đã mua hàng, chất lượng tốt" },
        { mau: "bg-blue-600", name: "Anh Bảo", bd: "A", cmt: "góp nhanh , dv ổn" },
        { mau: "bg-green-600", name: "Lê Quốc Huy", bd: "L", cmt: "nhân viên nhiệt tình. hỗ trợ tốt" },
    ];
    
    return (
        <div className="p-3 md:p-5 bg-gray-50 rounded-xl flex flex-col gap-5">
            {/* Thêm dấu ? để an toàn dữ liệu */}
            <h1 className="font-bold text-2xl text-gray-800">
                Đánh giá {sanPhamHienTai?.label}
            </h1>
            
            {/* 1. KHUNG TỔNG QUAN ĐÁNH GIÁ */}
            <div className="bg-white rounded-xl p-5 md:p-10 flex flex-col md:flex-row gap-8 shadow-sm border border-gray-100">
                
                {/* Cột Trái */}
                <div className="flex flex-col gap-2 items-center justify-center w-full md:w-[220px] shrink-0 md:border-r border-gray-200 md:pr-5">
                    <h2 className="font-bold text-6xl flex items-baseline">
                        4.9<span className="text-gray-400 font-semibold text-3xl ml-1">/5</span>
                    </h2>
                    <div className="flex gap-2 items-center text-xl mt-2">
                        {sao.map((i, index) => (
                            <FaStar key={index} className="text-yellow-400" />
                        ))}
                    </div>
                    <p className="text-gray-500 font-medium mt-1">33 lượt đánh giá</p>
                    <button className="mt-3 bg-[#d7000e] py-2.5 rounded-lg w-full hover:bg-red-700 transition-colors shadow-sm">
                        <span className="text-white font-semibold text-[15px]">Viết đánh giá</span>
                    </button>
                </div>

                {/* Cột Phải */}
                <div className="w-full flex flex-col justify-center md:pl-6 gap-3">
                    {danhgia.map((item, index) => {
                        const phantram = item.tile;
                        return (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-10 shrink-0 justify-end">
                                    <p className="text-base font-semibold text-gray-700">{item.sao}</p>
                                    <FaStar className="text-yellow-400 text-sm" />
                                </div>
                                
                                <div className="bg-gray-100 rounded-full flex-1 overflow-hidden h-2.5">
                                    <div 
                                        className="h-full bg-[#d7000e] rounded-full"
                                        style={{ width: `${phantram}%` }}
                                    ></div>
                                </div>
                                
                                <p className="text-gray-500 font-medium text-sm w-12 shrink-0 text-right">
                                    {item.tile}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. KHUNG DANH SÁCH BÌNH LUẬN */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm mt-2"> 
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                    Tất cả đánh giá
                </h2>
                
                <div className="flex flex-col">
                    {nguoidanhgia.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex items-start justify-between py-5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-11 h-11 shrink-0 ${item.mau} rounded-full flex justify-center items-center shadow-sm`}>
                                    <p className="text-lg font-bold text-white uppercase">{item.bd}</p>
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-0.5">
                                    <h3 className="text-[15px] font-bold text-gray-900">{item.name}</h3>
                                    <div className="text-gray-600 text-[14px] flex items-start gap-2 leading-relaxed pr-4 mt-1">
                                        <FaComment className="mt-1 text-gray-300 shrink-0 text-sm"/>
                                        <span>{item.cmt}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 ml-2">
                                <button className="py-1.5 px-4 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-medium text-xs transition-colors border border-yellow-200">
                                    Phản hồi
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
}