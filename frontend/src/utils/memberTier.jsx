import { FaGem, FaMedal, FaStar } from "react-icons/fa";

export const MEMBER_TIERS = {
  BRONZE: {
    key: "BRONZE",
    label: "Đồng",
    minSpend: 0,
    nextThreshold: 5_000_000,
    nextKey: "SILVER",
    multiplier: 1,
    badgeBg: "bg-amber-100",
    badgeBorder: "border-amber-400",
    badgeClass: "text-amber-900",
    progressClass: "bg-amber-500",
    iconClass: "text-amber-700",
    frameBorder: "border-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    Icon: FaMedal,
  },
  SILVER: {
    key: "SILVER",
    label: "Bạc",
    minSpend: 5_000_000,
    nextThreshold: 15_000_000,
    nextKey: "GOLD",
    multiplier: 1.1,
    badgeBg: "bg-slate-200",
    badgeBorder: "border-slate-400",
    badgeClass: "text-slate-800",
    progressClass: "bg-slate-500",
    iconClass: "text-slate-600",
    frameBorder: "border-slate-400",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]",
    Icon: FaMedal,
  },
  GOLD: {
    key: "GOLD",
    label: "Vàng",
    minSpend: 15_000_000,
    nextThreshold: 30_000_000,
    nextKey: "DIAMOND",
    multiplier: 1.25,
    badgeBg: "bg-yellow-100",
    badgeBorder: "border-yellow-400",
    badgeClass: "text-yellow-900",
    progressClass: "bg-yellow-500",
    iconClass: "text-yellow-700",
    frameBorder: "border-yellow-400",
    glow: "shadow-[0_0_22px_rgba(234,179,8,0.3)]",
    Icon: FaStar,
  },
  DIAMOND: {
    key: "DIAMOND",
    label: "Kim cương",
    minSpend: 30_000_000,
    nextThreshold: null,
    nextKey: null,
    multiplier: 1.5,
    badgeBg: "bg-cyan-100",
    badgeBorder: "border-cyan-400",
    badgeClass: "text-cyan-900",
    progressClass: "bg-cyan-500",
    iconClass: "text-cyan-700",
    frameBorder: "border-cyan-400",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.35)]",
    Icon: FaGem,
  },
};

export const TIER_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả hạng" },
  { value: "BRONZE", label: "Đồng" },
  { value: "SILVER", label: "Bạc" },
  { value: "GOLD", label: "Vàng" },
  { value: "DIAMOND", label: "Kim cương" },
];

function ShinyTierStyles() {
  return (
    <style>{`
      @keyframes tier-badge-shimmer {
        0% { transform: translateX(-120%) skewX(-20deg); }
        100% { transform: translateX(220%) skewX(-20deg); }
      }
      @keyframes tier-sparkle {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
      }
      .member-tier-badge-shimmer::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.45);
        width: 40%;
        animation: tier-badge-shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
        opacity: 0.6;
      }
      .member-tier-frame-sheen::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.18);
        width: 35%;
        animation: tier-badge-shimmer 3.6s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }
      .member-tier-sparkle-icon {
        animation: tier-sparkle 2.4s ease-in-out infinite;
      }
    `}</style>
  );
}

export function getTierConfig(tierKey) {
  return MEMBER_TIERS[tierKey] || MEMBER_TIERS.BRONZE;
}

export function formatSpend(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function getTierProgress(deliveredSpend, tierKey, nextTierThreshold, nextTierLabel) {
  const spend = Number(deliveredSpend || 0);
  const tier = getTierConfig(tierKey);
  const threshold = nextTierThreshold != null ? Number(nextTierThreshold) : tier.nextThreshold;

  if (!threshold) {
    return { percent: 100, remaining: 0, nextLabel: null };
  }

  const base = tier.minSpend;
  const range = threshold - base;
  const current = Math.max(0, spend - base);
  const percent = range > 0 ? Math.min(100, Math.round((current / range) * 100)) : 0;
  const remaining = Math.max(0, threshold - spend);
  const nextLabel = nextTierLabel || (tier.nextKey ? getTierConfig(tier.nextKey).label : null);

  return { percent, remaining, nextLabel };
}

export function MemberTierBadge({ tierKey, tierLabel, className = "", shiny = true, showIcon = true }) {
  const tier = getTierConfig(tierKey);
  const label = tierLabel || tier.label;
  const Icon = tier.Icon;

  const baseClass = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeClass}`;

  if (!shiny) {
    return (
      <span className={`${baseClass} px-2 py-0.5 ${className}`}>
        {showIcon && <Icon className={`w-2.5 h-2.5 ${tier.iconClass}`} />}
        {label}
      </span>
    );
  }

  return (
    <>
      <ShinyTierStyles />
      <span className={`member-tier-badge-shimmer relative overflow-hidden shadow-sm ${baseClass} ${className}`}>
        {showIcon && <Icon className={`member-tier-sparkle-icon relative z-[1] w-3 h-3 shrink-0 ${tier.iconClass}`} />}
        <span className="relative z-[1] tracking-wide">{label}</span>
      </span>
    </>
  );
}

export function MemberTierCard({ user, tierProgress, compact = false }) {
  const tier = getTierConfig(user?.memberTier);
  const multiplier = user?.pointsMultiplier || tier.multiplier;
  const Icon = tier.Icon;

  return (
    <>
      <ShinyTierStyles />
      <div
        className={`member-tier-frame-sheen relative overflow-hidden rounded-2xl border-2 bg-white ${tier.frameBorder} ${tier.glow} ${compact ? "mb-4" : ""}`}
      >
        <div className={`relative z-[2] ${compact ? "p-4" : "p-5 sm:p-6"}`}>
          {!compact && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-gray-900">Hạng hội viên</h2>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tier.badgeBg} ${tier.badgeBorder}`}>
                <Icon className={`member-tier-sparkle-icon h-5 w-5 ${tier.iconClass}`} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <MemberTierBadge
                tierKey={user?.memberTier}
                tierLabel={user?.memberTierLabel}
                className="text-xs px-3 py-1.5"
              />
              <p className="mt-3 text-sm font-bold text-gray-600">
                Tổng chi tiêu đơn đã giao:{" "}
                <span className="text-gray-900">{formatSpend(user?.deliveredSpend)}</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Hệ số tích điểm hiện tại:{" "}
                <span className="font-black text-blue-600">x{multiplier}</span>
              </p>
            </div>

            {tierProgress.nextLabel ? (
              <div className="sm:w-72">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Tiến độ lên {tierProgress.nextLabel}</span>
                  <span>{tierProgress.percent}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200/80">
                  <div
                    className={`h-full rounded-full ${tier.progressClass}`}
                    style={{ width: `${tierProgress.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Còn {formatSpend(tierProgress.remaining)} để lên hạng {tierProgress.nextLabel}
                </p>
              </div>
            ) : (
              <p className="text-sm font-black text-cyan-700">Bạn đang ở hạng cao nhất!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
