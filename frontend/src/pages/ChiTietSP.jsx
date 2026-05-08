import { useState, useEffect} from "react";
import { useNavigate , useParams} from "react-router-dom";
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
import { ALL_PRODUCTS } from "./Shop.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChiTietSP() {
  const { id } = useParams();
  const selectedProduct = ALL_PRODUCTS.find(p => p.id === Number(id)) || ALL_PRODUCTS[0];

  const product = ALL_PRODUCTS[0];
  const [selectedID, setSelectedID] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(0);

  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToCart } = useAuth();

  const MuaNgay = () => {
    addToCart(sanPhamHienTai, 1, version[selectedVersion], mausac[selectedID].mau);
    navigate('/cart');
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const [activeImg, setActiveImg] = useState(selectedProduct.image);
  const [sanPhamHienTai, setSanPhamHienTai] = useState(selectedProduct);
  const [activeSize, setActiveSize] = useState(null);

  const images = [sanPhamHienTai?.image || "/tainghe1.png", sanPhamHienTai?.image || "/tainghe3.png", sanPhamHienTai?.image || "/tainghe1.png", sanPhamHienTai?.image || "/tainghe1.png"];
  
  const getVersions = (prod) => {
    if (!prod) return ["Tiêu chuẩn", "Nâng cấp", "Cao cấp"];
    if (prod.category === "Laptops" || prod.category === "Computers") return ["8GB RAM / 256GB SSD", "16GB RAM / 512GB SSD", "32GB RAM / 1TB SSD"];
    if (prod.category === "Cameras") return ["Body Only", "Kèm Lens Kit", "Bản Creator (Full PK)"];
    return ["Bản Thường", "Bản Plus", "Bản Pro"];
  };
  const version = getVersions(sanPhamHienTai);

  useEffect(() => {
    setSanPhamHienTai(selectedProduct);
    setActiveImg(selectedProduct.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, selectedProduct]);

  const handleChonSanPhamMoi = (sp) => {
    // Điều hướng sang URL mới của sản phẩm được chọn
    navigate(`/product/${sp.id}`);
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
  const isVideo = (url) => url?.endsWith(".mp4") || url?.endsWith(".webm");
  
  const [flyingStyle, setFlyingStyle] = useState(null);
  const handleAddToCart = () =>{
    addToCart(sanPhamHienTai, 1, version[selectedVersion], mausac[selectedID].mau);

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
      // Bước 2.3: Đợi 600ms (thời gian bay xong), xóa ảnh clone
      setTimeout(() => {
        setFlyingStyle(null);
      }, 600);
    } else {
      // Trường hợp lỗi không tìm thấy phần tử
    }
  };
  const mausac=[
    {image: sanPhamHienTai?.image, mau: "Màu mặc định", gia: `${sanPhamHienTai?.price?.toLocaleString()}$`},
    {image: sanPhamHienTai?.image, mau: "Bạc Titanium", gia: `${((sanPhamHienTai?.price || 0) + 50).toLocaleString()}$`},
    {image: sanPhamHienTai?.image, mau: "Đen nhám", gia: `${sanPhamHienTai?.price?.toLocaleString()}$`},
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
          <ThongSo product={sanPhamHienTai}/>
        </div>

        {/* RIGHT: OPTIONS */}
        <div className="flex flex-col gap-4 pt-8 ">

          {/* TITLE & DESCRIPTION */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">{sanPhamHienTai?.category}</span>
              <span className="text-amber-500 text-sm font-bold flex items-center gap-1">⭐ {sanPhamHienTai?.rating} <span className="text-gray-400 text-xs">({sanPhamHienTai?.reviews} đánh giá)</span></span>
              {sanPhamHienTai?.isNew && <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">Mới</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">{sanPhamHienTai?.name}</h1>
            
            <div className="flex items-end gap-3 mt-3">
              <p className="text-3xl font-black text-blue-600">
                  {sanPhamHienTai?.price?.toLocaleString()}$
              </p>
              {sanPhamHienTai?.oldPrice && (
                <p className="text-lg font-bold text-gray-400 line-through mb-1">
                  {sanPhamHienTai?.oldPrice?.toLocaleString()}$
                </p>
              )}
            </div>
            
            <p className="text-gray-500 mt-4 leading-relaxed text-sm font-medium">
             Sản phẩm <span className="font-bold text-gray-700">{sanPhamHienTai?.name}</span> thuộc dòng <span className="font-bold text-gray-700">{sanPhamHienTai?.category}</span> là một trong những sản phẩm được ưa chuộng nhất với hơn {sanPhamHienTai?.reviews} lượt đánh giá tích cực. Tích hợp thiết kế cao cấp và hiệu năng vượt trội, mang lại trải nghiệm hoàn hảo cho người dùng.
            </p>
          </div>
          
          {/* COLOR */}
          <div className="flex flex-col gap-6 mt-4">
              <div>
                <h2 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">Phiên bản</h2>
                <div className="grid grid-cols-3 gap-3">
                {version.map((item, index) =>(
                  <div 
                    key={index} 
                    onClick={() => setSelectedVersion(index)}
                    className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      selectedVersion === index 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 text-blue-700 shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <p className="text-center font-bold text-sm">{item}</p>
                  </div>
                ))}
                </div>
              </div>

              <div>
                <span className="font-black text-gray-900 uppercase text-sm tracking-widest mb-3 block">Chọn Màu</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mausac.map((color, index) => {
                    const isSelected = selectedID === index;
                    return (
                    <div onClick= {() => setSelectedID(index)}
                      key={index}
                      className={`relative border flex flex-col items-center p-3 gap-2 
                      rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <img src={color.image} className="h-12 w-12 object-contain drop-shadow-sm mix-blend-multiply" />
                      <div className="text-center">
                        <p className={`font-bold text-sm ${isSelected ? "text-blue-800" : "text-gray-800"}`}>{color.mau}</p>
                        <p className={`text-xs font-bold mt-1 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>{color.gia}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-blue-600 bg-white rounded-full shadow-sm">
                          <AiFillCheckCircle className="text-xl" />
                        </div>
                      )}
                    </div>
                  );})}
                </div>
              </div>
          </div>
          {/**So luong */}
          
          {/* CHÂN TRANG: PRICE & BUTTON */}
          <div className="flex  flex-col items-center gap-6 mt-4 pt-8 border-t border-gray-100">
            <button onClick={() => {
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

        <SPLienQuan category = {sanPhamHienTai.category}
        currentId = {sanPhamHienTai.id}
        onSelectProduct={handleChonSanPhamMoi}/>
        <BannerSp sanPhamHienTai={sanPhamHienTai} onMuaNgay = {MuaNgay}
         className="absolute bottom-2 right-4"/>
         <DanhGia sanPhamHienTai={sanPhamHienTai}/>
      </main>
    </div>
  );
}