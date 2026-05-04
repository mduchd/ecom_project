// src/pages/Auth.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

// ── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        {open ? (
            <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
        ) : (
            <><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>
        )}
    </svg>
);

const MailIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const e = {};
        if (!email) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
        if (!password) e.password = "Password is required.";
        else if (password.length < 6) e.password = "Minimum 6 characters.";
        return e;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        setTimeout(() => { setLoading(false); setSuccess(true); }, 1200);
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
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
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
function SignUpForm({ onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        setTimeout(() => { setLoading(false); setSuccess(true); }, 1200);
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
                disabled={loading || success}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
          ${success
                        ? "bg-emerald-500 shadow-emerald-100 text-white"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    }`}
            >
                {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                ) : success ? (
                    <><CheckIcon /> Account Created!</>
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

// ── Auth Page ────────────────────────────────────────────────────────────────
export default function Auth() {
    const [mode, setMode] = useState("signin"); // "signin" | "signup"
    const isSignIn = mode === "signin";

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

                {/* Form area */}
                <div className="px-6 py-7">
                    {/* Heading */}
                    <div className="mb-6">
                        <h1 className="text-xl font-black text-gray-900">
                            {isSignIn ? "Welcome back 👋" : "Create your account"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            {isSignIn
                                ? "Sign in to access your orders, wishlist and more."
                                : "Join Snapcart and start shopping smarter today."}
                        </p>
                    </div>

                    {/* Animated form swap */}
                    <div key={mode} className="animate-fadeIn">
                        {isSignIn
                            ? <SignInForm onSwitch={() => setMode("signup")} />
                            : <SignUpForm onSwitch={() => setMode("signin")} />
                        }
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