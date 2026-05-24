import { useCallback, useEffect, useState } from "react";
import AdminPagination from "../components/AdminPagination.jsx";
import { ADMIN_PAGE_SIZE, mapPagedResponse } from "../utils/pagination.js";
import { FaCoins, FaHistory, FaSave, FaSlidersH, FaSpinner } from "react-icons/fa";
import {
  dieuChinhDiem,
  layCauHinhDoiDiem,
  layLichSuDiem,
  layThongKeDiem,
  capNhatCauHinhDoiDiem,
} from "../services/diemTichLuyService.js";
import { toast } from "../components/Toast.jsx";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatDate = (value) => value ? new Date(value).toLocaleString("vi-VN") : "-";

export default function AdminDiemTichLuyPage() {
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsMeta, setTransactionsMeta] = useState(() => mapPagedResponse({ content: [] }));
  const [adjustment, setAdjustment] = useState({ userId: "", increase: true, points: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPageSize, setTransactionsPageSize] = useState(ADMIN_PAGE_SIZE);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const data = await layLichSuDiem({ page: transactionsPage, size: transactionsPageSize });
      const mapped = mapPagedResponse(data, transactionsPage);
      if (mapped.correctedPage != null) {
        setTransactionsPage(mapped.correctedPage);
      }
      setTransactionsMeta(mapped);
      setTransactions(mapped.items);
    } catch {
      setTransactions([]);
      setTransactionsMeta(mapPagedResponse({ content: [] }));
      toast.error("Không thể tải lịch sử điểm.");
    } finally {
      setTransactionsLoading(false);
    }
  }, [transactionsPage, transactionsPageSize]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nextSummary, nextSettings] = await Promise.all([
        layThongKeDiem(),
        layCauHinhDoiDiem(),
      ]);
      setSummary(nextSummary);
      setSettings(nextSettings);
    } catch {
      toast.error("Không thể tải dữ liệu điểm tích lũy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    setTransactionsPage(1);
  }, [transactionsPageSize]);

  const handleSaveSettings = async () => {
    try {
      const saved = await capNhatCauHinhDoiDiem({
        earnAmountPerPoint: Number(settings.earnAmountPerPoint),
        pointValue: Number(settings.pointValue),
        maxRedeemPercent: Number(settings.maxRedeemPercent),
        expiryMonths: Number(settings.expiryMonths),
        enabled: Boolean(settings.enabled),
      });
      setSettings(saved);
      toast.success("Đã lưu cấu hình quy đổi điểm.");
    } catch (error) {
      toast.error("Lưu cấu hình thất bại.");
    }
  };

  const handleAdjustPoints = async (event) => {
    event.preventDefault();
    if (!adjustment.userId || !adjustment.points || !adjustment.reason.trim()) {
      toast.warning("Vui lòng nhập đủ khách hàng, số điểm và lý do điều chỉnh.");
      return;
    }
    try {
      await dieuChinhDiem({
        userId: Number(adjustment.userId),
        increase: adjustment.increase,
        points: Number(adjustment.points),
        reason: adjustment.reason.trim(),
      });
      toast.success("Đã cập nhật điểm cho khách hàng.");
      setAdjustment({ userId: "", increase: true, points: "", reason: "" });
      await Promise.all([loadData(), loadTransactions()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Điều chỉnh điểm thất bại.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <FaSpinner className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu điểm tích lũy...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1280px] mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Điểm tích lũy</h1>
          <p className="text-sm text-gray-500">Quản lý số dư, lịch sử và cấu hình điểm của khách hàng.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ["Khách có điểm", summary?.customersWithPoints],
          ["Điểm đang lưu hành", summary?.activePoints],
          ["Điểm đã cộng", summary?.earnedPoints],
          ["Điểm đã dùng", summary?.redeemedPoints],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-gray-900">{formatNumber(value)}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaSlidersH className="text-blue-600" />
            <h2 className="font-black text-gray-900">Cấu hình quy đổi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>Số tiền để nhận 1 điểm</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={settings?.earnAmountPerPoint || ""} onChange={(e) => setSettings({ ...settings, earnAmountPerPoint: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>Giá trị 1 điểm</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={settings?.pointValue || ""} onChange={(e) => setSettings({ ...settings, pointValue: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>Giới hạn giảm tối đa (%)</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={settings?.maxRedeemPercent || ""} onChange={(e) => setSettings({ ...settings, maxRedeemPercent: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>Thời hạn điểm (tháng)</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={settings?.expiryMonths || ""} onChange={(e) => setSettings({ ...settings, expiryMonths: e.target.value })} />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-700">
            <input type="checkbox" checked={Boolean(settings?.enabled)} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} />
            <span>Bật chương trình điểm tích lũy</span>
          </label>
          <button onClick={handleSaveSettings} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            <FaSave /> Lưu cấu hình
          </button>
        </div>

        <form onSubmit={handleAdjustPoints} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaCoins className="text-amber-500" />
            <h2 className="font-black text-gray-900">Cộng điểm / Trừ điểm</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>ID khách hàng</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={adjustment.userId} onChange={(e) => setAdjustment({ ...adjustment, userId: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm font-bold text-gray-700">
              <span>Số điểm</span>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2" type="number" value={adjustment.points} onChange={(e) => setAdjustment({ ...adjustment, points: e.target.value })} />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setAdjustment({ ...adjustment, increase: true })} className={`rounded-lg px-3 py-2 text-sm font-bold ${adjustment.increase ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}>Cộng điểm</button>
            <button type="button" onClick={() => setAdjustment({ ...adjustment, increase: false })} className={`rounded-lg px-3 py-2 text-sm font-bold ${!adjustment.increase ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"}`}>Trừ điểm</button>
          </div>
          <label className="mt-4 block space-y-1 text-sm font-bold text-gray-700">
            <span>Lý do điều chỉnh</span>
            <textarea className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2" value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} />
          </label>
          <button className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800">Lưu điều chỉnh</button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 p-4">
          <FaHistory className="text-gray-500" />
          <h2 className="font-black text-gray-900">Lịch sử điểm</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3 text-right">Điểm</th>
                <th className="px-4 py-3">Lý do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactionsLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    <FaSpinner className="mx-auto mb-2 animate-spin" />
                    Đang tải lịch sử...
                  </td>
                </tr>
              )}

              {!transactionsLoading && transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Chưa có giao dịch điểm.
                  </td>
                </tr>
              )}

              {!transactionsLoading && transactions.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">{item.customerEmail}</td>
                  <td className="px-4 py-3">{item.orderCode || "-"}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className={`px-4 py-3 text-right font-black ${item.points >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatNumber(item.points)}</td>
                  <td className="px-4 py-3">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!transactionsLoading && (
          <AdminPagination
            currentPage={transactionsMeta.currentPage}
            totalPages={transactionsMeta.totalPages}
            totalItems={transactionsMeta.totalItems}
            from={transactionsMeta.from}
            to={transactionsMeta.to}
            pageSize={transactionsPageSize}
            itemLabel="giao dịch"
            onPageChange={setTransactionsPage}
            onPageSizeChange={setTransactionsPageSize}
          />
        )}
      </section>
    </main>
  );
}
