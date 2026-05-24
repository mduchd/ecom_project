const STORAGE_KEY = "snapcart_recent_orders";
const MAX_ORDERS = 20;

export function loadRecentOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentOrder(order) {
  if (!order?.orderCode || !order?.email) return loadRecentOrders();

  const entry = {
    orderCode: order.orderCode,
    email: order.email,
    productSummary: order.productSummary || "",
    totalAmount: order.totalAmount ?? 0,
    paymentMethod: order.paymentMethod || "",
    status: order.status || "PENDING",
    statusLabel: order.statusLabel || "Chờ xử lý",
    createdAt: order.createdAt || new Date().toISOString(),
  };

  const existing = loadRecentOrders().filter((item) => item.orderCode !== entry.orderCode);
  const next = [entry, ...existing].slice(0, MAX_ORDERS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function updateRecentOrderStatus(orderCode, status, statusLabel) {
  const orders = loadRecentOrders();
  const index = orders.findIndex((item) => item.orderCode === orderCode);
  if (index === -1) return orders;

  orders[index] = { ...orders[index], status, statusLabel };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return orders;
}

export function removeRecentOrder(orderCode) {
  const next = loadRecentOrders().filter((item) => item.orderCode !== orderCode);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
