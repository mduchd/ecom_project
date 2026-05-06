

import { useState , useMemo} from "react";
import { FaHeart } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link, useNavigate  } from "react-router-dom";
import { ALL_PRODUCTS } from "../pages/Shop.jsx";

export default function SPLienQuan({category, currentId , onSelectProduct}){
    const listsp = useMemo(() => {
        return ALL_PRODUCTS.filter(item =>
            item.category === category && item.id !== currentId
        ).slice(0, 10);
        
    }, [category, currentId]);
    /*const listsp = [
        {label: "JBL Live 660NC", image: "tainghe1.png", gia: "5.690.000đ"},
        {label: "Baseus Bowie D05", image: "tainghe2.png", gia: "6.690.000đ"},
        {label: "Picun B8", image: "tainghe3.png", gia: "4.690.000đ"},
        {label: "Bmooster", image: "tainghe4.png", gia: "5.690.000đ"},
        {label: "Soundcore Space Q45", image: "tainghe5.png", gia: "8.690.000đ"},
        {label: "JBL Live 660NC", image: "tainghe1.png", gia: "5.690.000đ"},
        {label: "Baseus Bowie D05", image: "tainghe2.png", gia: "6.690.000đ"},
        {label: "Picun B8", image: "tainghe3.png", gia: "4.690.000đ"},
        {label: "Beats Pro", image: "tainghe6.png", gia: "9.690.000đ"},
        {label: "Soundcore Space Q45", image: "tainghe5.png", gia: "8.690.000đ"},
    ];*/
    const [thongBao, setThongBao] = useState({ hien: false, tenSP: "" });

    const handleYeuThich = (e, productLabel) => {
        e.stopPropagation();
        setThongBao({ hien: true, tenSP: productLabel });
        setTimeout(() => {
            setThongBao({ hien: false, tenSP: "" });
        }, 3000);
    };
    const [activeName, setActiveName] = useState(listsp[0]?.name || "");
    const [activeImg, setActiveImg] = useState(listsp[0]?.image || "");
    const [activeGia, setActiveGia] = useState(listsp[0]?.price || "");
 
    const listSP = ["tainghe1.png", "tainghe2.png",
        "tainghe3.png", "tainghe4.png", "tainghe5.png", 
        "tainghe1.png", "tainghe2.png",
        "tainghe3.png", "tainghe6.png", "tainghe5.png"
    ];
    const navigate = useNavigate();
    if (!listsp || listsp.length === 0){
        return <div className="mt-12 text-gray-400 italic">Không có sản phẩm tương tự.</div>;
    }
    return(
        
        <div className="relative">
            {thongBao.hien && (
                <div className="fixed top-24 right-5 z-[100] animate-bounce">
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400">
                        <AiFillHeart className="text-white text-xl" />
                        <div>
                            <p className="font-bold text-sm">Đã thêm vào yêu thích!</p>
                            <p className="text-xs opacity-90">{thongBao.tenSP}</p>
                        </div>
                    </div>
                </div>
            )}
            
           
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Sản Phẩm Tương Tự</h2>
                    <a href="#" className="text-xl font-semibold text-gray-600">View All</a>
                </div>
                <div className=" gap-4 grid gid-cols-2 md:grid-cols-3 
                    lg:grid-cols-5 mt-4">
                    {listsp.map((item, index) => (
                        <div key={index} onClick={() => onSelectProduct(item)}
                        className={`relative group  h-full border rounded-lg border-gray-200
                        shadow-lg shadow-gray-300 shadow-s p-3 flex flex-col pb-12`}
                    >
                            <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4  overflow-hidden flex items-center justify-center p-2 flex-col">
                                <div className="h-45 py-3 rounded-xl ">
                                    <img className="w-full h-full object-contain group-hover:scale-110 trasition-transform duration-300" src={item.image} alt={item.name} ></img>
                                
                                </div>
                                
                            </div>
                            <p className="font-semibold text-lg mb-2">{item.name}</p>
                            <div className="mt-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-red-600 font-bold text-lg font-bold tracking-tight ">{item.price.toLocaleString()}$</p>
                                    <p className="text-gray-400 line-through">3.990$</p>
                                </div>
                                
                                <div className=" bg-gray-200 rounded-sm px-1 mb-2">
                                    <p className="text-[12.5px] line-clamp-2">Trả góp 0% lãi suất, tối đa 9 tháng, trả trước từ 10% qua CTTC hoặc 0đ qua thẻ tín dụng</p>
                                </div>
                            </div>
                            <div className="absolute group bottom-2 right-3 group/heart flex items-center 
                                rounded-lg gap-2 p-1 hover:bg-gray-200 cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={(e) => handleYeuThich(e, item.name)}>
                            <AiOutlineHeart className="absolute text-blue-500 text-2xl transition-opacity duration-200
                            group-hover/heart:opacity-0"/> 
                            <AiFillHeart className="text-blue-500 text-2xl opacity-0 scale-75 
                            transition-all duration-200 
                            group-hover/heart:opacity-100 group-hover/heart:scale-100 group-hover/heart:animate-blink"/> 
                            <p className="font-normal text-blue-500">Yêu thích</p>
                            </div>
                            
                            <div className="absolute right-0 top-0 
                            rounded-sm gap-2 p-1 bg-yellow-500 transition-all duration-200 ">
                                <p className="text-sm font-semibold">Trả góp 0%</p>
                            </div>
                            <div className="absolute left-3 top-[-5px] 
                            rounded-sm gap-2 p-1 bg-red-700 transition-all duration-200">
                                <p className="text-white text-sm font-medium">Giảm 14%</p>
                            </div>
                            
                        </div>
                    ))}
                </div>
        </div>
    )
}