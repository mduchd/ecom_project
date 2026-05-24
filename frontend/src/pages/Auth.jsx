import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../services/productService.js";
import { toast } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const EyeIcon = ({ open }) => (open ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />);
const MailIcon = () => <FaEnvelope className="w-4 h-4" />;
const LockIcon = () => <FaLock className="w-4 h-4" />;
const UserIcon = () => <FaUser className="w-4 h-4" />;
const CheckIcon = () => <FaCheck className="w-4 h-4" />;
const GoogleIcon = () => <FcGoogle className="w-4 h-4" />;

function InputField({ label, type = "text", placeholder, icon, value, onChange, rightSlot, error }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600">{label}</label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-all duration-150 placeholder-gray-400 font-medium ${
                        error
                            ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100 focus:border-red-400"
                            : "border-gray-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    }`}
                />
                {rightSlot && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</span>}
            </div>
            {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
        </div>
    );
}

function PasswordStrength({ password }) {
    const getStrength = (p) => {
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    const strength = getStrength(password);
    const levels = [
        { label: "Yếu", color: "bg-red-400" },
        { label: "Tạm ổn", color: "bg-orange-400" },
        { label: "Tốt", color: "bg-yellow-400" },
        { label: "Mạnh", color: "bg-emerald-500" },
    ];
    const current = levels[strength - 1];

    if (!password) return null;

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {levels.map((l, i) => (
                    <div
                        key={l.label}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? current.color : "bg-gray-200"}`}
                    />
                ))}
            </div>
            <p className="text-[11px] font-bold" style={{ color: strength >= 3 ? "#10b981" : strength === 2 ? "#f59e0b" : "#f87171" }}>
                Mật khẩu {current?.label?.toLowerCase()}
            </p>
        </div>
    );
}

function SignInForm({ onSwitch }) {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("Google Login Success (Token):", tokenResponse);
            setLoading(true);
            try {
                const loggedInUser = await loginWithGoogle(tokenResponse.access_token);
                setSuccess(true);
                const redirectTo = loggedInUser?.role === "admin" ? "/admin/dashboard" : "/";
                setTimeout(() => navigate(redirectTo), 800);
            } catch (err) {
                console.error("Lỗi đăng nhập Google:", err);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.log("Đăng nhập Google thất bại");
            toast.error("Đăng nhập bằng Google thất bại!");
        },
    });

    const validate = () => {
        const e = {};
        if (!email) e.email = "Vui lòng nhập email.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email không hợp lệ.";
        if (!password) e.password = "Vui lòng nhập mật khẩu.";
        else if (password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự.";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            setSuccess(true);
            const redirectTo = loggedInUser?.role === "admin" ? "/admin/dashboard" : "/";
            setTimeout(() => navigate(redirectTo), 800);
        } catch {
            // AuthContext xử lý toast lỗi
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                label="Địa chỉ email"
                type="email"
                placeholder="ban@example.com"
                icon={<MailIcon />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
            />

            <InputField
                label="Mật khẩu"
                type={showPwd ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                icon={<LockIcon />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightSlot={
                    <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <EyeIcon open={showPwd} />
                    </button>
                }
            />

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <button
                        type="button"
                        onClick={() => setRemember(!remember)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            remember ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
                        }`}
                    >
                        {remember && <CheckIcon />}
                    </button>
                    <span className="text-xs text-gray-600 font-medium">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Quên mật khẩu?
                </Link>
            </div>

            <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                    success
                        ? "bg-emerald-500 shadow-emerald-100 text-white"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                }`}
            >
                {loading ? <FaSpinner className="w-5 h-5 animate-spin" /> : success ? <><CheckIcon /> Thành công</> : "Đăng nhập"}
            </button>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">hoặc tiếp tục với</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
                <GoogleIcon /> Đăng nhập bằng Google
            </button>

            <p className="text-center text-xs text-gray-500">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={onSwitch} className="font-black text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Đăng ký
                </button>
            </p>
        </form>
    );
}

function SignUpForm({ onSwitch, onSignupSuccess }) {
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("Google Signup Success (Token):", tokenResponse);
            setLoading(true);
            try {
                const loggedInUser = await loginWithGoogle(tokenResponse.access_token);
                const redirectTo = loggedInUser?.role === "admin" ? "/admin/dashboard" : "/";
                setTimeout(() => navigate(redirectTo), 800);
            } catch (err) {
                console.error("Lỗi đăng ký Google:", err);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.log("Đăng ký Google thất bại");
            toast.error("Đăng ký bằng Google thất bại!");
        },
    });

    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Vui lòng nhập họ tên.";
        if (!email) e.email = "Vui lòng nhập email.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email không hợp lệ.";
        if (!password) e.password = "Vui lòng nhập mật khẩu.";
        else if (password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự.";
        if (!agreed) e.agreed = "Bạn cần đồng ý điều khoản.";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            let username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
            if (username.length < 3) username += "123";
            if (username.length > 20) username = username.substring(0, 20);

            const response = await api.post("/auth/signup", {
                username,
                email,
                password,
                fullName: name.trim(),
                role: ["user"],
            });

            toast.success(response.data?.message || "Đăng ký thành công. Vui lòng kiểm tra email.");
            onSignupSuccess(email, response.data?.message);
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Họ và tên" placeholder="Nguyễn Văn A" icon={<UserIcon />} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />

            <InputField label="Địa chỉ email" type="email" placeholder="ban@example.com" icon={<MailIcon />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

            <div className="space-y-1.5">
                <InputField
                    label="Mật khẩu"
                    type={showPwd ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    icon={<LockIcon />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    rightSlot={
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <EyeIcon open={showPwd} />
                        </button>
                    }
                />
                <PasswordStrength password={password} />
            </div>

            <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <button
                        type="button"
                        onClick={() => setAgreed(!agreed)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            agreed ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
                        }`}
                    >
                        {agreed && <CheckIcon />}
                    </button>
                    <span className="text-xs text-gray-500 leading-relaxed">
                        Tôi đồng ý với{" "}
                        <a href="https://example.com/terms" target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">
                            Điều khoản dịch vụ
                        </a>{" "}
                        và{" "}
                        <a href="https://example.com/privacy" target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">
                            Chính sách bảo mật
                        </a>
                    </span>
                </label>
                {errors.agreed && <p className="text-[11px] text-red-500 font-medium pl-6">{errors.agreed}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <FaSpinner className="w-5 h-5 animate-spin" /> : "Tạo tài khoản"}
            </button>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">hoặc tiếp tục với</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
                <GoogleIcon /> Đăng ký bằng Google
            </button>

            <p className="text-center text-xs text-gray-500">
                Đã có tài khoản?{" "}
                <button type="button" onClick={onSwitch} className="font-black text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Đăng nhập
                </button>
            </p>
        </form>
    );
}

function OtpVerificationForm({ email, initialMessage, onVerifySuccess, onCancel }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [serverMessage, setServerMessage] = useState(initialMessage || "");

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.trim().length !== 6) {
            setError("Mã OTP phải gồm 6 chữ số.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await api.post(`/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
            toast.success("Kích hoạt tài khoản thành công!");
            onVerifySuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setResending(true);
        try {
            const response = await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
            toast.success("Đã gửi lại mã OTP.");
            if (response.data?.message) {
                setServerMessage(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gửi lại OTP thất bại.");
        } finally {
            setTimeout(() => setResending(false), 30000);
        }
    };

    return (
        <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center space-y-2 animate-fadeIn">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Xác thực tài khoản</p>
                <p className="text-sm text-gray-600 font-medium">Mã OTP 6 số đã được gửi tới:</p>
                <p className="text-sm font-bold text-gray-800 bg-gray-50 py-1.5 px-3 rounded-xl inline-block border border-gray-100">{email}</p>
            </div>

            {serverMessage && (
                <div className="bg-amber-50 border border-amber-200/60 text-amber-800 text-xs p-3.5 rounded-xl font-semibold text-center leading-relaxed animate-fadeIn">
                    ⚠️ {serverMessage}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 text-center uppercase tracking-wider">Nhập mã OTP 6 số</label>
                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full text-center py-3 text-2xl font-black border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 tracking-[12px] pl-[12px] placeholder-gray-300 font-mono"
                    required
                />
                {error && <p className="text-[11px] text-red-500 font-bold text-center mt-1">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 text-white transition-all active:scale-[0.98] disabled:opacity-75"
            >
                {loading ? "Đang xác thực..." : "Xác thực mã"}
            </button>

            <div className="flex items-center justify-between text-xs font-bold mt-4 px-1">
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
                    ← Quay lại đăng ký
                </button>
                <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                >
                    {resending ? "Đang gửi lại..." : "Gửi lại OTP"}
                </button>
            </div>
        </form>
    );
}

export default function Auth() {
    const [mode, setMode] = useState("signin");
    const [verifyEmail, setVerifyEmail] = useState("");
    const [serverMessage, setServerMessage] = useState("");

    const handleSignupSuccess = (email, message) => {
        setVerifyEmail(email);
        setServerMessage(message);
        setMode("verify_otp");
    };

    const handleVerifySuccess = () => {
        setMode("signin");
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
            <Link to="/" className="mb-6 select-none">
                <span className="text-3xl font-black tracking-tight">
                    <span className="text-blue-600">Snap</span>
                    <span className="text-yellow-400">cart</span>
                </span>
            </Link>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {mode !== "verify_otp" && (
                    <div className="flex border-b border-gray-100">
                        {[
                            { label: "Đăng nhập", value: "signin" },
                            { label: "Tạo tài khoản", value: "signup" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setMode(tab.value)}
                                className={`flex-1 py-4 text-sm font-black transition-all duration-200 border-b-2 ${
                                    mode === tab.value
                                        ? "border-blue-600 text-blue-600 bg-blue-50/40"
                                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="px-6 py-7">
                    <div className="mb-6">
                        <h1 className="text-xl font-black text-gray-900 animate-fadeIn">
                            {mode === "signin" ? "Chào mừng bạn quay lại" : mode === "signup" ? "Tạo tài khoản" : "Xác thực email"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 animate-fadeIn">
                            {mode === "signin"
                                ? "Đăng nhập để xem đơn hàng, danh sách yêu thích và nhiều hơn nữa."
                                : mode === "signup"
                                ? "Tham gia Snapcart để mua sắm nhanh và tiện lợi hơn."
                                : "Nhập mã OTP đã gửi vào email để kích hoạt tài khoản."}
                        </p>
                    </div>

                    <div key={mode} className="animate-fadeIn">
                        {mode === "signin" && <SignInForm onSwitch={() => setMode("signup")} />}
                        {mode === "signup" && <SignUpForm onSwitch={() => setMode("signin")} onSignupSuccess={handleSignupSuccess} />}
                        {mode === "verify_otp" && (
                            <OtpVerificationForm email={verifyEmail} initialMessage={serverMessage} onVerifySuccess={handleVerifySuccess} onCancel={() => setMode("signup")} />
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-6 text-xs text-gray-400 text-center">© {new Date().getFullYear()} Snapcart. Bảo lưu mọi quyền.</p>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style>
        </main>
    );
}
