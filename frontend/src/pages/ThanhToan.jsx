import { useEffect, useState } from "react";
import { FaArrowRight, FaMoneyCheckAlt, FaShippingFast, FaTimes, FaWallet } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createOrder, quoteOrder } from "../services/orderService";
import { calculateDiscount, VALID_COUPONS } from "../utils/orderPricing.js";

const SAVED_COUPON_KEY = "snapcart_coupon";

function readSavedCouponCode() {
  try {
    const saved = localStorage.getItem(SAVED_COUPON_KEY);
    if (!saved) return "";
    const parsed = JSON.parse(saved);
    return VALID_COUPONS[parsed?.code] ? parsed.code : "";
  } catch {
    localStorage.removeItem(SAVED_COUPON_KEY);
    return "";
  }
}

export default function ThanhToan() {
  const { cart, clearCart, addOrder } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode] = useState(() => location.state?.couponCode || readSavedCouponCode());
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [showQR, setShowQR] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderQuote, setOrderQuote] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [delivery, setDelivery] = useState({
    receiverName: "",
    phoneNumber: "",
    shippingAddress: "",
    city: "",
    postalCode: "",
  });

  const localSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const localShipping = localSubtotal >= 399 || localSubtotal === 0 ? 0 : 29;
  const localDiscount = calculateDiscount(localSubtotal, couponCode);
  const subtotal = Number(orderQuote?.subtotal ?? localSubtotal);
  const shipping = Number(orderQuote?.shippingFee ?? localShipping);
  const discount = Number(orderQuote?.discount ?? localDiscount);
  const taxAmount = Number(orderQuote?.taxAmount ?? 0);
  const appliedCouponCode = orderQuote?.couponCode ?? couponCode;
  const grandTotal = Number(orderQuote?.total ?? Math.max(subtotal + shipping + taxAmount - discount, 0));
  const qrTotal = paymentAmount ?? grandTotal;
  const qrUrl = `https://qr.sepay.vn/img?bank=Vietcombank&acc=9339582134&template=compact&amount=${Math.round(qrTotal)}&des=${encodeURIComponent("Thanh toán giỏ hàng")}`;

  const paymentMethods = [
    { id: "momo", icon: FaWallet, label: "Ví MoMo" },
    { id: "bank", icon: FaMoneyCheckAlt, label: "Chuyển khoản QR" },
    { id: "cod", icon: FaShippingFast, label: "Thanh toán khi nhận hàng" },
  ];

  const updateDelivery = (field, value) => {
    setDelivery((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    let cancelled = false;
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.qty,
    }));

    setPaymentAmount(null);
    if (items.length === 0 || !localStorage.getItem("snapcart_token")) {
      setOrderQuote(null);
      return;
    }

    quoteOrder(items, couponCode)
      .then((quote) => {
        if (!cancelled) setOrderQuote(quote);
      })
      .catch(() => {
        if (!cancelled) setOrderQuote(null);
      });

    return () => {
      cancelled = true;
    };
  }, [cart, couponCode]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.qty,
      })),
      receiverName: delivery.receiverName.trim() || "Khách hàng mới",
      phoneNumber: delivery.phoneNumber.trim(),
      shippingAddress: delivery.shippingAddress.trim(),
      city: delivery.city.trim(),
      postalCode: delivery.postalCode.trim(),
      couponCode,
      paymentMethod: selectedMethod === "cod" ? "COD" : selectedMethod === "momo" ? "MOMO" : "BANK",
    };

    try {
      setPlacingOrder(true);
      const savedOrder = await createOrder(payload);
      const savedTotal = Number(savedOrder.total ?? grandTotal);
      setPaymentAmount(savedTotal);
      addOrder({
        customer: savedOrder.receiverName || payload.receiverName,
        product: savedOrder.items?.map((item) => item.productName).join(", ") || cart.map((item) => item.name).join(", "),
        total: `${savedTotal.toLocaleString()}$`,
        method: savedOrder.paymentMethod || payload.paymentMethod,
      });
      clearCart(true);

      if (selectedMethod === "momo" || selectedMethod === "bank") {
        setShowQR(true);
        return;
      }

      toast.success("Đặt hàng thành công! Đơn hàng sẽ được thanh toán khi nhận hàng.");
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đặt hàng.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div lang="vi" className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-8 bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-vi">Thanh toán</h1>

          <section className="bg-white p-4 rounded-lg flex flex-col gap-4 border border-gray-200">
            <div className="flex items-center gap-4">
              <FaShippingFast className="text-xl text-blue-600" />
              <h2 className="text-2xl text-vi">Thông tin giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-bold text-vi">Họ và tên</span>
                <input
                  value={delivery.receiverName}
                  onChange={(event) => updateDelivery("receiverName", event.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="h-10 w-full border border-gray-200 rounded-lg p-2 text-vi"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-bold text-vi">Số điện thoại</span>
                <input
                  value={delivery.phoneNumber}
                  onChange={(event) => updateDelivery("phoneNumber", event.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="h-10 w-full border border-gray-200 rounded-lg p-2 text-vi"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-bold text-vi">Địa chỉ giao hàng</span>
              <input
                value={delivery.shippingAddress}
                onChange={(event) => updateDelivery("shippingAddress", event.target.value)}
                placeholder="Nhập địa chỉ nhận hàng..."
                className="h-10 w-full border border-gray-200 rounded-lg p-2 text-vi"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-bold text-vi">Thành phố</span>
                <select
                  value={delivery.city}
                  onChange={(event) => updateDelivery("city", event.target.value)}
                  className="h-10 w-full border border-gray-200 rounded-lg p-2 text-vi"
                >
                  <option value="">Chọn</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP.HCM">TP.HCM</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-bold text-vi">Mã bưu chính</span>
                <input
                  value={delivery.postalCode}
                  onChange={(event) => updateDelivery("postalCode", event.target.value)}
                  placeholder="Nhập mã bưu chính..."
                  className="h-10 w-full border border-gray-200 rounded-lg p-2 text-vi"
                />
              </label>
            </div>
          </section>

          <section className="bg-white flex flex-col gap-4 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <FaWallet className="text-xl text-blue-600" />
              <h2 className="text-2xl text-vi">Phương thức thanh toán</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentMethods.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedMethod(item.id)}
                  className={`p-4 w-full border ${selectedMethod === item.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700"} flex flex-col justify-center items-center gap-2 hover:border-blue-400 rounded-xl hover:shadow-md active:scale-95 transition-all duration-200`}
                >
                  <item.icon className={`text-3xl ${selectedMethod === item.id ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="font-bold text-sm text-center text-vi">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              {selectedMethod === "momo" && (
                <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                  <p className="font-bold text-pink-600 text-lg text-vi">Mở ứng dụng MoMo để quét mã QR</p>
                  <p className="text-sm text-vi">Mã QR thanh toán sẽ hiển thị sau khi bạn nhấn nút đặt hàng bên cạnh.</p>
                </div>
              )}
              {selectedMethod === "bank" && (
                <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                  <p className="font-bold text-blue-600 text-lg text-vi">Chuyển khoản ngân hàng Vietcombank</p>
                  <p className="text-sm text-vi">Quét mã QR chuyển khoản sau khi đơn hàng được tạo thành công.</p>
                </div>
              )}
              {selectedMethod === "cod" && (
                <div className="flex flex-col items-center gap-2 text-center text-gray-600">
                  <p className="font-bold text-emerald-600 text-lg text-vi">Thanh toán bằng tiền mặt</p>
                  <p className="text-sm text-vi">Bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng sau khi kiểm tra sản phẩm.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="w-full flex flex-col p-5 bg-white rounded-lg gap-3 border border-gray-200 h-fit">
          <span className="font-semibold text-2xl text-vi">Tóm tắt đơn hàng</span>

          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.cartId} className="flex">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-gray-100 rounded-lg" />
                <div className="ml-5 flex flex-col justify-center gap-1">
                  <span className="font-bold text-gray-800 text-[15px]">{item.name}</span>
                  <p className="text-gray-500 text-[12px] font-medium text-vi">
                    SL: {item.qty} {item.variant && `| ${item.variant}`} {item.color && `| ${item.color}`}
                  </p>
                  <span className="font-semibold text-[15px]">${(item.price * item.qty)?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-0 w-full border-t border-gray-300 my-2" />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Tạm tính</span>
            <span className="font-semibold">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Phí vận chuyển</span>
            <span className="font-semibold">{shipping === 0 ? "Miễn phí" : `$${shipping}`}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-600 text-vi">Giảm giá {appliedCouponCode ? `(${appliedCouponCode})` : ""}</span>
              <span className="font-semibold text-emerald-600">-${discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600 text-vi">Thuế</span>
            <span className="font-semibold">${taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-2 border-t border-gray-200 pt-3">
            <span className="text-gray-500 font-semibold text-vi">Tổng cộng</span>
            <span className="font-black text-2xl text-blue-600">${grandTotal.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className={`w-full flex items-center justify-center gap-2 border p-3 rounded-xl shadow-lg active:scale-95 transition-all duration-300 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed ${selectedMethod === "cod" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            <span className="text-white font-bold text-xl tracking-normal text-vi">
              {placingOrder ? "Đang xử lý..." : selectedMethod === "cod" ? "Đặt hàng" : "Đặt hàng & thanh toán"}
            </span>
            <FaArrowRight className="text-white" />
          </button>
        </aside>
      </main>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${selectedMethod === "momo" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}>
                  {selectedMethod === "momo" ? <FaWallet className="text-3xl" /> : <FaMoneyCheckAlt className="text-3xl" />}
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1 text-vi">Quét mã QR để thanh toán</h3>
              <p className="text-sm text-gray-500 mb-6 text-vi">Mở ứng dụng {selectedMethod === "momo" ? "MoMo" : "Ngân hàng"} để quét mã bên dưới</p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-center mb-6">
                <img src={qrUrl} alt="Mã QR thanh toán" className="w-56 h-auto mix-blend-multiply" />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowQR(false);
                    toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
                    setTimeout(() => navigate("/"), 1200);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-vi"
                >
                  Đã hoàn tất thanh toán
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-vi"
                >
                  Hủy thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
