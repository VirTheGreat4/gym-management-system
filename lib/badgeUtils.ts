import { CustomBadge } from "@/types/database";

export interface CalculatedDiscountResult {
  finalPrice: number;
  totalDiscountAmount: number;
  totalPercent: number;
  totalDirectAmount: number;
  indicatorText: string;
}

/**
 * Calculates the final subscription price for a member with 1 or multiple badges.
 * Supports both PERCENTAGE discounts (% off) and DIRECT monetary discounts (fixed ₱ off).
 * Prevents negative balances using Math.max(0, finalPrice) floor cap.
 */
export function calculateMemberPlanPrice(
  basePrice: number,
  memberBadges: string[] = [],
  allBadges: CustomBadge[] = []
): CalculatedDiscountResult {
  const safeBasePrice = typeof basePrice === "number" && !isNaN(basePrice) && basePrice > 0 ? basePrice : 0;
  
  if (safeBasePrice === 0 || !memberBadges || memberBadges.length === 0 || !allBadges || allBadges.length === 0) {
    return {
      finalPrice: safeBasePrice,
      totalDiscountAmount: 0,
      totalPercent: 0,
      totalDirectAmount: 0,
      indicatorText: "",
    };
  }

  let totalPercent = 0;
  let totalDirectAmount = 0;
  const appliedSummaries: string[] = [];

  memberBadges.forEach((bName) => {
    const badge = allBadges.find(
      (b) => b.name.toLowerCase() === bName.toLowerCase() || b.id === bName
    );
    if (!badge) return;

    const isDirect = badge.discount_type === "DIRECT";
    const val = badge.discount_value ?? (isDirect ? 0 : (badge.discount_percent ?? 0));

    if (isDirect) {
      if (val > 0) {
        totalDirectAmount += val;
        appliedSummaries.push(`₱${val} ${badge.name}`);
      }
    } else {
      if (val > 0) {
        totalPercent += val;
        appliedSummaries.push(`${val}% ${badge.name}`);
      }
    }
  });

  // Clamp percentage discount to max 100%
  const clampedPercent = Math.min(100, Math.max(0, totalPercent));
  const percentDiscountAmount = (safeBasePrice * clampedPercent) / 100;
  const totalDiscountAmount = percentDiscountAmount + totalDirectAmount;
  
  // Apply floor cap at 0 to prevent negative price
  const finalPrice = Math.max(0, Math.round(safeBasePrice - totalDiscountAmount));

  let indicatorText = "";
  if (appliedSummaries.length > 0 && totalDiscountAmount > 0) {
    indicatorText = `${appliedSummaries.join(" + ")} Applied — Total ₱${Math.round(totalDiscountAmount)} Saved!`;
  }

  return {
    finalPrice,
    totalDiscountAmount,
    totalPercent: clampedPercent,
    totalDirectAmount,
    indicatorText,
  };
}

/**
 * Returns formatted discount label for UI display (e.g. "15% OFF" or "₱100 OFF")
 */
export function getBadgeDiscountLabel(badge: CustomBadge): string {
  const isDirect = badge.discount_type === "DIRECT";
  const val = badge.discount_value ?? (isDirect ? 0 : (badge.discount_percent ?? 0));
  if (isDirect) {
    return `₱${val} OFF`;
  }
  return `${val}% OFF`;
}
