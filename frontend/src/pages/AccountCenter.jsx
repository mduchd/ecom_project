import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaChevronRight,
  FaClipboardList,
  FaLock,
  FaMapMarkerAlt,
  FaSave,
  FaShieldAlt,
  FaStar,
  FaSyncAlt,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { toast } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { uploadFile } from "../services/productService.js";
import {
  changeMyPassword,
  getMyOrders,
  getMyPointTransactions,
  getMyProfile,
  updateMyProfile,
} from "../services/userService.js";
import {
  UPLOAD_ACCEPTED_EXTENSIONS,
  UPLOAD_HINT,
  getApiErrorMessage,
  validateImageFile,
} from "../utils/uploadUtils.js";

const tabs = [
  { key: "overview", label: "Tổng quan", icon: FaClipboardList },
  { key: "profile", label: "Hồ sơ", icon: FaUser },
  { key: "address", label: "Địa chỉ", icon: FaMapMarkerAlt },
  { key: "orders", label: "Đơn hàng", icon: FaBoxOpen },
  { key: "points", label: "Điểm tích lũy", icon: FaStar },
  { key: "security", label: "Bảo mật", icon: FaShieldAlt },
];

const formatVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

const emptyProfile = {
  fullName: "",
  avatar: "",
  phoneNumber: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function AccountCenter() {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(emptyProfile);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const fetchAndApplyAccount = useCallback(async () => {
    const [profileData, orderData, pointData] = await Promise.all([
      getMyProfile(),
      getMyOrders(),
      getMyPointTransactions(),
    ]);
    setProfile({
      fullName: profileData.fullName || "",
      avatar: profileData.avatar || "",
      phoneNumber: profileData.phoneNumber || "",
      address: profileData.address || "",
      city: profileData.city || "",
      postalCode: profileData.postalCode || "",
    });
    setOrders(Array.isArray(orderData) ? orderData : []);
    setTransactions(Array.isArray(pointData) ? pointData : []);
    await refreshProfile();
  }, [refreshProfile]);

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);
      await fetchAndApplyAccount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không tải được thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [fetchAndApplyAccount]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getMyProfile(),
      getMyOrders(),
      getMyPointTransactions(),
    ])
      .then(async ([profileData, orderData, pointData]) => {
        if (cancelled) {
          return;
        }
        setProfile({
          fullName: profileData.fullName || "",
          avatar: profileData.avatar || "",
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postalCode: profileData.postalCode || "",
        });
        setOrders(Array.isArray(orderData) ? orderData : []);
        setTransactions(Array.isArray(pointData) ? pointData : []);
        await refreshProfile();
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.response?.data?.message || "Không tải được thông tin tài khoản.");
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
  }, [refreshProfile]);

  const stats = useMemo(() => {
    const delivered = orders.filter((order) => String(order.status || "").toLowerCase().includes("giao")).length;
    const totalSpend = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return { delivered, totalSpend };
  }, [orders]);

  const buildProfilePayload = useCallback((data) => ({
    fullName: (data.fullName || user?.name || "").trim(),
    avatar: (data.avatar || "").trim(),
    phoneNumber: (data.phoneNumber || "").trim(),
    address: (data.address || "").trim(),
    city: (data.city || "").trim(),
    postalCode: (data.postalCode || "").trim(),
  }), [user?.name]);

  const handleProfileSubmit = async (event, { requireFullName = true } = {}) => {
    event.preventDefault();
    if (requireFullName && !profile.fullName.trim()) {
      toast.warning("Vui lòng nhập họ và tên.");
      return;
    }
    try {
      setSavingProfile(true);
      await updateMyProfile(buildProfilePayload(profile));
      await loadAccount();
      toast.success("Đã cập nhật thông tin tài khoản.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không cập nhật được hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.warning(validationError);
      event.target.value = "";
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await uploadFile(file);
      const nextProfile = { ...profile, avatar: res.url };
      await updateMyProfile(buildProfilePayload(nextProfile));
      setProfile(nextProfile);
      await refreshProfile();
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không tải lên được ảnh đại diện."));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.warning("Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning("Xác nhận mật khẩu mới không khớp.");
      return;
    }
    try {
      setSavingPassword(true);
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đã đổi mật khẩu.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không đổi được mật khẩu.");
    } finally {
      setSavingPassword(false);
    }
  };

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="bg-gray-50 min-h-screen px-4 py-8">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-wide">Tài khoản Snapcart</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">Tài khoản của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý hồ sơ, đơn hàng, địa chỉ và điểm tích lũy.</p>
          </div>
          <button
            onClick={loadAccount}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 h-fit">
            <div className="px-3 py-4 border-b border-gray-100 flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D8ABC&color=fff`}
                alt={user?.name || "User"}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="pt-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                      active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {tab.label}
                    </span>
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-h-[560px]">
            {loading ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-sm font-bold text-gray-500">
                Đang tải thông tin tài khoản...
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Stat title="Điểm hiện có" value={Number(user?.points || 0).toLocaleString("vi-VN")} />
                      <Stat title="Tổng đơn hàng" value={orders.length.toLocaleString("vi-VN")} />
                      <Stat title="Đã giao" value={stats.delivered.toLocaleString("vi-VN")} />
                      <Stat title="Tổng chi tiêu" value={formatVND(stats.totalSpend)} />
                    </div>
                    <Panel title="Hồ sơ nhanh">
                      <Info label="Họ và tên" value={profile.fullName || user?.name} />
                      <Info label="Email" value={user?.email} />
                      <Info label="Số điện thoại" value={profile.phoneNumber || "Chưa cập nhật"} />
                      <Info label="Địa chỉ" value={[profile.address, profile.city, profile.postalCode].filter(Boolean).join(", ") || "Chưa cập nhật"} />
                    </Panel>
                  </div>
                )}

                {activeTab === "profile" && (
                  <ProfileTab
                    profile={profile}
                    user={user}
                    saving={savingProfile}
                    uploadingAvatar={uploadingAvatar}
                    onSubmit={handleProfileSubmit}
                    onChange={updateProfileField}
                    onAvatarUpload={handleAvatarUpload}
                  />
                )}

                {activeTab === "address" && (
                  <ProfileForm
                    title="Địa chỉ giao hàng"
                    profile={profile}
                    saving={savingProfile}
                    onSubmit={(event) => handleProfileSubmit(event, { requireFullName: false })}
                    onChange={updateProfileField}
                    fields={["address", "city", "postalCode"]}
                  />
                )}

                {activeTab === "orders" && (
                  <Panel title="Đơn hàng của tôi">
                    <div className="space-y-3">
                      {orders.length === 0 && <Empty text="Bạn chưa có đơn hàng nào." />}
                      {orders.map((order) => (
                        <div key={order.id || order.orderCode} className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-blue-700">{order.orderCode}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-1">{order.productSummary}</p>
                            {order.shippingAddress && (
                              <p className="text-xs text-gray-400 mt-1">{order.shippingAddress}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="md:text-right">
                            <p className="text-sm font-black text-gray-900">{formatVND(order.totalAmount)}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">{order.status}</p>
                            <Link to={`/track-order?code=${encodeURIComponent(order.orderCode)}&email=${encodeURIComponent(order.customerEmail || user?.email || "")}`} className="inline-flex mt-2 text-xs font-black text-blue-600 hover:underline">
                              Theo dõi đơn
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {activeTab === "points" && (
                  <Panel title="Điểm tích lũy">
                    <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-100 p-4">
                      <p className="text-xs font-bold text-yellow-700">Số dư hiện tại</p>
                      <p className="text-2xl font-black text-yellow-700">{Number(user?.points || 0).toLocaleString("vi-VN")} điểm</p>
                      {user?.pointsLocked && <p className="text-xs font-bold text-red-600 mt-1">Điểm đang tạm khóa.</p>}
                    </div>
                    <div className="space-y-3">
                      {transactions.length === 0 && <Empty text="Chưa có lịch sử điểm." />}
                      {transactions.map((tx) => (
                        <div key={tx.id} className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-gray-900">{tx.reason}</p>
                            <p className="text-xs text-gray-400 mt-1">{tx.orderCode || "Không gắn với đơn hàng"} - {formatDate(tx.createdAt)}</p>
                          </div>
                          <p className={`text-sm font-black ${Number(tx.points) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {Number(tx.points) >= 0 ? "+" : ""}{Number(tx.points || 0).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {activeTab === "security" && (
                  <Panel title="Bảo mật">
                    {(user?.provider || "local").toLowerCase() === "google" ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-blue-700">
                        Tài khoản này đang đăng nhập bằng Google, nên không sử dụng mật khẩu cục bộ trên Snapcart.
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordSubmit} className="grid gap-4 max-w-xl">
                        <Field label="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))} />
                        <Field label="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))} />
                        <Field label="Xác nhận mật khẩu mới" type="password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))} />
                        <button disabled={savingPassword} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
                          <FaLock /> {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                        </button>
                      </form>
                    )}
                  </Panel>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400">{title}</p>
      <p className="text-xl font-black text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm font-bold text-gray-400">{text}</div>;
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function ReadOnlyField({ label, value, hint }) {
  return (
    <div className="block">
      <span className="text-xs font-black text-gray-600">{label}</span>
      <p className="mt-2 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function ProfileTab({ profile, user, saving, uploadingAvatar, onChange, onSubmit, onAvatarUpload }) {
  const provider = (user?.provider || "local").toLowerCase();
  const avatarPreview = profile.avatar
    || user?.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || user?.name || "User")}&background=0D8ABC&color=fff`;

  return (
    <Panel title="Hồ sơ">
      <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={avatarPreview}
            alt="Ảnh đại diện"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
          <div>
            <label className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 ${uploadingAvatar ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
              <FaUpload />
              {uploadingAvatar ? "Đang tải lên..." : "Chọn ảnh đại diện"}
              <input
                type="file"
                accept={UPLOAD_ACCEPTED_EXTENSIONS}
                className="hidden"
                disabled={uploadingAvatar}
                onChange={onAvatarUpload}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">{UPLOAD_HINT}</p>
          </div>
        </div>

        <ReadOnlyField
          label="Email"
          value={user?.email || "—"}
          hint="Email dùng để đăng nhập, không thể thay đổi tại đây."
        />
        <ReadOnlyField
          label="Phương thức đăng nhập"
          value={provider === "google" ? "Google" : "Email và mật khẩu"}
        />

        <Field label="Họ và tên" value={profile.fullName} onChange={(value) => onChange("fullName", value)} />
        <Field label="Số điện thoại" value={profile.phoneNumber} onChange={(value) => onChange("phoneNumber", value)} />

        <button disabled={saving || uploadingAvatar} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
          <FaSave /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </Panel>
  );
}

function ProfileForm({ title, profile, fields, onChange, onSubmit, saving }) {
  const labels = {
    fullName: "Họ và tên",
    phoneNumber: "Số điện thoại",
    address: "Địa chỉ chi tiết",
    city: "Tỉnh / thành phố",
    postalCode: "Mã bưu chính",
  };
  return (
    <Panel title={title}>
      <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl">
        {fields.map((field) => (
          <Field key={field} label={labels[field]} value={profile[field]} onChange={(value) => onChange(field, value)} />
        ))}
        <button disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
          <FaSave /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </Panel>
  );
}
