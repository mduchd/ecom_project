import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { toast } from "../components/Toast.jsx";
import { trackOrder } from "../services/orderService.js";

const stateIcon = {
  DONE: FaCheckCircle,
  CURRENT: FaTruck,
  UPCOMING: FaClock,
  CANCELED: FaTimesCircle,
};

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get("code") || "";
  const queryEmail = searchParams.get("email") || "";

  return (
    <OrderTrackingView
      key={`${queryCode}|${queryEmail}`}
      initialCode={queryCode}
      initialEmail={queryEmail}
    />
  );
}

function OrderTrackingView({ initialCode, initialEmail }) {
  const shouldAutoLookup = Boolean(initialCode.trim() && initialEmail.trim());
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(shouldAutoLookup);
  const [order, setOrder] = useState(null);

  const lookupOrder = useCallback(async (orderCode, orderEmail, showValidationToast = false) => {
    const trimmedCode = orderCode.trim();
    const trimmedEmail = orderEmail.trim();
    if (!trimmedCode || !trimmedEmail) {
      if (showValidationToast) {
        toast.warning("Vui lòng nhập mã đơn hàng và email.");
      }
      return;
    }
    try {
      setLoading(true);
      const data = await trackOrder(trimmedCode, trimmedEmail);
      setOrder(data);
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.message || "Không tìm thấy đơn hàng với thông tin đã cung cấp.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    await lookupOrder(code, email, true);
  };

  useEffect(() => {
    if (!shouldAutoLookup) {
      return undefined;
    }

    let cancelled = false;

    trackOrder(initialCode.trim(), initialEmail.trim())
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOrder(null);
          toast.error(error.response?.data?.message || "Không tìm thấy đơn hàng với thông tin đã cung cấp.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialCode, initialEmail, shouldAutoLookup]);

  return (
    <main className="bg-gray-50 min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <h1 className="text-2xl font-black text-gray-900 text-vi">Theo dõi đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1 text-vi">Nhập mã đơn và email đã dùng khi đặt hàng.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-gray-600 text-vi">Mã đơn hàng</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="SPC2605241830123"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="buyer@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3 font-bold disabled:opacity-60"
            >
              <FaSearch /> {loading ? "Đang tra cứu..." : "Tra cứu"}
            </button>
          </form>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[360px]">
          {!order && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-gray-400">
              <FaTruck className="text-5xl mb-4" />
              <p className="font-bold text-vi">Thông tin tracking sẽ hiển thị tại đây.</p>
            </div>
          )}

          {order && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 text-vi">Mã đơn hàng</p>
                  <h2 className="text-2xl font-black text-blue-600">{order.orderCode}</h2>
                  <p className="text-sm text-gray-500 mt-1">{order.productSummary}</p>
                </div>
                <div className="sm:text-right">
                  <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-black">
                    {order.statusLabel}
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    {Number(order.totalAmount || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm font-semibold text-gray-700">{order.currentMessage}</p>

              <div className="mt-6 space-y-4">
                {order.steps?.map((step) => {
                  const Icon = stateIcon[step.state] || FaClock;
                  const isCurrent = step.state === "CURRENT";
                  const isDone = step.state === "DONE";
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isDone
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{step.label}</p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(step.timestamp).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
