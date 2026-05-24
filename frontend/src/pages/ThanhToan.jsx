import { useState, useEffect } from "react";
import { FaShippingFast, FaWallet, FaMoneyCheckAlt, FaArrowRight, FaTimes, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Toast.jsx";
import api from "../services/productService.js";
import { createOrder } from "../services/orderService.js";

export default function ThanhToan() {
  const { cart, clearCart, user } = useAuth();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [showQR, setShowQR] = useState(false);
  const [pendingPaymentOrderCode, setPendingPaymentOrderCode] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  // Tự động kiểm tra trạng thái thanh toán qua Webhook SePay (Polling mỗi 3 giây)
  useEffect(() => {
    let intervalId;
    if (showQR && pendingPaymentOrderCode) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/orders/code/${pendingPaymentOrderCode}`);
          // Khi SePay webhook nhận thanh toán thành công, status chuyển thành "Đang giao" (STATUS_SHIPPING)
          if (response.data && response.data.status === "Đang giao") {
            clearInterval(intervalId);
            setShowQR(false);
            setPendingPaymentOrderCode("");
            toast.success("Thanh toán thành công! Cảm ơn bạn đã mua hàng tại Snapcart.");
            clearCart(true);
            navigate("/");
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showQR, pendingPaymentOrderCode, navigate, clearCart]);
  
  const formatVND = (value) => value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal >= 399000 || subtotal === 0 ? 0 : 30000;
  const tax = 0;
  const grandTotal = subtotal + shipping + tax;
  const transferContent = pendingPaymentOrderCode || "ThanhToanCart";
  const qrUrl = `https://qr.sepay.vn/img?bank=Vietcombank&acc=9339582134&template=compact&amount=${Math.round(grandTotal)}&des=${encodeURIComponent(transferContent)}`;

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.warning("Giỏ hàng của bạn đang trống!");
      return;
    }
    
    const email = user?.email || guestEmail;
    if (!email) {
      setShowEmailModal(true);
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.warning("Vui lòng nhập email hợp lệ");
      setShowEmailModal(true);
      return;
    }
    
    submitOrder(email);
  };

  const submitOrder = async (email) => {
    try {
      const savedOrder = await createOrder({
        customerName: user?.name || "Khách hàng mới",
        customerEmail: email,
        productSummary: cart.map(item => item.name).join(", "),
        totalAmount: Math.round(grandTotal),
        paymentMethod: selectedMethod.toUpperCase()
      });

      api.post("/orders/confirm", {
        email: email,
        fullName: user?.name || "Khách hàng Snapcart",
        orderId: savedOrder?.orderCode || String(savedOrder?.id || ""),
        totalAmount: Math.round(grandTotal),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        }))
      }).catch(err => {
        console.error("Gửi email xác nhận thất bại:", err);
      });

      if (selectedMethod === "momo" || selectedMethod === "bank") {
        setPendingPaymentOrderCode(savedOrder?.orderCode || "ThanhToanCart");
        setShowQR(true);
      } else {
        toast.success("Đặt hàng thành công! Đơn hàng sẽ được thanh toán khi nhận hàng.");
        clearCart(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Tạo đơn hàng thất bại. Vui lòng thử lại.";
      toast.error(msg);
    }
  };
 
  const info_ct = [
    {label: "Họ và tên", place: "Nhập tên của bạn..."},
    {label: "Số điện thoại", place: "Nhập số điện thoại..."},
  ];
  const info_ar = [
    {label: "Thành phố", name: "city", type: "select", options: ["Hà Nội", "TP.HCM", "Đà Nẵng"]},
    {label: "Mã bưu chính", name: "postalCode", type: "input", placeholder: "Nhập mã bưu chính..."},
  ];
  const pay_method = [
    {id: "momo", icon: FaWallet, label: "Ví MoMo"},
    {id: "bank", icon: FaMoneyCheckAlt, label: "Chuyển khoản (QR)"},
    {id: "cod", icon: FaShippingFast, label: "Thanh toán khi nhận hàng"},
  ];
  return (
    <div className="bg-gray-50 min-h-screen">
      <main lang="vi" className={"max-w-7xl mx-auto px-10 py-5 grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-12 bg-white shadow-sm border border-gray-100 flex"}>
        
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-vi">Thanh toán an toàn</h1>
          {/**Thông tin giao hàng */}
          <div className ="bg-white p-4 rounded-lg flex flex-col gap-3 border border-gray-200">
            <div className="flex items-center gap-4">
              <FaShippingFast className="text-xl text-blue-600" />
              <h2 className="text-2xl text-vi">Thông tin giao hàng</h2>
            </div>

            <div className="flex justify-between gap-5">
              {info_ct.map((item, index) => (
                <div key={item.label} className="flex flex-col w-1/2 gap-2">
                <span className="font-bold text-vi">{item.label}</span>
                <input placeholder={item.place}
                 className="h-10 w-full border border-gray-200 rounded-lg p-1">
                </input>
              </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-bold text-vi">Địa chỉ giao hàng</span>
              <input 
              placeholder="Nhập địa chỉ nhận hàng..."
              className="h-10 w-full border border-gray-200 p-1 rounded-lg">
              </input>
            </div>

            <div className ="flex justify-between gap-4">
              {info_ar.map((item) => (
                <div key={item.name} className="flex flex-col gap-2 w-full">
                  <span className="font-bold text-vi">{item.label}</span>
                  {item.type ==="select" ? (
                    <select className = "h-10 w-full border border-gray-200 rounded-lg p-1">
                      <option value ="">Chọn</option>
                      {item.options.map((opt, i)=> (

                        <option key={i} value={opt} >
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) :(
                    <input placeholder={item.placeholder} className ={"h-10 border border-gray-200 rounded-lg p-1"}></input>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/**Phương thức thanh toán */}
          <div className="bg-white flex flex-col gap-3 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <FaWallet className="text-xl text-blue-600" />
                <h2 className="text-2xl text-vi">Phương thức thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {pay_method.map((item)=>(
                  <div 
                    key={item.id}
                    onClick={() => setSelectedMethod(item.id)}
                    className={`p-4 w-full border ${selectedMethod === item.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'} 
                    flex flex-col justify-center items-center gap-2 hover:border-blue-400 rounded-xl hover:shadow-md 
                    active:scale-95 transition-all duration-200 cursor-pointer`}
                  >
                    <item.icon className={`text-3xl ${selectedMethod === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-bold text-sm text-center">{item.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Dynamic Content based on Payment Method */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                {selectedMethod === "momo" && (
                  <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                    <p className="font-bold text-pink-600 text-lg text-vi">Mở ứng dụng MoMo và quét mã QR</p>
                    <p className="text-sm text-vi">Mã QR thanh toán sẽ hiển thị sau khi bạn nhấn nút đặt hàng bên cạnh.</p>
                  </div>
                )}
                {selectedMethod === "bank" && (
                  <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                    <p className="font-bold text-blue-600 text-lg">Chuyển khoản ngân hàng (Vietcombank)</p>
                    <p className="text-sm text-vi">Quét mã QR chuyển khoản hoặc sao chép STK sẽ được cung cấp ở bước tiếp theo.</p>
                  </div>
                )}
                {selectedMethod === "cod" && (
                  <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                    <p className="font-bold text-emerald-600 text-lg">Thanh toán bằng tiền mặt</p>
                    <p className="text-sm">Bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng sau khi kiểm tra đầy đủ sản phẩm.</p>
                  </div>
                )}
              </div>
          </div>
        </div>
        {/**Thẻ phải */}
        <div className="w-full flex flex-col p-5 bg-white rounded-lg gap-3 border border-gray-200">
          <span className="font-semibold text-2xl text-vi">Tóm tắt đơn hàng</span>
          
          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.cartId} className="flex">
                 <img src={item.image} alt={item.name} className ="w-20 h-20 object-cover bg-gray-100 rounded-lg" />
                <div className="ml-5 flex flex-col justify-center gap-1">
                    <span className="font-bold text-gray-800 text-[15px]">{item.name}</span>
                      <p className="text-gray-500 text-[12px] font-medium text-vi">
                        SL: {item.qty} {item.variant && `| ${item.variant}`} {item.color && `| ${item.color}`}
                      </p>
                      <span className="font-semibold text-[15px]">{formatVND(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-0 w-full border-t border-gray-300 my-2"></div>
          
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Tạm tính</span>
            <span className="font-semibold">{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Phí vận chuyển</span>
            <span className="font-semibold">{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Thuế</span>
            <span className="font-semibold">{formatVND(tax)}</span>
          </div>

          <div className="flex justify-between items-center mt-2 border-t border-gray-200 pt-3">
            <span className="text-gray-500 font-semibold text-vi">Tổng cộng</span>
            <span className="font-black text-2xl text-blue-600">{formatVND(grandTotal)}</span>
          </div>

          {selectedMethod !== "cod" ? (
            <button
              onClick={handlePlaceOrder}
              className="w-full flex items-center justify-center gap-2 border 
             p-3 bg-blue-600 rounded-xl hover:scale-[1.02] hover:bg-blue-700 shadow-lg 
             active:scale-95 transition-all hover:shadow-gray-700 duration-300 cursor-pointer mt-2">
               <span className="text-white font-bold text-xl text-vi">Đặt hàng và thanh toán</span>
               <FaArrowRight className="text-white"/>
             </button>
           ) : (
             <button
              onClick={handlePlaceOrder}
              className="w-full flex items-center justify-center gap-2 border 
             p-3 bg-emerald-600 rounded-xl hover:scale-[1.02] hover:bg-emerald-700 shadow-lg 
             active:scale-95 transition-all hover:shadow-gray-700 duration-300 cursor-pointer mt-2">
               <span className="text-white font-bold text-xl text-vi">Đặt hàng</span>
               <FaArrowRight className="text-white"/>
             </button>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fadeIn relative">
             <button 
               onClick={() => {
                 setShowQR(false);
                 setPendingPaymentOrderCode("");
               }}
               className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors"
             >
               <FaTimes />
             </button>
             <div className="p-6 text-center">
               <div className="flex justify-center mb-4">
                 <div className={`p-4 rounded-full ${selectedMethod === 'momo' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                   {selectedMethod === 'momo' ? <FaWallet className="text-3xl" /> : <FaMoneyCheckAlt className="text-3xl" />}
                 </div>
               </div>
              <h3 className="text-xl font-black text-gray-900 mb-1 text-vi">Quét mã QR để thanh toán</h3>
              <p className="text-sm text-gray-500 mb-6 text-vi">Mở ứng dụng {selectedMethod === 'momo' ? 'MoMo' : 'Ngân hàng'} và quét mã bên dưới</p>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-center mb-6">
                <img src={qrUrl} alt="Mã QR thanh toán" className="w-56 h-auto mix-blend-multiply" />
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setShowQR(false);
                    setPendingPaymentOrderCode("");
                    toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
                    clearCart(true);
                    setTimeout(() => navigate("/"), 2000);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Đã hoàn tất thanh toán
                </button>
                <button 
                  onClick={() => {
                    setShowQR(false);
                    setPendingPaymentOrderCode("");
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Hủy thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Guest Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative border border-gray-100">
             <button 
               onClick={() => setShowEmailModal(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors"
             >
               <FaTimes className="w-4 h-4" />
             </button>
             
             <div className="text-center mb-6">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                 <FaEnvelope className="w-6 h-6" />
               </div>
              <h3 className="text-lg font-black text-gray-900">Nhận hóa đơn điện tử</h3>
              <p className="text-xs text-gray-500 mt-1 text-vi">Vui lòng cung cấp email của bạn để chúng tôi tự động gửi hóa đơn xác nhận đơn hàng.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 text-vi">Email</label>
                <input 
                  type="email"
                  placeholder="email@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!guestEmail.trim()) {
                        toast.warning("Vui lòng nhập email!");
                        return;
                      }
                      if (!guestEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                        toast.warning("Vui lòng nhập email hợp lệ");
                        return;
                      }
                      setShowEmailModal(false);
                      submitOrder(guestEmail);
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => {
                    if (!guestEmail.trim()) {
                      toast.warning("Vui lòng nhập email!");
                      return;
                    }
                    if (!guestEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                      toast.warning("Vui lòng nhập email hợp lệ");
                      return;
                    }
                    setShowEmailModal(false);
                    submitOrder(guestEmail);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-blue-100"
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
