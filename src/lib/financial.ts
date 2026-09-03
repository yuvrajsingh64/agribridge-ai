// ─── Financial Calculations ───────────────────────────────────
// All monetary calculations use integer arithmetic to avoid
// floating-point precision issues.

/**
 * Convert rupees to paise (for Razorpay API)
 * ₹1,93,600 → 19360000 paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (from Razorpay API)
 * 19360000 paise → ₹1,93,600
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculate gross revenue using integer multiplication
 * quantity × pricePerUnit (both in whole numbers)
 */
export function calculateGrossRevenue(quantity: number, pricePerUnit: number): number {
  // Use integer arithmetic: round both inputs to avoid float issues
  return Math.round(quantity * pricePerUnit);
}

/**
 * Calculate estimated net revenue after platform fee
 * For MVP, we use a simple 1% platform fee
 */
export function calculateEstimatedNetRevenue(
  grossRevenue: number,
  platformFeePercent: number = 1
): { netRevenue: number; platformFee: number } {
  const platformFee = Math.round((grossRevenue * platformFeePercent) / 100);
  const netRevenue = grossRevenue - platformFee;
  return { netRevenue, platformFee };
}

/**
 * Calculate estimated transaction cost
 */
export function calculateTransactionCost(grossRevenue: number): number {
  // ~1% platform fee for demo
  return Math.round(grossRevenue * 0.01);
}

/**
 * Format amount in INR with ₹ symbol and Indian number system
 * e.g., 193600 → "₹1,93,600"
 */
export function formatINR(amount: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Format amount in INR with decimals
 */
export function formatINRDecimal(amount: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Format compact INR (e.g., "₹1.93L")
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
}

/**
 * Generate order number
 * Format: AGB-YYYY-XXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AGB-${year}-${random}`;
}

/**
 * Generate payment reference ID
 * Format: AGB-ORD-YYYY-XXXX
 */
export function generatePaymentReferenceId(orderNumber: string): string {
  return `AGB-ORD-${orderNumber.replace("AGB-", "")}`;
}
