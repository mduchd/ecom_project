import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import api from "../services/productService.js";
import { toast } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// ── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />;
const MailIcon = () => <FaEnvelope className="w-4 h-4" />;
const LockIcon = () => <FaLock className="w-4 h-4" />;
const UserIcon = () => <FaUser className="w-4 h-4" />;
const CheckIcon = () => <FaCheck className="w-4 h-4" />;
const GoogleIcon = () => <FcGoogle className="w-4 h-4" />;

// ── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, type = "text", placeholder, icon, value, onChange, rightSlot, error }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600">{label}</label>
            <div className="relative">
                {/* Left icon */}
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-all duration-150
            placeholder-gray-400 font-medium
            ${error
                            ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100 focus:border-red-400"
                            : "border-gray-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        }`}
                />
                {/* Right slot (eye toggle / check) */}
                {rightSlot && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {rightSlot}
                    </span>
                )}
            </div>
            {error && (
                <p className="text-[11px] text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}

// ── Password Strength ────────────────────────────────────────────────────────
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
        { label: "Weak", color: "bg-red-400" },
        { label: "Fair", color: "bg-orange-400" },
        { label: "Good", color: "bg-yellow-400" },
        { label: "Strong", color: "bg-emerald-500" },
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
                {current?.label} password
            </p>
        </div>
    );
}

// ── Sign In Form ─────────────────────────────────────────────────────────────
function SignInForm({ onSwitch }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: tokenResponse => {
            console.log("Google Login Success (Token):", tokenResponse);
        },
        onError: () => console.log('Login Failed'),
    });

    const validate = () => {
        const e = {};
        if (!email) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
        if (!password) e.password = "Password is required.";
        else if (password.length < 6) e.password = "Minimum 6 characters.";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        try {
            await login(email, password);
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err) {
            // Error handling is managed in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<MailIcon />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
            />

            <InputField
                label="Password"
                type={showPwd ? "text" : "password"}
                placeholder="Enter your password"
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <button
                        type="button"
                        onClick={() => setRemember(!remember)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
              ${remember ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
                    >
                        {remember && <CheckIcon />}
                    </button>
                    <span className="text-xs text-gray-600 font-medium">Remember me</span>
                </label>
                <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
          ${success
                        ? "bg-emerald-500 shadow-emerald-100 text-white"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    }`}
            >
                {loading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                ) : success ? (
                    <><CheckIcon /> Signed In!</>
                ) : (
                    "Sign In"
                )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google */}
            <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
                <GoogleIcon /> Sign in with Google
            </button>

            {/* Switch */}
            <p className="text-center text-xs text-gray-500">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="font-black text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                    Sign up
                </button>
            </p>
        </form>
    );
}

// ── Sign Up Form ─────────────────────────────────────────────────────────────
function SignUpForm({ onSwitch, onSignupSuccess }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: tokenResponse => {
            console.log("Google Login Success (Token):", tokenResponse);
        },
        onError: () => console.log('Login Failed'),
    });

    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Full name is required.";
        if (!email) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
        if (!password) e.password = "Password is required.";
        else if (password.length < 8) e.password = "Minimum 8 characters.";
        if (!agreed) e.agreed = "You must accept the terms.";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        try {
            // Generate a valid username based on email prefix, within 3-20 chars
            let username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
            if (username.length < 3) {
                username = username + "123";
            }
            if (username.length > 20) {
                username = username.substring(0, 20);
            }

            const response = await api.post("/auth/signup", {
                username: username,
                email: email,
                password: password,
                fullName: name,
                role: ["user"]
            });

            toast.success(response.data?.message || "Registration successful! Please check your email.");
            onSignupSuccess(email);
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                label="Full Name"
                placeholder="John Doe"
                icon={<UserIcon />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
            />

            <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<MailIcon />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
            />

            <div className="space-y-1.5">
                <InputField
                    label="Password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 8 characters"
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
                <PasswordStrength password={password} />
            </div>

            {/* Terms */}
            <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <button
                        type="button"
                        onClick={() => setAgreed(!agreed)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${agreed ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
                    >
                        {agreed && <CheckIcon />}
                    </button>
                    <span className="text-xs text-gray-500 leading-relaxed">
                        I agree to the{" "}
                        <a href="https://example.com/terms" target="_blank" rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="https://example.com/privacy" target="_blank" rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline">
                            Privacy Policy
                        </a>
                    </span>
                </label>
                {errors.agreed && (
                    <p className="text-[11px] text-red-500 font-medium pl-6">{errors.agreed}</p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                    "Create Account"
                )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google */}
            <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
                <GoogleIcon /> Sign up with Google
            </button>

            {/* Switch */}
            <p className="text-center text-xs text-gray-500">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="font-black text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                    Sign in
                </button>
            </p>
        </form>
    );
}

// ── OTP Verification Form ────────────────────────────────────────────────────
function OtpVerificationForm({ email, onVerifySuccess, onCancel }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.trim().length !== 6) {
            setError("OTP must be 6 digits.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await api.post(`/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
            toast.success("Account activated successfully!");
            onVerifySuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Please check your code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setResending(true);
        try {
            await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
            toast.success("A new OTP has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP.");
        } finally {
            // reset resending status after 30 seconds to debounce
            setTimeout(() => setResending(false), 30000);
        }
    };

    return (
        <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center space-y-2 animate-fadeIn">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Verify Your Account
                </p>
                <p className="text-sm text-gray-600 font-medium">
                    We've sent a 6-digit verification code to:
                </p>
                <p className="text-sm font-bold text-gray-800 bg-gray-50 py-1.5 px-3 rounded-xl inline-block border border-gray-100">
                    {email}
                </p>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 text-center uppercase tracking-wider">
                    Enter 6-Digit OTP Code
                </label>
                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full text-center py-3 text-2xl font-black border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 tracking-[12px] pl-[12px] placeholder-gray-300 font-mono"
                    required
                />
                {error && (
                    <p className="text-[11px] text-red-500 font-bold text-center mt-1">{error}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 text-white transition-all active:scale-[0.98] disabled:opacity-75"
            >
                {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="flex items-center justify-between text-xs font-bold mt-4 px-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    ← Back to signup
                </button>
                <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                >
                    {resending ? "Resending..." : "Resend OTP"}
                </button>
            </div>
        </form>
    );
}

// ── Auth Page ────────────────────────────────────────────────────────────────
export default function Auth() {
    const [mode, setMode] = useState("signin"); // "signin" | "signup" | "verify_otp"
    const [verifyEmail, setVerifyEmail] = useState("");
    const isSignIn = mode === "signin";

    const handleSignupSuccess = (email) => {
        setVerifyEmail(email);
        setMode("verify_otp");
    };

    const handleVerifySuccess = () => {
        setMode("signin");
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">

            {/* Logo */}
            <Link to="/" className="mb-6 select-none">
                <span className="text-3xl font-black tracking-tight">
                    <span className="text-blue-600">Snap</span>
                    <span className="text-yellow-400">cart</span>
                </span>
            </Link>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Tab toggle */}
                {mode !== "verify_otp" && (
                    <div className="flex border-b border-gray-100">
                        {[
                            { label: "Sign In", value: "signin" },
                            { label: "Create Account", value: "signup" },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setMode(tab.value)}
                                className={`flex-1 py-4 text-sm font-black transition-all duration-200 border-b-2
                    ${mode === tab.value
                                        ? "border-blue-600 text-blue-600 bg-blue-50/40"
                                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Form area */}
                <div className="px-6 py-7">
                    {/* Heading */}
                    <div className="mb-6">
                        <h1 className="text-xl font-black text-gray-900 animate-fadeIn">
                            {mode === "signin"
                                ? "Welcome back 👋"
                                : mode === "signup"
                                ? "Create your account"
                                : "Verify your Email ✉️"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 animate-fadeIn">
                            {mode === "signin"
                                ? "Sign in to access your orders, wishlist and more."
                                : mode === "signup"
                                ? "Join Snapcart and start shopping smarter today."
                                : "Enter the verification code sent to your inbox to activate."}
                        </p>
                    </div>

                    {/* Animated form swap */}
                    <div key={mode} className="animate-fadeIn">
                        {mode === "signin" && <SignInForm onSwitch={() => setMode("signup")} />}
                        {mode === "signup" && <SignUpForm onSwitch={() => setMode("signin")} onSignupSuccess={handleSignupSuccess} />}
                        {mode === "verify_otp" && <OtpVerificationForm email={verifyEmail} onVerifySuccess={handleVerifySuccess} onCancel={() => setMode("signup")} />}
                    </div>
                </div>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} Snapcart. All rights reserved.
            </p>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
        </main>
    );
}