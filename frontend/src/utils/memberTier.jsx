export const MEMBER_TIERS = {
  BRONZE: {
    key: "BRONZE",
    label: "Đồng",
    minSpend: 0,
    nextThreshold: 5_000_000,
    nextKey: "SILVER",
    multiplier: 1,
    badgeGradient: "bg-gradient-to-r from-amber-800 via-amber-600 to-orange-700",
    badgeBorder: "border-amber-700/50",
    badgeClass: "text-amber-50",
    progressClass: "bg-gradient-to-r from-amber-700 via-amber-500 to-orange-600",
    frameGradient: "bg-gradient-to-br from-amber-700 via-amber-500 to-orange-600",
    cardTint: "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60",
    glow: "shadow-[0_0_24px_rgba(180,83,9,0.35)]",
  },
  SILVER: {
    key: "SILVER",
    label: "Bạc",
    minSpend: 5_000_000,
    nextThreshold: 15_000_000,
    nextKey: "GOLD",
    multiplier: 1.1,
    badgeGradient: "bg-gradient-to-r from-slate-500 via-slate-300 to-yellow-200",
    badgeBorder: "border-slate-400/50",
    badgeClass: "text-slate-900",
    progressClass: "bg-gradient-to-r from-slate-500 via-slate-300 to-yellow-300",
    frameGradient: "bg-gradient-to-br from-slate-400 via-gray-200 to-yellow-300",
    cardTint: "bg-gradient-to-br from-slate-50/80 via-white to-yellow-50/50",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.35)]",
  },
  GOLD: {
    key: "GOLD",
    label: "Vàng",
    minSpend: 15_000_000,
    nextThreshold: 30_000_000,
    nextKey: "DIAMOND",
    multiplier: 1.25,
    badgeGradient: "bg-gradient-to-r from-yellow-700 via-yellow-400 to-amber-300",
    badgeBorder: "border-yellow-500/50",
    badgeClass: "text-yellow-950",
    progressClass: "bg-gradient-to-r from-yellow-600 via-yellow-400 to-amber-300",
    frameGradient: "bg-gradient-to-br from-yellow-600 via-yellow-400 to-amber-300",
    cardTint: "bg-gradient-to-br from-yellow-50/90 via-white to-amber-50/70",
    glow: "shadow-[0_0_28px_rgba(234,179,8,0.45)]",
  },
  DIAMOND: {
    key: "DIAMOND",
    label: "Kim cương",
    minSpend: 30_000_000,
    nextThreshold: null,
    nextKey: null,
    multiplier: 1.5,
    badgeGradient: "bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-200",
    badgeBorder: "border-amber-300/60",
    badgeClass: "text-amber-950",
    progressClass: "bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-300",
    frameGradient: "bg-gradient-to-br from-amber-300 via-yellow-100 to-cyan-200",
    cardTint: "bg-gradient-to-br from-amber-50/70 via-white to-cyan-50/60",
    glow: "shadow-[0_0_32px_rgba(251,191,36,0.4)]",
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
      .member-tier-badge-shimmer::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 20%, rgba(255, 251, 235, 0.55) 45%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 251, 235, 0.55) 55%, transparent 80%);
        width: 45%;
        animation: tier-badge-shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
        opacity: 0.75;
      }
      .member-tier-frame-sheen::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 15%, rgba(255, 251, 235, 0.35) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 251, 235, 0.35) 60%, transparent 85%);
        width: 40%;
        animation: tier-badge-shimmer 3.6s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
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

  if (!tier.nextKey || spend >= MEMBER_TIERS.DIAMOND.minSpend) {
    return { percent: 100, remaining: 0, nextLabel: null };
  }

  const threshold = tier.nextThreshold ?? (nextTierThreshold != null ? Number(nextTierThreshold) : null);

  if (threshold == null || Number.isNaN(threshold)) {
    return { percent: 100, remaining: 0, nextLabel: null };
  }

  const base = tier.minSpend;
  const range = threshold - base;
  const current = Math.max(0, spend - base);
  const percent = range > 0 ? Math.min(100, Math.round((current / range) * 100)) : 0;
  const remaining = Math.max(0, threshold - spend);
  const nextLabel = nextTierLabel || getTierConfig(tier.nextKey).label;

  return { percent, remaining, nextLabel };
}

export function MemberTierBadge({ tierKey, tierLabel, className = "", shiny = true }) {
  const tier = getTierConfig(tierKey);
  const label = tierLabel || tier.label;

  const baseClass = `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${tier.badgeGradient} ${tier.badgeBorder} ${tier.badgeClass}`;

  if (!shiny) {
    return (
      <span className={`${baseClass} px-2 py-0.5 ${className}`}>
        {label}
      </span>
    );
  }

  return (
    <>
      <ShinyTierStyles />
      <span className={`member-tier-badge-shimmer relative overflow-hidden ${baseClass} ${className}`}>
        <span className="relative z-[1] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">{label}</span>
      </span>
    </>
  );
}

export function MemberTierCard({ user, tierProgress, compact = false }) {
  const tier = getTierConfig(user?.memberTier);
  const multiplier = user?.pointsMultiplier || tier.multiplier;

  return (
    <>
      <ShinyTierStyles />
      <div className={`rounded-2xl p-[2px] ${tier.frameGradient} ${tier.glow} ${compact ? "mb-4" : ""}`}>
        <div className={`member-tier-frame-sheen relative overflow-hidden rounded-[14px] ${tier.cardTint}`}>
          <div className={`relative z-[2] ${compact ? "p-4" : "p-5 sm:p-6"}`}>
            {!compact && (
              <h2 className="mb-4 text-lg font-black text-gray-900">Hạng hội viên</h2>
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
                <p className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 bg-clip-text text-sm font-black text-transparent">
                  Bạn đang ở hạng cao nhất!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
