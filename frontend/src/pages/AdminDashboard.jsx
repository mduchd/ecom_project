import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAdminProductStats } from "../services/productService";
import {
  getAdminOrders,
  getAdminOrderStats,
  updateOrderStatus as updateOrderStatusApi,
} from "../services/orderService.js";
import { toast } from "../components/Toast.jsx";
import AdminPagination from "../components/AdminPagination.jsx";
import { ADMIN_PAGE_SIZE, mapPagedResponse } from "../utils/pagination.js";
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
  FaEye,
  FaCopy,
} from "react-icons/fa";

const ORDER_STATUS = {
  PENDING: "Chờ duyệt",
  PAID: "Đã thanh toán",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELED: "Đã hủy",
};

const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: ORDER_STATUS.PENDING, label: ORDER_STATUS.PENDING },
  { value: ORDER_STATUS.PAID, label: ORDER_STATUS.PAID },
  { value: ORDER_STATUS.SHIPPING, label: ORDER_STATUS.SHIPPING },
  { value: ORDER_STATUS.DELIVERED, label: ORDER_STATUS.DELIVERED },
  { value: ORDER_STATUS.CANCELED, label: ORDER_STATUS.CANCELED },
];

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

function formatOrderDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function OrderDetailModal({ order, onClose, statusBadgeClass }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 text-vi">Chi tiết đơn hàng</h3>
            <p className="text-sm font-bold text-blue-600 mt-1">{order.code || `#${order.id}`}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Đóng"
          >
            <FaTimes size={12} />
          </button>
        </div>

        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 font-bold text-vi">Khách hàng</dt>
            <dd className="font-bold text-gray-900 text-right">{order.customer || "Khách ẩn danh"}</dd>
          </div>
          {order.customerEmail && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-bold text-vi">Email</dt>
              <dd className="font-medium text-gray-700 text-right break-all">{order.customerEmail}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 font-bold text-vi">Sản phẩm</dt>
            <dd className="font-medium text-gray-700 text-right max-w-[60%]">{order.product || "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 font-bold text-vi">Thanh toán</dt>
            <dd className="font-bold text-gray-700">{order.method || "Không rõ"}</dd>
          </div>
          <div className="flex justify-between gap-4 items-center">
            <dt className="text-gray-400 font-bold text-vi">Trạng thái</dt>
            <dd>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-vi whitespace-nowrap ${statusBadgeClass(order.normalizedStatus)}`}>
                {order.normalizedStatus}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 font-bold text-vi">Tổng tiền</dt>
            <dd className="font-black text-gray-900">{formatVND(order.numericTotal)}</dd>
          </div>
          {order.pointsRedeemed > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-bold text-vi">Điểm đã dùng</dt>
              <dd className="font-bold text-amber-600">
                {order.pointsRedeemed} điểm ({formatVND(order.pointsDiscount)})
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 font-bold text-vi">Ngày tạo</dt>
            <dd className="font-medium text-gray-700">{formatOrderDate(order.date)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function normalizeStatus(input) {
  const text = String(input || "").toLowerCase();

  if (text.includes("đã giao") || text.includes("da giao") || text.includes("delivered")) {
    return ORDER_STATUS.DELIVERED;
  }
  if (text.includes("đang giao") || text.includes("dang giao") || text.includes("shipping")) {
    return ORDER_STATUS.SHIPPING;
  }
  if (text.includes("đã hủy") || text.includes("da huy") || text.includes("cancel")) {
    return ORDER_STATUS.CANCELED;
  }
  if (text.includes("đã thanh toán") || text.includes("da thanh toan") || text === "paid") {
    return ORDER_STATUS.PAID;
  }

  return ORDER_STATUS.PENDING;
}

function isOrderAwaitingApproval(status) {
  return status === ORDER_STATUS.PENDING || status === ORDER_STATUS.PAID;
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState(() => mapPagedResponse({ content: [] }));
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [actionMenu, setActionMenu] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(ADMIN_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!actionMenu) return undefined;

    const closeActionMenuOnViewportChange = () => setActionMenu(null);
    window.addEventListener("scroll", closeActionMenuOnViewportChange, true);
    window.addEventListener("resize", closeActionMenuOnViewportChange);

    return () => {
      window.removeEventListener("scroll", closeActionMenuOnViewportChange, true);
      window.removeEventListener("resize", closeActionMenuOnViewportChange);
    };
  }, [actionMenu]);

  useEffect(() => {
    let mounted = true;

    const loadProductStats = async () => {
      setProductsLoading(true);
      try {
        const stats = await getAdminProductStats();
        if (mounted) setProductsCount(stats?.totalProducts ?? 0);
      } catch {
        if (mounted) setProductsCount(0);
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };

    loadProductStats();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadOrderStats = async () => {
      try {
        const stats = await getAdminOrderStats();
        if (mounted) setOrderStats(stats);
      } catch {
        if (mounted) setOrderStats(null);
      }
    };

    loadOrderStats();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await getAdminOrders({
        page: ordersPage,
        size: ordersPageSize,
        search: debouncedSearch,
        status: statusFilter,
      });
      const mapped = mapPagedResponse(data, ordersPage);
      if (mapped.correctedPage != null) {
        setOrdersPage(mapped.correctedPage);
      }
      setOrdersMeta(mapped);
      setOrders(mapped.items);
    } catch {
      setOrders([]);
      setOrdersMeta(mapPagedResponse({ content: [] }));
      toast.error("Không tải được danh sách đơn hàng.");
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersPage, ordersPageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      customerEmail: order.customerEmail,
      pointsRedeemed: order.pointsRedeemed ?? 0,
      pointsDiscount: parsePrice(order.pointsDiscount),
    }));
  }, [orders]);

  const totalRevenue = parsePrice(orderStats?.deliveredRevenue ?? 0);
  const monthlyRevenue = useMemo(
    () => (orderStats?.monthlyRevenue ?? Array(12).fill(0)).map((value) => parsePrice(value)),
    [orderStats]
  );
  const chartMax = Math.max(...monthlyRevenue, 1);

  const trends = useMemo(() => {
    const toTrend = (current, prev) => {
      const currentValue = parsePrice(current);
      const prevValue = parsePrice(prev);
      if (prevValue === 0 && currentValue === 0) return "0%";
      if (prevValue === 0) return "+100%";
      const pct = ((currentValue - prevValue) / prevValue) * 100;
      return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    const totalOrders = orderStats?.totalOrders ?? 0;
    const awaitingCount = orderStats?.awaitingActionCount ?? 0;
    const awaitingRate = totalOrders === 0 ? 0 : (awaitingCount / totalOrders) * 100;

    return {
      revenue: toTrend(orderStats?.currentMonthRevenue, orderStats?.previousMonthRevenue),
      orders: toTrend(orderStats?.currentMonthOrders, orderStats?.previousMonthOrders),
      pending: `${awaitingRate.toFixed(1)}%`,
    };
  }, [orderStats]);

  useEffect(() => {
    setOrdersPage(1);
  }, [debouncedSearch, statusFilter, ordersPageSize]);

  const statusBadgeClass = (status) => {
    if (status === ORDER_STATUS.DELIVERED) return "bg-emerald-100 text-emerald-700";
    if (status === ORDER_STATUS.PENDING) return "bg-amber-100 text-amber-700";
    if (status === ORDER_STATUS.PAID) return "bg-sky-100 text-sky-700";
    if (status === ORDER_STATUS.SHIPPING) return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const updated = await updateOrderStatusApi(orderId, status);
      await Promise.all([
        fetchOrders(),
        getAdminOrderStats().then(setOrderStats),
      ]);
      toast.success(`Đã cập nhật trạng thái: ${normalizeStatus(updated.status)}`);
    } catch {
      toast.error("Cập nhật trạng thái đơn hàng thất bại.");
    }
  };

  const openActionMenu = (event, orderId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActionMenu({
      orderId,
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 176),
    });
  };

  const closeActionMenu = () => setActionMenu(null);

  const handleCopyOrderCode = async (code) => {
    if (!code) {
      toast.error("Không có mã đơn để sao chép.");
      closeActionMenu();
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Đã sao chép mã đơn.");
    } catch {
      toast.error("Không thể sao chép mã đơn.");
    }
    closeActionMenu();
  };

  const handleViewOrderDetail = (orderId) => {
    const order = normalizedOrders.find((item) => item.id === orderId);
    if (order) {
      setDetailOrder(order);
    }
    closeActionMenu();
  };

  const actionMenuOrder = actionMenu
    ? normalizedOrders.find((order) => order.id === actionMenu.orderId)
    : null;

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
                <FaUsers /> Đơn hàng: {ordersLoading ? "..." : orderStats?.totalOrders ?? ordersMeta.totalItems}
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
              <h1 className="text-4xl font-black text-gray-900 text-vi">Bảng quản trị</h1>
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
                  <p className="text-[10px] font-bold text-emerald-600 text-vi">Đang trực tuyến</p>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "revenue" && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Doanh thu (Đã giao)" value={formatVND(totalRevenue)} icon={<FaChartLine size={24} />} colorClass="bg-blue-600" trend={trends.revenue} />
                <StatCard label="Tổng đơn hàng" value={ordersLoading && !orderStats ? "..." : String(orderStats?.totalOrders ?? 0)} icon={<FaBox size={24} />} colorClass="bg-purple-600" trend={trends.orders} />
                <StatCard label="Chờ xử lý" value={ordersLoading && !orderStats ? "..." : String(orderStats?.awaitingActionCount ?? 0)} icon={<FaBell size={24} />} colorClass="bg-orange-600" trend={trends.pending} />
                <StatCard label="Sản phẩm" value={productsLoading ? "..." : String(productsCount)} icon={productsLoading ? <FaSpinner className="animate-spin" size={24} /> : <FaDolly size={24} />} colorClass="bg-emerald-600" trend="Trực tiếp" />
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
                          <span className="text-[10px] font-black text-gray-400 mt-4 mb-[-25px] text-vi">T{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {totalRevenue === 0 && (
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
                  <div className="relative">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="appearance-none pl-10 pr-8 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 border-none focus:ring-2 focus:ring-gray-200 cursor-pointer text-vi min-w-[170px]"
                      aria-label="Lọc theo trạng thái đơn hàng"
                    >
                      {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs font-bold text-vi">
                    <tr>
                      <th className="px-8 py-4">Mã đơn</th>
                      <th className="px-4 py-4">Khách hàng</th>
                      <th className="px-4 py-4">Sản phẩm</th>
                      <th className="px-4 py-4 text-right">Tổng tiền</th>
                      <th className="px-4 py-4 text-center min-w-28 whitespace-nowrap">Trạng thái</th>
                      <th className="px-8 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersLoading && (
                      <tr>
                        <td className="px-8 py-10 text-sm text-gray-400 text-center" colSpan={6}>
                          <FaSpinner className="mx-auto mb-2 animate-spin" />
                          Đang tải đơn hàng...
                        </td>
                      </tr>
                    )}

                    {!ordersLoading && ordersMeta.totalItems === 0 && (
                      <tr>
                        <td className="px-8 py-10 text-sm text-gray-400" colSpan={6}>
                          Không tìm thấy đơn hàng phù hợp với bộ lọc hoặc từ khóa tìm kiếm.
                        </td>
                      </tr>
                    )}

                    {!ordersLoading && normalizedOrders.map((order, index) => (
                      <tr key={`${order.id || "order"}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-black text-blue-600">{order.code || `ORD-${index + 1}`}</td>
                        <td className="px-4 py-6">
                          <p className="font-bold text-gray-900">{order.customer || "Khách ẩn danh"}</p>
                          <p className="text-[10px] text-gray-400 font-bold text-vi">{order.method || "Không rõ"}</p>
                        </td>
                        <td className="px-4 py-6 font-medium text-gray-600">{order.product || "-"}</td>
                        <td className="px-4 py-6 text-right font-black text-gray-900">{formatVND(order.numericTotal)}</td>
                        <td className="px-4 py-6 text-center min-w-28 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-vi whitespace-nowrap ${statusBadgeClass(order.normalizedStatus)}`}>
                            {order.normalizedStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {isOrderAwaitingApproval(order.normalizedStatus) && (
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
                              <button
                                type="button"
                                onClick={(event) => openActionMenu(event, order.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                                  actionMenu?.orderId === order.id
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-50 text-gray-400 hover:bg-gray-200"
                                }`}
                                title="Thêm hành động"
                                aria-label="Thêm hành động"
                              >
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

              <AdminPagination
                currentPage={ordersMeta.currentPage}
                totalPages={ordersMeta.totalPages}
                totalItems={ordersMeta.totalItems}
                from={ordersMeta.from}
                to={ordersMeta.to}
                pageSize={ordersPageSize}
                itemLabel="đơn hàng"
                onPageChange={setOrdersPage}
                onPageSizeChange={setOrdersPageSize}
              />
            </div>
          )}
        </main>
      </div>

      {actionMenu && actionMenuOrder && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] cursor-default"
            aria-label="Đóng menu hành động"
            onClick={closeActionMenu}
          />
          <div
            className="fixed z-[56] w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
            style={{ top: actionMenu.top, left: actionMenu.left }}
          >
            <button
              type="button"
              onClick={() => handleViewOrderDetail(actionMenu.orderId)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors text-vi"
            >
              <FaEye size={12} className="text-gray-400" />
              Xem chi tiết
            </button>
            <button
              type="button"
              onClick={() => handleCopyOrderCode(actionMenuOrder.code)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors text-vi"
            >
              <FaCopy size={12} className="text-gray-400" />
              Sao chép mã đơn
            </button>
          </div>
        </>
      )}

      <OrderDetailModal
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
        statusBadgeClass={statusBadgeClass}
      />

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
