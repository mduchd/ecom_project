const VALID_COUPONS = {
  SAVE10: { type: "percent", value: 10 },
  FLAT50: { type: "fixed", value: 50 },
  TECH20: { type: "percent", value: 20 },
};

/** Matches backend OrderService.calculateDiscount (cap, then HALF_UP to integer). */
export function calculateDiscount(subtotal, couponCode) {
  const coupon = couponCode ? VALID_COUPONS[couponCode] : null;
  if (!coupon) return 0;

  const rawDiscount = coupon.type === "percent"
    ? (subtotal * coupon.value) / 100
    : coupon.value;

  const capped = Math.min(rawDiscount, subtotal);
  return Math.round(capped);
}

export { VALID_COUPONS };
