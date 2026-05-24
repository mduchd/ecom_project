import { useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "../components/Toast.jsx";
import { getAllOrders, updateOrderStatus } from "../services/orderService";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      const updated = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
      toast.success(`Cập nhật đơn hàng #${orderId} thành ${STATUS_OPTIONS.find((s) => s.value === status)?.label || status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 text-vi">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500 text-vi">Theo dõi và cập nhật trạng thái đơn hàng.</p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-60 text-vi"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold text-vi">
              <tr>
                <th className="px-6 py-4">Mã</th>
                <th className="px-4 py-4">Khách hàng</th>
                <th className="px-4 py-4">Sản phẩm</th>
                <th className="px-4 py-4 text-right">Tổng tiền</th>
                <th className="px-4 py-4">Thanh toán</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm font-semibold text-gray-400">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm font-semibold text-gray-400">
                    Chưa có đơn hàng.
                  </td>
                </tr>
              )}

              {!loading && orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-5 font-black text-blue-600">#{order.id}</td>
                  <td className="px-4 py-5">
                    <p className="font-bold text-gray-900">{order.receiverName || "Khách hàng"}</p>
                    <p className="text-xs text-gray-400">{order.phoneNumber || "Chưa có SĐT"}</p>
                  </td>
                  <td className="px-4 py-5 min-w-64">
                    <p className="text-sm font-medium text-gray-700 line-clamp-2">
                      {order.items?.map((item) => `${item.productName} x${item.quantity}`).join(", ") || "Không có sản phẩm"}
                    </p>
                    <p className="text-xs text-gray-400">{order.shippingAddress || "Chưa có địa chỉ"}</p>
                  </td>
                  <td className="px-4 py-5 text-right font-black text-gray-900">
                    {Number(order.total || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-5 text-sm font-bold text-gray-600">{order.paymentMethod}</td>
                  <td className="px-4 py-5">
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      disabled={updatingId === order.id}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-black text-gray-700 disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
