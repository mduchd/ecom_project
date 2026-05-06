import { MdMobileFriendly } from "react-icons/md";
import { BiCheckShield } from "react-icons/bi";
import { FaMicrochip } from "react-icons/fa";
import { FaTags } from "react-icons/fa";

export default function Camket(){
    const camket = [
        {ic: MdMobileFriendly, vl: "Mới, đầy đủ phụ kiện từ NSX"},
        {ic: BiCheckShield, vl: "Bảo hành 12 tháng chính hãng 1 đổi 1 trong 12 ngày nếu có lỗi phần cứng từ NSX"},
        {ic: FaMicrochip, vl: "Tai nghe\nTài liệu hướng dẫn\nCáp sạc "},
        {ic: FaTags, vl: "Giá sản phẩn đã bao gồm thuế VAT"},
    ]
    return(
        <div className="w-full  p-1 ">
            <div className="flex grid grid-cols-2 gap-2">
                {camket.map((item, index) => {
                    const Icon = item.ic;
                    return (
                    <div key={index} className="border border-gray-200 rounded-lg bg-green-50 w-full 
                    h-full flex flex-col p-2">
                        <div className="w-8 h-8 bg-[#CB1C22] rounded-md flex items-center justify-center text-white mb-2.5">
                            <Icon className="text-lg" />
                        </div>
                        <p className="whitespace-pre-line font-medium text-sm">{item.vl}</p>
                    </div>
                )})}
            </div>
        </div>
    )
}