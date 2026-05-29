export const MEMBER_TIERS = {
  BRONZE: {
    key: "BRONZE",
    label: "Đồng",
    minSpend: 0,
    nextThreshold: 5_000_000,
    nextKey: "SILVER",
    multiplier: 1,
    badgeBg: "bg-stone-200",
    badgeBorder: "border-stone-400",
    badgeClass: "text-stone-800",
    progressClass: "bg-stone-600",
  },
  SILVER: {
    key: "SILVER",
    label: "Bạc",
    minSpend: 5_000_000,
    nextThreshold: 15_000_000,
    nextKey: "GOLD",
    multiplier: 1.1,
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-300",
    badgeClass: "text-slate-800",
    progressClass: "bg-slate-500",
  },
  GOLD: {
    key: "GOLD",
    label: "Vàng",
    minSpend: 15_000_000,
    nextThreshold: 30_000_000,
    nextKey: "DIAMOND",
    multiplier: 1.25,
    badgeBg: "bg-orange-100",
    badgeBorder: "border-orange-400",
    badgeClass: "text-orange-900",
    progressClass: "bg-orange-600",
  },
  DIAMOND: {
    key: "DIAMOND",
    label: "Kim cương",
    minSpend: 30_000_000,
    nextThreshold: null,
    nextKey: null,
    multiplier: 1.5,
    badgeBg: "bg-cyan-100",
    badgeBorder: "border-cyan-300",
    badgeClass: "text-cyan-900",
    progressClass: "bg-cyan-500",
  },
};

export const TIER_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả hạng" },
  { value: "BRONZE", label: "Đồng" },
  { value: "SILVER", label: "Bạc" },
  { value: "GOLD", label: "Vàng" },
  { value: "DIAMOND", label: "Kim cương" },
];

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

export function MemberTierBadge({ tierKey, tierLabel, className = "" }) {
  const tier = getTierConfig(tierKey);
  const label = tierLabel || tier.label;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeClass} ${className}`}
    >
      {label}
    </span>
  );
}

export function MemberTierCard({ user, tierProgress, compact = false }) {
  const tier = getTierConfig(user?.memberTier);
  const multiplier = user?.pointsMultiplier || tier.multiplier;

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${compact ? "mb-4" : ""}`}>
      <div className={compact ? "p-4" : "p-5 sm:p-6"}>
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
            <p className="text-sm font-black text-cyan-700">Bạn đang ở hạng cao nhất!</p>
          )}
        </div>
      </div>
    </div>
  );
}
