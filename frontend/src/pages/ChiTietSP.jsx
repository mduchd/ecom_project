import { useState} from "react";
import { useNavigate } from "react-router-dom";
import GioHang from "./GioHang.jsx";
import SPLienQuan from "../components/SanPhamLienQuan.jsx";
import BannerSp from "../components/BannerSP.jsx";
import { AiFillCheckCircle } from "react-icons/ai";
import { FaGift } from "react-icons/fa";
import { FiGift } from "react-icons/fi";
import ThongSo from "../components/ThongSoSP.jsx";
import Camket from "../components/CamKetSP.jsx";
import DanhGia from "../components/DanhGia.jsx";
import Header from "../components/Header.jsx";


export default function ChiTietSP() {
  const [selectedID, setSelectedID] = useState(0);
  const images = ["/tainghe1.png", "/tainghe3.png", "/tainghe1.png", "/tainghe1.png"];
  const version = [1, 2, 3];
  const colors = ["bg-black", "bg-red-400", "bg-blue-400"];

  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const MuaNgay = () => {
    setCartCount(prev => prev + 1);
    navigate('/cart')
  }
  const [activeImg, setActiveImg] = useState(images[0]);
  const [activeSize, setActiveSize] = useState(null);

  const [sanPhamHienTai, setSanPhamHienTai] = useState({
    label: "JBL Live 660NC",
    gia: "6.890.000đ", 
    image: "./tainghe1.png"
  });
  const handleChonSanPhamMoi = (sp) => {
    setSanPhamHienTai(sp);
    setActiveImg(sp.image);
    window.scrollTo({top:0, behavior: "smooth"})
  }

  const [count, setCount] = useState(0);
  const nutTang = () =>{
    setCount(prev => prev + 1)
  };
  const nutGiam = () =>{
    if(count > 1){
      setCount(count - 1)
    }
  };
  const isVideo = (url) => url.endsWith(".mp4") || url.endsWith(".webm");
  const [cartCount, setCartCount] = useState(0);
  const nutThemCart = ()=>{
    setCartCount(prev => prev + 1);
  };

  const [flyingStyle, setFlyingStyle] = useState(null);
  const handleAddToCart = () =>{
    const productImg = document.getElementById("main-product-image");
    const cartIcon = document.getElementById("cart-icon");
    if(productImg && cartIcon){
      const startRect = productImg.getBoundingClientRect();
      const endRect = cartIcon.getBoundingClientRect();

      // Bước 2.1: Đặt ảnh clone ở vị trí xuất phát (đè lên ảnh gốc)
      setFlyingStyle({
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        opacity: 1,
      });
      setTimeout(() => {
        setFlyingStyle({
          top: endRect.top + 10, // Cộng nhẹ 10px để bay vào giữa tâm icon
          left: endRect.left + 10,
          width: 30, // Thu nhỏ lại còn 30px
          height: 30,
          opacity: 0.5, // Mờ dần khi tới đích
        });
      }, 10);
      // Bước 2.3: Đợi 600ms (thời gian bay xong), xóa ảnh clone và cộng số giỏ hàng
      setTimeout(() => {
        setFlyingStyle(null);
        setCartCount(prev => prev + 1);
      }, 600);
    } else {
      // Trường hợp lỗi không tìm thấy phần tử, vẫn cộng giỏ hàng bình thường
      setCartCount(prev => prev + 1);
    }
  };
  const mausac=[
    {image: "./tainghe1.png", mau: "Hồng khói", gia: "6.890.000đ"},
    {image: "./tainghe2.png", mau: "Xanh ánh trăng", gia: "6.990.000đ"},
    {image: "./tainghe3.png", mau: "Bạc", gia: "6.590.000đ"},
  ];
  const km =[
    {stt: "1", vl: "trả góp 0% lãi suất, tối đa 9 tháng, trả trước từ 10% qua CTTC hoặc 0đ qua thẻ tín dụng"},
    {stt: "2", vl: "Giảm 1,000,000đ khi mua kèm combo Iphone 17 Series + Apple Watch (Không kèm ưu đãi khác)"},
    {stt: "3", vl: "Giảm thêm 10% cho Pin dự phòng - Camera giám sát - Đồng hồ trẻ em - Gia dụng - Sức khỏe Làm đẹp khi mua Điện thoại/Laptop"},
  ];
  return (
    <div>
   
      
      {flyingStyle && (
        <img
  
          src={isVideo(activeImg) ? images[1] : activeImg} 
          className="fixed z-[9999] object-contain rounded-2xl pointer-events-none transition-all duration-[600ms] ease-in-out"
          style={{
            top: flyingStyle.top,
            left: flyingStyle.left,
            width: flyingStyle.width,
            height: flyingStyle.height,
            opacity: flyingStyle.opacity,
          }}
          alt="flying"
        />
      )}

      <main className=" flex flex-col gap-5 max-w-7xl mx-auto mt-10 py-3 px-8 bg-white rounded-3xl pb-20">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT: INFO (GALLERY) */}
        <div className="flex flex-col gap-4">
          {/* Cố định tỷ lệ khung hình vuông cho ảnh chính */}
          <div id ="main-product-image"
           className="w-full aspect-square bg-gray-100  rounded-2xl overflow-hidden relative">
            {isVideo(activeImg) ? (
              // Nếu là video thì dùng thẻ <video>
              <video 
                src={activeImg} 
                className="w-full h-full object-contain"
                autoPlay // Tự động chạy
                loop     // Lặp lại liên tục
                muted    // Tắt tiếng (Bắt buộc phải có để trình duyệt cho phép tự động chạy)
                playsInline 
              />
            ) : (
              // Nếu là ảnh thì dùng thẻ <img> như cũ
              <img 
                src={activeImg} 
                className="w-full h-full object-contain transition-all duration-300" 
                alt="Product" 
              />
            )}
          </div>

          {/* THUMBNAIL */}
          <div className="grid grid-cols-4 gap-4 mt-2">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setActiveImg(img)}
                className={` w-full aspect-square cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200
                ${activeImg === img ? "border-blue-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {isVideo(img) ? (
                  <>
                    <video src={img} className="w-full h-full object-cover" muted />
                    {/* Lớp phủ thêm nút Play màu đen mờ để người dùng biết đây là video */}
                    
                  </>
                ) : (
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                )}
              </div>
            ))}
          </div>
          <ThongSo/>
        </div>

        {/* RIGHT: OPTIONS */}
        <div className="flex flex-col gap-4 pt-8 ">

          {/* BỔ SUNG: TITLE & DESCRIPTION */}
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{sanPhamHienTai.label}</h1>
            <p className="text-3xl font-bold text-red-600 mt-2">
                {sanPhamHienTai.gia}
            </p>
            <p className="text-gray-500 mt-3 leading-relaxed">
             {sanPhamHienTai.label} với thiết kế chống ồn dòng cao cấp, được trang bị bộ xử lý QN1. Đây là một trong những tai nghe chụp tai tốt trong phân khúc chống ồn chủ động.
            </p>
          </div>
          
          {/* COLOR */}
          <div className="flex flex-col gap-2">
              <h2 className="font-bold mb-1">Phiên bản</h2>
              <div className="flex gap-3">
              {version.map((item, index) =>(
                <div key={index} className="h-10 w-full border border-gray-200 rounded-lg p-2 items-center cursor-pointer">
                  <p className="text-center font-semibold">JBL-100XM6</p>
                </div>
              ))}</div>
              <span className="font-bold text-gray-900 uppercase text-sm tracking-wider mt-1">Chọn Màu</span>
              <div className="flex gap-3 mt-3 ">
                {mausac.map((color, index) => {
                  const isSelected = selectedID ===index;
                  return (
                  <div onClick= {() => setSelectedID(index)}
                    key={index}
                    className={`relative h-auto border w-full border-gray-200 flex p-2 gap-3 
                    rounded-lg items-center cursor-pointer ${isSelected
                      ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <img src={color.image}
                    className="h-10 w-10"></img>
                    <div>
                      <p className="font-semibold">{color.mau}</p>
                      <p>{color.gia}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 text-blue-600 bg-white rounded-full">
                        <AiFillCheckCircle className="text-xl" />
                      </div>
                    )}
                  </div>
                );})}
                
              </div>
             
      
            
          </div>
          {/**So luong */}
          
          {/* CHÂN TRANG: PRICE & BUTTON */}
          <div className="flex  flex-col items-center gap-6 mt-4 pt-8 border-t border-gray-100">
            <button onClick={() => {
                    nutThemCart();      
                    handleAddToCart();  
                    }}
             className="flex-1 w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-2xl 
             shadow-lg hover:bg-blue-800 hover:shadow-gray-700 
             hover:scale-105 active:scale-95 transition-all duration-200">
              Thêm vào giỏ hàng <span>🛒</span>
            </button>
            <button onClick={MuaNgay}
             className="flex-1 w-full bg-yellow-300 text-black text-lg font-bold py-4 rounded-2xl 
             shadow-lg hover:bg-yellow-500 hover:shadow-gray-700 
             hover:scale-105 active:scale-95 transition-all duration-200 uppercase ">
              Mua Ngay
            </button>
          </div>
          <div className="border w-full h-auto p-2 bg-green-50 rounded-lg border border-yellow-300 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiGift size={22} className="text-red-500 "/>
              <p className="font-semibold text-lg">Khuyến mãi đi kèm</p>
              </div>
              <a href="/" className="text-red-500 font-semibold text-sm">Xem tất cả voucher</a>
            </div>
            {km.map((item, index) =>(
              <div key={index} className="flex gap-6">
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-green-200 flex items-center justify-center font-semibold 
                  border border-yellow-500">
                    {item.stt}
                  </div>
                  <p className="text-gray-700 font-medium">{item.vl}</p>
              
              </div>
            ))}
          </div>
          <Camket />
        </div>
        
        </div>

        <SPLienQuan onSelectProduct={handleChonSanPhamMoi}/>
        <BannerSp sanPhamHienTai={sanPhamHienTai} onMuaNgay = {MuaNgay}
         className="absolute bottom-2 right-4"/>
         <DanhGia sanPhamHienTai={sanPhamHienTai}/>
      </main>
    </div>
  );
}