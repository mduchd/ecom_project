import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { 
  FaChartLine, FaBox, FaUsers, FaDolly, FaArrowUp, 
  FaSearch, FaFilter, FaEllipsisV, FaBell, FaCheck, FaTimes 
} from "react-icons/fa";

export default function AdminDashboard() {
  const { user, allOrders, updateOrderStatus } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("revenue");

  const formatPrice = (num) => "$" + num.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    // Nếu có cả dấu phẩy và dấu chấm (kiểu quốc tế 1,234.56)
    // Hoặc nếu chỉ có dấu chấm nhưng là phân cách nghìn (kiểu VN 1.200.000)
    // Cách an toàn nhất: Loại bỏ mọi thứ trừ số và dấu phân cách cuối cùng
    let cleaned = priceStr.replace(/[^0-9,.]/g, '');
    
    // Nếu có dấu phẩy ở cuối (kiểu Âu/Việt), đổi thành chấm
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(',', '.');
    } else if (cleaned.includes(',') && cleaned.includes('.')) {
      // Kiểu 1,234.56 -> xóa dấu phẩy
      cleaned = cleaned.replace(/,/g, '');
    } else if (cleaned.split('.').length > 2) {
      // Kiểu 1.200.000 -> xóa mọi dấu chấm
      cleaned = cleaned.replace(/\./g, '');
    }
    
    return parseFloat(cleaned) || 0;
  };

  // Tính toán doanh thu thực tế từ allOrders (chỉ tính đơn đã giao)
  const totalRevenueNum = allOrders
    .filter(order => order.status === "Đã giao")
    .reduce((acc, order) => acc + parsePrice(order.total), 0);
  
  const totalOrdersCount = allOrders.length;
  const pendingOrdersCount = allOrders.filter(order => order.status === "Chờ duyệt").length;

  // Group revenue by month (T1-T12) - Chỉ tính đơn Đã giao
  const monthlyRevenue = Array(12).fill(0);
  allOrders.forEach(order => {
    if (order.status === "Đã giao") {
      const orderDate = new Date(order.date);
      if (!isNaN(orderDate.getTime())) {
        const month = orderDate.getMonth(); // 0-11
        monthlyRevenue[month] += parsePrice(order.total);
      }
    }
  });

  const maxMonthlyRev = Math.max(...monthlyRevenue, 1000000); // Tối thiểu 1tr để chart không trống
  const chartData = monthlyRevenue.map(rev => (rev / maxMonthlyRev) * 100);

  const stats = [
    { label: "Doanh thu (đã giao)", value: formatPrice(totalRevenueNum), icon: FaChartLine, color: "bg-blue-600", trend: "+12.5%" },
    { label: "Tổng đơn hàng", value: totalOrdersCount.toString(), icon: FaBox, color: "bg-purple-600", trend: "+5.2%" },
    { label: "Đơn chờ duyệt", value: pendingOrdersCount.toString(), icon: FaBell, color: "bg-orange-600", trend: "Hot" },
    { label: "Sản phẩm", value: "156", icon: FaDolly, color: "bg-emerald-600", trend: "+2.1%" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 gap-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Chính</p>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("revenue")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "revenue" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <FaChartLine /> Doanh thu
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "orders" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <FaBox /> Đơn hàng
              </button>
            </nav>
          </div>
          
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cài đặt hệ thống</p>
            <nav className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">
                <FaDolly /> Kho hàng
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">
                <FaUsers /> Khách hàng
              </button>
            </nav>
          </div>

          <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-800 font-bold text-sm mb-2">Hỗ trợ kỹ thuật</p>
            <p className="text-blue-600 text-xs">Liên hệ: support@snapcarts.com</p>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-500 font-medium">Chào mừng trở lại, quản trị viên hệ thống.</p>
            </div>
            <div className="flex gap-4">
              <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:shadow-md transition-all">
                <FaBell />
              </button>
              <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-gray-100 shadow-sm">
                <img src={user?.avatar || "https://ui-avatars.com/api/?name=Admin"} className="w-10 h-10 rounded-xl" alt="Admin" />
                <div>
                   <p className="text-sm font-bold text-gray-900">Admin Snapcart</p>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase">Online</p>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "revenue" && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg shadow-gray-200`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                    </div>
                    <p className="text-gray-400 font-bold text-sm text-vi">{stat.label}</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* REVENUE CHART */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold text-gray-900">Biểu đồ doanh thu tháng</h3>
                  <select className="bg-gray-50 border-none rounded-xl font-bold text-sm px-4 py-2">
                    <option>Năm 2026</option>
                    <option>Năm 2025</option>
                  </select>
                </div>
                
                <div className="relative h-72 border-b border-l border-gray-100 mt-5">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-gray-50 border-dashed" />)}
                  </div>
                  
                  <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-0">
                    {chartData.map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div 
                          className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-400 transition-all cursor-pointer relative min-h-[2px]"
                          style={{ height: height > 0 ? `${Math.max(height, 5)}%` : "0%" }}
                        >
                          {monthlyRevenue[i] > 0 && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 whitespace-nowrap">
                              {formatPrice(monthlyRevenue[i])}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase mt-4 mb-[-25px]">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {allOrders.filter(o => o.status === "Đã giao").length === 0 && (
                  <div className="mt-10 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-sm">Chưa có dữ liệu doanh thu (Cần có đơn hàng ở trạng thái "Đã giao")</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Quản lý đơn hàng mới</h3>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-gray-200" placeholder="Tìm kiếm đơn hàng..." />
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
                    {allOrders.map((order, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-black text-blue-600">{order.id}</td>
                        <td className="px-4 py-6">
                          <p className="font-bold text-gray-900">{order.customer || "Khách ẩn danh"}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{order.method}</p>
                        </td>
                        <td className="px-4 py-6 font-medium text-gray-600">{order.product}</td>
                        <td className="px-4 py-6 text-right font-black text-gray-900">{order.total}</td>
                        <td className="px-4 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            order.status === "Đã giao" ? "bg-emerald-100 text-emerald-700" :
                            order.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                            order.status === "Đang giao" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             {order.status === "Chờ duyệt" && (
                               <>
                                 <button 
                                   onClick={() => updateOrderStatus(order.id, "Đang giao")}
                                   className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                   title="Duyệt đơn"
                                 >
                                   <FaCheck size={12} />
                                 </button>
                                 <button 
                                   onClick={() => updateOrderStatus(order.id, "Đã hủy")}
                                   className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                   title="Hủy đơn"
                                 >
                                   <FaTimes size={12} />
                                 </button>
                               </>
                             )}
                             {order.status === "Đang giao" && (
                               <button 
                                 onClick={() => updateOrderStatus(order.id, "Đã giao")}
                                 className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 shadow-md"
                               >
                                 XÁC NHẬN GIAO
                               </button>
                             )}
                             <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-200"><FaEllipsisV size={12} /></button>
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
