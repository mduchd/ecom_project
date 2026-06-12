import { useCallback, useEffect, useState } from "react";
import { FaShippingFast, FaWallet, FaMoneyCheckAlt, FaArrowRight, FaTimes, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Toast.jsx";
import api from "../services/productService.js";
import { createOrder, cancelPendingOrder } from "../services/orderService.js";
import { layCauHinhCheckout } from "../services/diemTichLuyService.js";
import { saveRecentOrder, updateRecentOrderStatus } from "../utils/recentOrders.js";

const DEFAULT_LOYALTY = {
  pointValue: 1000,
  maxRedeemPercent: 30,
  enabled: false,
};

const EMPTY_SHIPPING = {
  fullName: "",
  phoneNumber: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function ThanhToan() {
  const { cart, clearCart, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState(EMPTY_SHIPPING);
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [showQR, setShowQR] = useState(false);
  const [pendingPaymentOrderCode, setPendingPaymentOrderCode] = useState("");
  const [pendingPaymentEmail, setPendingPaymentEmail] = useState("");
  const [pendingCancelToken, setPendingCancelToken] = useState("");
  const [qrPayableAmount, setQrPayableAmount] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loyaltySettings, setLoyaltySettings] = useState(DEFAULT_LOYALTY);
  const [loyaltySettingsLoaded, setLoyaltySettingsLoaded] = useState(false);
  const [loyaltySettingsFailed, setLoyaltySettingsFailed] = useState(false);

  const finishSuccessfulPayment = useCallback(async (status, statusLabel) => {
    const orderCode = pendingPaymentOrderCode;
    const orderEmail = pendingPaymentEmail;

    setShowQR(false);
    updateRecentOrderStatus(orderCode, status, statusLabel);
    setPendingPaymentOrderCode("");
    setPendingPaymentEmail("");
    setPendingCancelToken("");
    setQrPayableAmount(0);
    toast.success("Thanh toán thành công! Cảm ơn bạn đã mua hàng tại Snapcart.");
    if (user) {
      await refreshProfile();
    }
    clearCart(true);
    navigate(`/track-order?code=${encodeURIComponent(orderCode)}&email=${encodeURIComponent(orderEmail)}`);
  }, [pendingPaymentOrderCode, pendingPaymentEmail, user, refreshProfile, clearCart, navigate]);

  const checkPendingPaymentStatus = useCallback(async ({ silent = false } = {}) => {
    if (!pendingPaymentOrderCode || !pendingPaymentEmail) {
      return false;
    }

    try {
      const response = await api.get("/orders/track", {
        params: { code: pendingPaymentOrderCode, email: pendingPaymentEmail },
      });
      const nextStatus = response.data?.status;
      const nextStatusLabel = response.data?.statusLabel || "Đã thanh toán";

      if (nextStatus === "PAID" || nextStatus === "SHIPPING" || nextStatus === "DELIVERED") {
        await finishSuccessfulPayment(nextStatus, nextStatusLabel);
        return true;
      }

      if (!silent) {
        toast.info("Hệ thống chưa nhận được webhook thanh toán. Vui lòng chờ thêm vài giây rồi kiểm tra lại.");
      }
      return false;
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      if (!silent) {
        toast.error("Không kiểm tra được trạng thái thanh toán lúc này. Vui lòng thử lại.");
      }
      return false;
    }
  }, [pendingPaymentOrderCode, pendingPaymentEmail, finishSuccessfulPayment]);

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [user?.id, refreshProfile]);

  useEffect(() => {
    if (!user) return;
    setShippingInfo((current) => {
      const isEmpty = Object.values(current).every((value) => !String(value || "").trim());
      if (!isEmpty) return current;
      return {
        fullName: user.fullName || user.name || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      };
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    layCauHinhCheckout()
      .then((settings) => {
        if (cancelled) return;
        setLoyaltySettings({
          pointValue: Number(settings.pointValue ?? DEFAULT_LOYALTY.pointValue),
          maxRedeemPercent: Number(settings.maxRedeemPercent ?? DEFAULT_LOYALTY.maxRedeemPercent),
          enabled: settings.enabled === true || settings.isEnabled === true,
        });
        setLoyaltySettingsFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Không tải được cấu hình điểm tích lũy:", error);
        setLoyaltySettings(DEFAULT_LOYALTY);
        setLoyaltySettingsFailed(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoyaltySettingsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Tự động kiểm tra trạng thái thanh toán qua Webhook SePay (Polling mỗi 3 giây)
  useEffect(() => {
    let intervalId;
    if (showQR && pendingPaymentOrderCode && pendingPaymentEmail) {
      intervalId = setInterval(() => {
        checkPendingPaymentStatus({ silent: true });
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showQR, pendingPaymentOrderCode, pendingPaymentEmail, checkPendingPaymentStatus]);

  const formatVND = (value) => value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  const buildShippingAddress = (info) => {
    return [info.address, info.city, info.postalCode]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");
  };
  const updateShippingField = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };
  const validateShippingInfo = () => {
    const fullName = shippingInfo.fullName.trim();
    const phoneNumber = shippingInfo.phoneNumber.trim();
    const address = shippingInfo.address.trim();
    const city = shippingInfo.city.trim();
    const postalCode = shippingInfo.postalCode.trim();

    if (!fullName) {
      toast.warning("Vui lòng nhập họ và tên.");
      return false;
    }
    if (!phoneNumber) {
      toast.warning("Vui lòng nhập số điện thoại.");
      return false;
    }
    if (!/^[0-9+\-\s()]{8,15}$/.test(phoneNumber)) {
      toast.warning("Số điện thoại không hợp lệ.");
      return false;
    }
    if (!address) {
      toast.warning("Vui lòng nhập địa chỉ giao hàng.");
      return false;
    }
    if (!city) {
      toast.warning("Vui lòng chọn thành phố.");
      return false;
    }
    if (!postalCode) {
      toast.warning("Vui lòng nhập mã bưu chính.");
      return false;
    }
    return true;
  };
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal >= 399000 || subtotal === 0 ? 0 : 30000;
  const tax = 0;
  const availablePoints = user?.points || 0;
  const pointValue = Number(loyaltySettings.pointValue || DEFAULT_LOYALTY.pointValue);
  const maxRedeemPercent = Number(loyaltySettings.maxRedeemPercent || DEFAULT_LOYALTY.maxRedeemPercent);
  const loyaltyEnabled = loyaltySettingsLoaded && !loyaltySettingsFailed && Boolean(loyaltySettings.enabled);
  const maxPointDiscount = loyaltyEnabled
    ? Math.floor(subtotal * (maxRedeemPercent / 100))
    : 0;
  const requestedPointDiscount = pointsToUse * pointValue;
  const pointDiscount = loyaltyEnabled
    ? Math.min(requestedPointDiscount, maxPointDiscount, subtotal)
    : 0;
  const grandTotal = subtotal + shipping + tax - pointDiscount;
  const transferContent = pendingPaymentOrderCode || "ThanhToanCart";
  const qrAmount = qrPayableAmount > 0 ? qrPayableAmount : Math.round(grandTotal);
  const bankName = import.meta.env.VITE_BANK_NAME || "MB";
  const bankAcc = import.meta.env.VITE_BANK_ACC || "0368163301";
  const qrUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAcc}&template=compact&amount=${qrAmount}&des=${encodeURIComponent(transferContent)}`;

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.warning("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!validateShippingInfo()) {
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
    if (!validateShippingInfo()) {
      return;
    }

    try {
      const savedOrder = await createOrder({
        customerName: shippingInfo.fullName.trim(),
        customerEmail: email,
        customerPhone: shippingInfo.phoneNumber.trim(),
        shippingAddress: buildShippingAddress(shippingInfo),
        items: cart.map(item => ({ productId: item.id, quantity: item.qty })),
        paymentMethod: selectedMethod.toUpperCase(),
        pointsToRedeem: loyaltyEnabled ? pointsToUse : 0,
      });

      const payableAmount = Math.round(Number(savedOrder?.totalAmount || grandTotal));
      if (user) {
        await refreshProfile();
      }

      saveRecentOrder({
        orderCode: savedOrder?.orderCode,
        email,
        productSummary: cart.map(item => item.name).join(", "),
        totalAmount: payableAmount,
        paymentMethod: selectedMethod.toUpperCase(),
        status: "PENDING",
        statusLabel: "Chờ xử lý",
        createdAt: savedOrder?.createdAt || new Date().toISOString(),
      });


      if (selectedMethod === "momo" || selectedMethod === "bank") {
        setPendingPaymentOrderCode(savedOrder?.orderCode || "ThanhToanCart");
        setPendingPaymentEmail(email);
        setPendingCancelToken(savedOrder?.cancelToken || "");
        setQrPayableAmount(payableAmount);
        setShowQR(true);
      } else {
        toast.success("Đặt hàng thành công! Bạn có thể theo dõi trạng thái đơn hàng.");
        clearCart(true);
        navigate(`/track-order?code=${encodeURIComponent(savedOrder?.orderCode || "")}&email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Tạo đơn hàng thất bại. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  const handleCancelPendingPayment = async () => {
    const orderCode = pendingPaymentOrderCode;
    const cancelToken = pendingCancelToken;
    setShowQR(false);
    setPendingPaymentOrderCode("");
    setPendingPaymentEmail("");
    setPendingCancelToken("");
    setQrPayableAmount(0);

    if (!orderCode) {
      return;
    }

    try {
      await cancelPendingOrder(orderCode, cancelToken);
      if (user) {
        await refreshProfile();
      }
      toast.success("Đã hủy thanh toán và hoàn lại điểm nếu có.");
    } catch (error) {
      const msg = error.response?.data?.message || "Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.";
      toast.error(msg);
    }
  };

  const info_ct = [
    { label: "Họ và tên", name: "fullName", place: "Nhập tên của bạn..." },
    { label: "Số điện thoại", name: "phoneNumber", place: "Nhập số điện thoại..." },
  ];
  const info_ar = [
    { label: "Thành phố", name: "city", type: "select", options: ["Hà Nội", "TP.HCM", "Đà Nẵng"] },
    { label: "Mã bưu chính", name: "postalCode", type: "input", placeholder: "Nhập mã bưu chính..." },
  ];
  const pay_method = [
    { id: "momo", icon: FaWallet, label: "Ví MoMo" },
    { id: "bank", icon: FaMoneyCheckAlt, label: "Chuyển khoản (QR)" },
    { id: "cod", icon: FaShippingFast, label: "Thanh toán khi nhận hàng" },
  ];
  return (
    <div className="bg-gray-50 min-h-screen">
      <main lang="vi" className={"max-w-7xl mx-auto px-10 py-5 grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-12 bg-white shadow-sm border border-gray-100 flex"}>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-vi">Thanh toán an toàn</h1>
          {/**Thông tin giao hàng */}
          <div className="bg-white p-4 rounded-lg flex flex-col gap-3 border border-gray-200">
            <div className="flex items-center gap-4">
              <FaShippingFast className="text-xl text-blue-600" />
              <h2 className="text-2xl text-vi">Thông tin giao hàng</h2>
            </div>

            <div className="flex justify-between gap-5">
              {info_ct.map((item) => (
                <div key={item.name} className="flex flex-col w-1/2 gap-2">
                  <span className="font-bold text-vi">{item.label}</span>
                  <input
                    placeholder={item.place}
                    value={shippingInfo[item.name]}
                    onChange={(event) => updateShippingField(item.name, event.target.value)}
                    className="h-10 w-full border border-gray-200 rounded-lg p-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-bold text-vi">Địa chỉ giao hàng</span>
              <input
                placeholder="Nhập địa chỉ nhận hàng..."
                value={shippingInfo.address}
                onChange={(event) => updateShippingField("address", event.target.value)}
                className="h-10 w-full border border-gray-200 p-1 rounded-lg"
              />
            </div>

            <div className="flex justify-between gap-4">
              {info_ar.map((item) => (
                <div key={item.name} className="flex flex-col gap-2 w-full">
                  <span className="font-bold text-vi">{item.label}</span>
                  {item.type === "select" ? (
                    <select
                      value={shippingInfo[item.name]}
                      onChange={(event) => updateShippingField(item.name, event.target.value)}
                      className="h-10 w-full border border-gray-200 rounded-lg p-1"
                    >
                      <option value="">Chọn</option>
                      {item.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder={item.placeholder}
                      value={shippingInfo[item.name]}
                      onChange={(event) => updateShippingField(item.name, event.target.value)}
                      className="h-10 border border-gray-200 rounded-lg p-1 w-full"
                    />
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
              {pay_method.map((item) => (
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
                  <p className="font-bold text-blue-600 text-lg">Chuyển khoản ngân hàng ({bankName})</p>
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
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-gray-100 rounded-lg" />
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

          {user && !loyaltySettingsLoaded && (
            <p className="text-xs text-gray-400 text-vi">Đang tải cấu hình điểm tích lũy...</p>
          )}

          {user && loyaltySettingsLoaded && loyaltySettingsFailed && (
            <p className="text-xs text-amber-600 text-vi">
              Không tải được cấu hình điểm tích lũy.
            </p>
          )}

          {user && loyaltyEnabled && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-gray-900 text-vi">Dùng điểm tích lũy</p>
                  <p className="text-xs text-gray-500 text-vi">
                    Bạn có {availablePoints.toLocaleString("vi-VN")} điểm. Tối đa giảm {formatVND(maxPointDiscount)} ({maxRedeemPercent}% tạm tính).
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={availablePoints}
                  value={pointsToUse}
                  onChange={(event) => {
                    const next = Math.max(0, Math.min(Number(event.target.value || 0), availablePoints));
                    setPointsToUse(next);
                  }}
                  className="w-24 rounded-lg border border-blue-200 bg-white px-3 py-2 text-right text-sm font-bold outline-none focus:border-blue-500"
                />
              </div>
              {pointDiscount > 0 && (
                <div className="flex justify-between text-sm font-bold text-blue-700">
                  <span className="text-vi">Giảm từ điểm</span>
                  <span>-{formatVND(pointDiscount)}</span>
                </div>
              )}
            </div>
          )}

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
              <FaArrowRight className="text-white" />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              className="w-full flex items-center justify-center gap-2 border 
             p-3 bg-emerald-600 rounded-xl hover:scale-[1.02] hover:bg-emerald-700 shadow-lg 
             active:scale-95 transition-all hover:shadow-gray-700 duration-300 cursor-pointer mt-2">
              <span className="text-white font-bold text-xl text-vi">Đặt hàng</span>
              <FaArrowRight className="text-white" />
            </button>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fadeIn relative">
            <button
              onClick={handleCancelPendingPayment}
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
                  onClick={() => checkPendingPaymentStatus()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Kiểm tra thanh toán
                </button>
                <button
                  onClick={handleCancelPendingPayment}
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
