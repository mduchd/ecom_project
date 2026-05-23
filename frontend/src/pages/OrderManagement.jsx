import { useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "../components/Toast.jsx";
import { getAllOrders, updateOrderStatus } from "../services/orderService";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

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
      toast.success(`Cập nhật đơn hàng #${orderId} thành ${status}`);
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
            <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500">Theo dõi và cập nhật trạng thái đơn hàng.</p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm font-semibold text-gray-400">
                    Loading orders...
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
                    <p className="text-xs text-gray-400">{order.phoneNumber || "No phone"}</p>
                  </td>
                  <td className="px-4 py-5 min-w-64">
                    <p className="text-sm font-medium text-gray-700 line-clamp-2">
                      {order.items?.map((item) => `${item.productName} x${item.quantity}`).join(", ") || "No items"}
                    </p>
                    <p className="text-xs text-gray-400">{order.shippingAddress || "No address"}</p>
                  </td>
                  <td className="px-4 py-5 text-right font-black text-gray-900">
                    ${Number(order.total || 0).toLocaleString()}
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
                        <option key={status} value={status}>{status}</option>
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
