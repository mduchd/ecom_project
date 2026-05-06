
export default function ThongSo(){
    const thongso =[
        {label: "Công nghệ âm thanh", vl:"Chống ồn chủ động ANC.Chế độ xuyên âm"},
        {label: "Micro", vl:"2 micro mỗi bên"},
        {label: "Cổng kết nối", vl:"3.5mm"},
        {label: "Thời lượng sử dụng Pin", vl:"60 giờ"},
        {label: "Phương thức điều khiển", vl:"Chạm cảm ứng"},
        {label: "Tính năng khác", vl:"	Tạm dừng thông minh. Tự động bật/tắt nhanh chóng khi nhấc lên"},
        {label: "Hãng sản xuất", vl:"Sennheiser"},
        {label: "Công nghệ âm thanh", vl:"Chống ồn chủ động ANC.Chế độ xuyên âm"},
        {label: "Micro", vl:"2 micro mỗi bên"},
        {label: "Cổng kết nối", vl:"3.5mm"},
        {label: "Thời lượng sử dụng Pin", vl:"60 giờ"},
        {label: "Phương thức điều khiển", vl:"Chạm cảm ứng"},
        {label: "Tính năng khác", vl:"	Tạm dừng thông minh. Tự động bật/tắt nhanh chóng khi nhấc lên"},
        {label: "Hãng sản xuất", vl:"Sennheiser"},
        
    ]
    return(
        <div className="flex flex-col gap-4 mt-7">
            <h2 className="font-medium text-lg">Thông số kỹ thuật</h2>
            <div className="w-full border border-gray-300 overflow-hidden rounded-xl">
                {thongso.map((item, index) => (
                    <div key={index} className="flex">
                        <div className="w-1/3 w-[45%]">
                            <p className=" w-full h-full border border-gray-300 p-1 bg-gray-200 
                            text-[15px] flex items-center leading-snug">{item.label}</p>
                        </div>
                    <div className="flex-1 flex items-center">
                        <p className="w-full border border-gray-300 p-1 text-[14px]">{item.vl}</p>
                    </div>
                    
                </div>
                ))}
            </div>
        </div>
    )
}