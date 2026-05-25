import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {

  FaHome,

  FaSearch,

  FaSync,

  FaSpinner,

  FaUsers,

  FaUserShield,

  FaUser,

  FaLock,

  FaUnlock,

  FaBan,

  FaCheckCircle,

} from "react-icons/fa";

import AdminPagination from "../components/AdminPagination.jsx";

import { toast } from "../components/Toast.jsx";

import { getAdminUsers, getAdminUserStats, setUserEnabled, syncAllDeliveredSpend, syncUserDeliveredSpend } from "../services/adminUserService.js";

import { khoaDiemKhach } from "../services/diemTichLuyService.js";

import { MemberTierBadge, formatSpend, TIER_FILTER_OPTIONS } from "../utils/memberTier.jsx";

import { ADMIN_PAGE_SIZE, mapPagedResponse } from "../utils/pagination.js";



const ROLE_FILTER_OPTIONS = [

  { value: "ALL", label: "Tất cả vai trò" },

  { value: "ADMIN", label: "Quản trị viên" },

  { value: "USER", label: "Khách hàng" },

];



function isAdminUser(user) {

  return (user.roles || []).some((role) => role.includes("ADMIN"));

}



function roleLabel(user) {

  return isAdminUser(user) ? "Quản trị viên" : "Khách hàng";

}



function formatNumber(value) {

  return Number(value || 0).toLocaleString("vi-VN");

}



export default function AdminUsersPage() {

  const [users, setUsers] = useState([]);

  const [usersMeta, setUsersMeta] = useState(() => mapPagedResponse({ content: [] }));

  const [userStats, setUserStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [tierFilter, setTierFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE);

  const [updatingId, setUpdatingId] = useState(null);

  const [syncingAll, setSyncingAll] = useState(false);



  const loadStats = useCallback(async () => {

    try {

      const stats = await getAdminUserStats();

      setUserStats(stats);

    } catch {

      setUserStats(null);

    }

  }, []);



  const loadUsers = useCallback(async () => {

    setLoading(true);

    try {

      const data = await getAdminUsers({ page, size: pageSize, search: debouncedSearch, role: roleFilter, tier: tierFilter });

      const mapped = mapPagedResponse(data, page);

      if (mapped.correctedPage != null) {
        setPage(mapped.correctedPage);
      }

      setUsersMeta(mapped);

      setUsers(mapped.items);

    } catch {

      setUsers([]);

      setUsersMeta(mapPagedResponse({ content: [] }));

      toast.error("Không tải được danh sách người dùng.");

    } finally {

      setLoading(false);

    }

  }, [page, pageSize, debouncedSearch, roleFilter, tierFilter]);



  useEffect(() => {

    const timer = setTimeout(() => setDebouncedSearch(search), 300);

    return () => clearTimeout(timer);

  }, [search]);



  useEffect(() => {

    loadStats();

  }, [loadStats]);



  useEffect(() => {

    loadUsers();

  }, [loadUsers]);



  useEffect(() => {

    setPage(1);

  }, [debouncedSearch, roleFilter, tierFilter, pageSize]);



  const refreshAll = async () => {

    await Promise.all([loadUsers(), loadStats()]);

  };



  const handleToggleEnabled = async (user) => {

    if (isAdminUser(user) && user.enabled && (userStats?.adminUsers ?? 0) <= 1) {

      toast.warning("Không thể khóa tài khoản quản trị cuối cùng.");

      return;

    }



    try {

      setUpdatingId(user.id);

      const updated = await setUserEnabled(user.id, !user.enabled);

      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));

      await loadStats();

      toast.success(updated.enabled ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");

    } catch (error) {

      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái tài khoản.");

    } finally {

      setUpdatingId(null);

    }

  };



  const handleTogglePointsLock = async (user) => {

    try {

      setUpdatingId(user.id);

      await khoaDiemKhach(user.id, !user.pointsLocked);

      setUsers((current) => current.map((item) => (

        item.id === user.id ? { ...item, pointsLocked: !item.pointsLocked } : item

      )));

      await loadStats();

      toast.success(user.pointsLocked ? "Đã mở khóa điểm." : "Đã khóa điểm tích lũy.");

    } catch {

      toast.error("Không thể cập nhật khóa điểm.");

    } finally {

      setUpdatingId(null);

    }

  };



  const handleSyncAllDeliveredSpend = async () => {

    try {

      setSyncingAll(true);

      const result = await syncAllDeliveredSpend();

      await refreshAll();

      toast.success(`Đã đồng bộ chi tiêu cho ${result.usersUpdated} người dùng (${result.ordersUpdated} đơn).`);

    } catch (error) {

      toast.error(error.response?.data?.message || "Không thể đồng bộ chi tiêu.");

    } finally {

      setSyncingAll(false);

    }

  };



  const handleSyncUserDeliveredSpend = async (user) => {

    try {

      setUpdatingId(user.id);

      const updated = await syncUserDeliveredSpend(user.id);

      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));

      toast.success(`Đã đồng bộ chi tiêu cho ${updated.fullName || updated.username}.`);

    } catch (error) {

      toast.error(error.response?.data?.message || "Không thể đồng bộ chi tiêu người dùng.");

    } finally {

      setUpdatingId(null);

    }

  };



  return (

    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">

      <nav className="flex items-center gap-1.5 text-xs text-gray-500">

        <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">

          <FaHome /> Trang chủ

        </Link>

        <span className="text-gray-300">/</span>

        <span className="text-blue-600 font-semibold text-vi">Quản trị / Người dùng</span>

      </nav>



      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <p className="text-xs font-bold text-blue-500 mb-1 text-vi">Bảng quản trị</p>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-vi">

            Quản lý người dùng

          </h1>

          <p className="text-sm text-gray-400 mt-1 text-vi">

            Theo dõi tài khoản, vai trò, hạng hội viên và điểm tích lũy.

          </p>

        </div>

        <div className="flex flex-wrap gap-2">

        <button

          type="button"

          onClick={handleSyncAllDeliveredSpend}

          disabled={loading || syncingAll}

          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60"

        >

          <FaSync className={syncingAll ? "animate-spin" : ""} />

          Đồng bộ chi tiêu

        </button>

        <button

          type="button"

          onClick={refreshAll}

          disabled={loading || syncingAll}

          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"

        >

          <FaSync className={loading ? "animate-spin" : ""} />

          Làm mới

        </button>

        </div>

      </div>



      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {[

          ["Tổng người dùng", userStats?.totalUsers ?? 0, FaUsers, "text-blue-600", "bg-blue-50"],

          ["Đang hoạt động", userStats?.activeUsers ?? 0, FaCheckCircle, "text-emerald-600", "bg-emerald-50"],

          ["Quản trị viên", userStats?.adminUsers ?? 0, FaUserShield, "text-purple-600", "bg-purple-50"],

        ].map(([label, value, Icon, color, bg]) => (

          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>

              <Icon className={color} />

            </div>

            <p className="text-xs font-bold uppercase text-gray-400 text-vi">{label}</p>

            <p className="mt-1 text-2xl font-black text-gray-900">{loading && !userStats ? "..." : value}</p>

          </div>

        ))}

      </section>



      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">

          <div>

            <h2 className="text-lg font-black text-gray-900 text-vi">Danh sách tài khoản</h2>

            <p className="text-xs text-gray-400 mt-1 text-vi">

              {userStats?.lockedPointsUsers ?? 0} tài khoản đang bị khóa điểm

            </p>

          </div>

          <div className="flex gap-3 w-full md:w-auto">

            <div className="relative flex-1 md:w-72">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input

                value={search}

                onChange={(event) => setSearch(event.target.value)}

                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-gray-200"

                placeholder="Tìm theo tên, email, SĐT..."

              />

            </div>

            <select

              value={roleFilter}

              onChange={(event) => setRoleFilter(event.target.value)}

              className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 border-none focus:ring-2 focus:ring-gray-200 text-vi"

              aria-label="Lọc theo vai trò"

            >

              {ROLE_FILTER_OPTIONS.map((option) => (

                <option key={option.value} value={option.value}>{option.label}</option>

              ))}

            </select>

            <select

              value={tierFilter}

              onChange={(event) => setTierFilter(event.target.value)}

              className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 border-none focus:ring-2 focus:ring-gray-200 text-vi"

              aria-label="Lọc theo hạng hội viên"

            >

              {TIER_FILTER_OPTIONS.map((option) => (

                <option key={option.value} value={option.value}>{option.label}</option>

              ))}

            </select>

          </div>

        </div>



        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 text-vi">

              <tr>

                <th className="px-5 py-4">Người dùng</th>

                <th className="px-4 py-4">Liên hệ</th>

                <th className="px-4 py-4">Vai trò</th>

                <th className="px-4 py-4">Hạng</th>

                <th className="px-4 py-4 text-right">Điểm</th>

                <th className="px-4 py-4 text-center">Trạng thái</th>

                <th className="px-5 py-4 text-right">Hành động</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading && (

                <tr>

                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">

                    <FaSpinner className="mx-auto mb-2 animate-spin" />

                    Đang tải người dùng...

                  </td>

                </tr>

              )}



              {!loading && usersMeta.totalItems === 0 && (

                <tr>

                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-vi">

                    Không tìm thấy người dùng phù hợp.

                  </td>

                </tr>

              )}



              {!loading && users.map((user) => (

                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">

                  <td className="px-5 py-4">

                    <p className="font-bold text-gray-900">{user.fullName || user.username}</p>

                    <p className="text-xs text-gray-400">#{user.id} · {user.username}</p>

                  </td>

                  <td className="px-4 py-4">

                    <p className="font-medium text-gray-700">{user.email}</p>

                    <p className="text-xs text-gray-400">{user.phoneNumber || "Chưa có SĐT"}</p>

                  </td>

                  <td className="px-4 py-4">

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black text-vi ${

                      isAdminUser(user) ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"

                    }`}>

                      {isAdminUser(user) ? <FaUserShield size={10} /> : <FaUser size={10} />}

                      {roleLabel(user)}

                    </span>

                    <p className="mt-1 text-[10px] font-bold uppercase text-gray-300">

                      {user.provider || "local"}

                    </p>

                  </td>

                  <td className="px-4 py-4">

                    <MemberTierBadge tierKey={user.memberTier} tierLabel={user.memberTierLabel} shiny={false} showIcon={false} />

                    <p className="mt-1 text-[10px] font-bold text-gray-400">{formatSpend(user.deliveredSpend)}</p>

                  </td>

                  <td className="px-4 py-4 text-right">

                    <p className="font-black text-gray-900">{formatNumber(user.pointsBalance)}</p>

                    {user.pointsLocked && (

                      <p className="text-[10px] font-bold text-amber-600 text-vi">Điểm bị khóa</p>

                    )}

                  </td>

                  <td className="px-4 py-4 text-center">

                    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-black text-vi whitespace-nowrap ${

                      user.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"

                    }`}>

                      {user.enabled ? "Hoạt động" : "Đã khóa"}

                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-2">

                      {!isAdminUser(user) && (

                        <button

                          type="button"

                          onClick={() => handleSyncUserDeliveredSpend(user)}

                          disabled={updatingId === user.id}

                          className="h-8 w-8 rounded-lg flex items-center justify-center transition-all bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"

                          title="Đồng bộ chi tiêu đã giao"

                        >

                          <FaSync size={12} className={updatingId === user.id ? "animate-spin" : ""} />

                        </button>

                      )}

                      {!isAdminUser(user) && (

                        <button

                          type="button"

                          onClick={() => handleTogglePointsLock(user)}

                          disabled={updatingId === user.id}

                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${

                            user.pointsLocked

                              ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"

                              : "bg-gray-50 text-gray-400 hover:bg-gray-200"

                          }`}

                          title={user.pointsLocked ? "Mở khóa điểm" : "Khóa điểm"}

                        >

                          {user.pointsLocked ? <FaUnlock size={12} /> : <FaLock size={12} />}

                        </button>

                      )}

                      <button

                        type="button"

                        onClick={() => handleToggleEnabled(user)}

                        disabled={updatingId === user.id}

                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${

                          user.enabled

                            ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"

                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"

                        }`}

                        title={user.enabled ? "Khóa tài khoản" : "Mở khóa tài khoản"}

                      >

                        {user.enabled ? <FaBan size={12} /> : <FaCheckCircle size={12} />}

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>



        {!loading && (

          <AdminPagination

            currentPage={usersMeta.currentPage}

            totalPages={usersMeta.totalPages}

            totalItems={usersMeta.totalItems}

            from={usersMeta.from}

            to={usersMeta.to}

            pageSize={pageSize}

            itemLabel="người dùng"

            onPageChange={setPage}

            onPageSizeChange={setPageSize}

          />

        )}

      </section>

    </main>

  );

}


