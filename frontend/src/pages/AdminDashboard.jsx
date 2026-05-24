import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getProducts } from "../services/productService";
import { getOrders, updateOrderStatus as updateOrderStatusApi } from "../services/orderService.js";
import { toast } from "../components/Toast.jsx";
import {
  FaChartLine,
  FaBox,
  FaUsers,
  FaDolly,
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaBell,
  FaCheck,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

const ORDER_STATUS = {
  PENDING: "Chờ duyệt",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELED: "Đã hủy",
};

function parsePrice(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;

  const raw = String(value).replace(/[^\d.,-]/g, "").trim();
  if (!raw) return 0;

  let normalized = raw;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/,/g, "");
  } else if (normalized.includes(",") && !normalized.includes(".")) {
    normalized = normalized.replace(/,/g, ".");
  } else if ((normalized.match(/\./g) || []).length > 1) {
    normalized = normalized.replace(/\./g, "");
  }

  return Number.parseFloat(normalized) || 0;
}

function formatVND(value) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function normalizeStatus(input) {
  const text = String(input || "").toLowerCase();

  if (text.includes("đã giao") || text.includes("da giao") || text.includes("delivered") || text.includes("ﾄ静｣ giao")) {
    return ORDER_STATUS.DELIVERED;
  }
  if (text.includes("đang giao") || text.includes("dang giao") || text.includes("shipping") || text.includes("ﾄ紳ng giao")) {
    return ORDER_STATUS.SHIPPING;
  }
  if (text.includes("đã hủy") || text.includes("da huy") || text.includes("cancel") || text.includes("ﾄ静｣ h盻ｧy")) {
    return ORDER_STATUS.CANCELED;
  }

  return ORDER_STATUS.PENDING;
}

function StatCard({ label, value, icon, colorClass, trend }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl text-white ${colorClass} shadow-lg shadow-gray-200`}>{icon}</div>
        <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <p className="text-gray-400 font-bold text-sm text-vi">{label}</p>
      <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("revenue");
  const [search, setSearch] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const products = await getProducts();
        if (mounted) setProductsCount(products.length);
      } catch {
        if (mounted) setProductsCount(0);
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await getOrders();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) {
          setOrders([]);
          toast.error("Không tải được danh sách đơn hàng.");
        }
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedOrders = useMemo(() => {
    return (orders || []).map((order) => ({
      id: order.id,
      code: order.orderCode,
      customer: order.customerName,
      product: order.productSummary,
      method: order.paymentMethod,
      date: order.createdAt,
      normalizedStatus: normalizeStatus(order.status),
      numericTotal: parsePrice(order.totalAmount),
    }));
  }, [orders]);

  const deliveredOrders = normalizedOrders.filter((order) => order.normalizedStatus === ORDER_STATUS.DELIVERED);
  const pendingOrders = normalizedOrders.filter((order) => order.normalizedStatus === ORDER_STATUS.PENDING);
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.numericTotal, 0);

  const monthlyRevenue = useMemo(() => {
    const values = Array(12).fill(0);
    deliveredOrders.forEach((order) => {
      const date = new Date(order.date);
      if (!Number.isNaN(date.getTime())) {
        values[date.getMonth()] += order.numericTotal;
      }
    });
    return values;
  }, [deliveredOrders]);

  const chartMax = Math.max(...monthlyRevenue, 1);

  const trends = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentRevenue = monthlyRevenue[currentMonth] || 0;
    const prevRevenue = monthlyRevenue[prevMonth] || 0;

    const monthOrders = (month) =>
      normalizedOrders.filter((order) => {
        const d = new Date(order.date);
        return !Number.isNaN(d.getTime()) && d.getMonth() === month;
      }).length;

    const currentOrders = monthOrders(currentMonth);
    const prevOrders = monthOrders(prevMonth);

    const toTrend = (current, prev) => {
      if (prev === 0 && current === 0) return "0%";
      if (prev === 0) return "+100%";
      const pct = ((current - prev) / prev) * 100;
      return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    const pendingRate = normalizedOrders.length === 0 ? 0 : (pendingOrders.length / normalizedOrders.length) * 100;

    return {
      revenue: toTrend(currentRevenue, prevRevenue),
      orders: toTrend(currentOrders, prevOrders),
      pending: `${pendingRate.toFixed(1)}%`,
    };
  }, [monthlyRevenue, normalizedOrders, pendingOrders.length]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return normalizedOrders;

    return normalizedOrders.filter((order) => {
      return [
        order.id,
        order.code,
        order.customer,
        order.product,
        order.method,
        order.normalizedStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [normalizedOrders, search]);

  const statusBadgeClass = (status) => {
    if (status === ORDER_STATUS.DELIVERED) return "bg-emerald-100 text-emerald-700";
    if (status === ORDER_STATUS.PENDING) return "bg-amber-100 text-amber-700";
    if (status === ORDER_STATUS.SHIPPING) return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatusApi(orderId, status);
      setOrders((prev) => prev.map((order) => (
        order.id === orderId ? { ...order, status } : order
      )));
      toast.success(`Đã cập nhật trạng thái: ${status}`);
    } catch {
      toast.error("Cập nhật trạng thái đơn hàng thất bại.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 gap-8">
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest mb-4 text-vi">Chính</p>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("revenue")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "revenue" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <FaChartLine /> Doanh thu
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "orders" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <FaBox /> Đơn hàng
              </button>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest mb-4 text-vi">Theo dõi</p>
            <nav className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 bg-gray-50">
                <FaDolly /> Sản phẩm: {productsLoading ? "..." : productsCount}
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 bg-gray-50">
                <FaUsers /> Khách hàng: {ordersLoading ? "..." : normalizedOrders.length}
              </div>
            </nav>
          </div>

          <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-800 font-bold text-sm mb-2">Hỗ trợ kỹ thuật</p>
            <p className="text-blue-600 text-xs">support@snapcart.com</p>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-500 font-medium">Dữ liệu được tổng hợp từ đơn hàng và sản phẩm thực tế.</p>
            </div>
            <div className="flex gap-4">
              <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:shadow-md transition-all">
                <FaBell />
              </button>
              <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-gray-100 shadow-sm">
                <img src={user?.avatar || "https://ui-avatars.com/api/?name=Admin"} className="w-10 h-10 rounded-xl" alt="Admin" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{user?.name || user?.email || "Admin"}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Online</p>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "revenue" && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Doanh thu (Đã giao)" value={formatVND(totalRevenue)} icon={<FaChartLine size={24} />} colorClass="bg-blue-600" trend={trends.revenue} />
                <StatCard label="Tổng đơn hàng" value={ordersLoading ? "..." : String(normalizedOrders.length)} icon={<FaBox size={24} />} colorClass="bg-purple-600" trend={trends.orders} />
                <StatCard label="Đơn chờ duyệt" value={ordersLoading ? "..." : String(pendingOrders.length)} icon={<FaBell size={24} />} colorClass="bg-orange-600" trend={trends.pending} />
                <StatCard label="Sản phẩm" value={productsLoading ? "..." : String(productsCount)} icon={productsLoading ? <FaSpinner className="animate-spin" size={24} /> : <FaDolly size={24} />} colorClass="bg-emerald-600" trend="Live" />
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold text-gray-900">Biểu đồ doanh thu theo tháng</h3>
                  <span className="bg-gray-50 rounded-xl font-bold text-sm px-4 py-2">Năm {new Date().getFullYear()}</span>
                </div>

                <div className="relative h-72 border-b border-l border-gray-100 mt-5">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full border-t border-gray-50 border-dashed" />
                    ))}
                  </div>

                  <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-0">
                    {monthlyRevenue.map((value, i) => {
                      const percent = chartMax === 0 ? 0 : (value / chartMax) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <div
                            className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-400 transition-all cursor-pointer relative min-h-[2px]"
                            style={{ height: value > 0 ? `${Math.max(percent, 5)}%` : "0%" }}
                          >
                            {value > 0 && (
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 whitespace-nowrap">
                                {formatVND(value)}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase mt-4 mb-[-25px]">T{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {deliveredOrders.length === 0 && (
                  <div className="mt-10 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-sm">Chưa có dữ liệu doanh thu từ đơn đã giao.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h3>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Tìm theo mã, khách hàng, sản phẩm..."
                    />
                  </div>
                  <button className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100">
                    <FaFilter />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Mã đơn</th>
                      <th className="px-4 py-4">Khách hàng</th>
                      <th className="px-4 py-4">Sản phẩm</th>
                      <th className="px-4 py-4 text-right">Tổng tiền</th>
                      <th className="px-4 py-4 text-center">Trạng thái</th>
                      <th className="px-8 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td className="px-8 py-10 text-sm text-gray-400" colSpan={6}>
                          {normalizedOrders.length === 0 ? "Chưa có đơn hàng thật nào." : "Không tìm thấy đơn hàng theo bộ lọc."}
                        </td>
                      </tr>
                    )}

                    {filteredOrders.map((order, index) => (
                      <tr key={`${order.id || "order"}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-black text-blue-600">{order.code || `ORD-${index + 1}`}</td>
                        <td className="px-4 py-6">
                          <p className="font-bold text-gray-900">{order.customer || "Khách ẩn danh"}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{order.method || "N/A"}</p>
                        </td>
                        <td className="px-4 py-6 font-medium text-gray-600">{order.product || "-"}</td>
                        <td className="px-4 py-6 text-right font-black text-gray-900">{formatVND(order.numericTotal)}</td>
                        <td className="px-4 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusBadgeClass(order.normalizedStatus)}`}>
                            {order.normalizedStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {order.normalizedStatus === ORDER_STATUS.PENDING && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.SHIPPING)}
                                  className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  title="Duyệt đơn"
                                >
                                  <FaCheck size={12} />
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.CANCELED)}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  title="Hủy đơn"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </>
                            )}

                            {order.normalizedStatus === ORDER_STATUS.SHIPPING && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, ORDER_STATUS.DELIVERED)}
                                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 shadow-md"
                              >
                                Xác nhận giao
                              </button>
                            )}

                            {(order.normalizedStatus === ORDER_STATUS.DELIVERED || order.normalizedStatus === ORDER_STATUS.CANCELED) && (
                              <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-200">
                                <FaEllipsisV size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
