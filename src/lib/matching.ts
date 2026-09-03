// ─── Buyer Matching Engine ─────────────────────────────────────
// Deterministic scoring algorithm for matching farmers with buyers.
// This is the core of AgriBridge's "AI" — structured, transparent scoring.

import { calculateGrossRevenue } from "./financial";

// ─── Types ────────────────────────────────────────────────────

export interface ProduceInput {
  crop: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  location: string;
  district: string;
  state: string;
  minimumPrice: number;
  sellingDeadline?: Date | null;
}

export interface BuyerOfferInput {
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  buyerDistrict: string;
  buyerState: string;
  buyerRating: number;
  paymentWindowHours: number;
  crop: string;
  pricePerUnit: number;
  minimumQuantity: number;
  maximumQuantity: number;
  qualityRequirements: string;
  validUntil?: Date | null;
}

export interface MatchResult {
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  buyerDistrict: string;
  buyerState: string;
  buyerRating: number;
  paymentWindowHours: number;
  pricePerUnit: number;
  minimumQuantity: number;
  maximumQuantity: number;
  qualityRequirements: string;
  matchScore: number;
  priceScore: number;
  quantityScore: number;
  qualityScore: number;
  paymentScore: number;
  distanceScore: number;
  deadlineScore: number;
  grossRevenue: number;
  reasons: string[];
}

// ─── Scoring Weights ──────────────────────────────────────────

const WEIGHTS = {
  price: 0.40,
  quantity: 0.20,
  quality: 0.15,
  payment: 0.10,
  distance: 0.10,
  deadline: 0.05,
};

// ─── Distance Estimation ──────────────────────────────────────
// Simplified distance estimation based on district/state matching
// In production, this would use geocoding

const DISTRICT_DISTANCES: Record<string, Record<string, number>> = {
  "sehore": {
    "indore": 112,
    "bhopal": 40,
    "ujjain": 150,
    "dewas": 80,
    "ratlam": 200,
    "gwalior": 400,
    "jabalpur": 350,
    "sagar": 250,
  },
};

function estimateDistance(farmerDistrict: string, buyerDistrict: string): number {
  const fd = farmerDistrict.toLowerCase();
  const bd = buyerDistrict.toLowerCase();
  
  if (fd === bd) return 0;
  
  if (DISTRICT_DISTANCES[fd]?.[bd]) return DISTRICT_DISTANCES[fd][bd];
  if (DISTRICT_DISTANCES[bd]?.[fd]) return DISTRICT_DISTANCES[bd][fd];
  
  // Default: different district same state ~150km, different state ~500km
  return 200;
}

// ─── Scoring Functions ────────────────────────────────────────

function calculatePriceScore(offerPrice: number, minimumPrice: number, maxOfferPrice: number): number {
  if (offerPrice < minimumPrice) return 0;
  if (maxOfferPrice === minimumPrice) return 100;
  
  // Score based on how much above minimum, relative to the best offer
  const range = maxOfferPrice - minimumPrice;
  const above = offerPrice - minimumPrice;
  return Math.min(100, Math.round((above / range) * 100));
}

function calculateQuantityScore(
  farmerQuantity: number,
  minRequired: number,
  maxAccepted: number
): number {
  if (farmerQuantity < minRequired) return 30; // Partial match penalty
  if (farmerQuantity <= maxAccepted) return 100; // Full quantity accepted
  // Buyer can't take full quantity
  const acceptance = maxAccepted / farmerQuantity;
  return Math.round(acceptance * 100);
}

function calculateQualityScore(farmerGrade: string, buyerRequirements: string): number {
  const fGrade = farmerGrade.toLowerCase().trim();
  const bReq = buyerRequirements.toLowerCase().trim();
  
  // Exact match
  if (bReq.includes(fGrade)) return 100;
  
  // Grade A farmer meets Grade A/B buyer
  if (fGrade === "grade a" && bReq.includes("grade a")) return 100;
  
  // Grade B farmer meets Grade A/B buyer  
  if (fGrade === "grade b" && bReq.includes("grade b")) return 100;
  if (fGrade === "grade b" && bReq === "grade a") return 40; // Mismatch
  
  // Grade C
  if (fGrade === "grade c") return bReq.includes("grade c") ? 100 : 20;
  
  return 60; // Default partial match
}

function calculatePaymentScore(paymentWindowHours: number): number {
  if (paymentWindowHours <= 24) return 100;
  if (paymentWindowHours <= 48) return 80;
  if (paymentWindowHours <= 72) return 60;
  if (paymentWindowHours <= 168) return 40; // 7 days
  return 20;
}

function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm <= 50) return 100;
  if (distanceKm <= 100) return 85;
  if (distanceKm <= 150) return 70;
  if (distanceKm <= 200) return 55;
  if (distanceKm <= 300) return 40;
  return 20;
}

function calculateDeadlineScore(
  sellingDeadline: Date | null | undefined,
  paymentWindowHours: number
): number {
  if (!sellingDeadline) return 80; // No deadline, neutral score
  
  const now = new Date();
  const daysUntilDeadline = Math.ceil(
    (sellingDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDeadline <= 0) return 20; // Deadline passed
  
  const paymentDays = paymentWindowHours / 24;
  
  if (paymentDays <= daysUntilDeadline) return 100; // Payment within deadline
  return Math.max(20, Math.round((daysUntilDeadline / paymentDays) * 100));
}

// ─── Match Reasons Generator ──────────────────────────────────

function generateReasons(match: MatchResult, produce: ProduceInput): string[] {
  const reasons: string[] = [];
  
  if (match.priceScore >= 80) {
    reasons.push(`High price offer of ₹${match.pricePerUnit}/quintal`);
  }
  
  if (match.quantityScore === 100) {
    reasons.push(`Accepts your full ${produce.quantity} ${produce.unit} quantity`);
  } else if (match.quantityScore >= 70) {
    reasons.push(`Can accept up to ${match.maximumQuantity} ${produce.unit}`);
  }
  
  if (match.qualityScore === 100) {
    reasons.push(`${match.qualityRequirements} requirement matches your ${produce.qualityGrade}`);
  }
  
  if (match.paymentScore >= 80) {
    reasons.push(`Fast payment within ${match.paymentWindowHours} hours`);
  }
  
  if (match.distanceScore >= 70) {
    reasons.push(`Located nearby in ${match.buyerDistrict}`);
  }
  
  if (match.deadlineScore >= 80 && produce.sellingDeadline) {
    reasons.push("Delivery window matches your selling deadline");
  }
  
  if (match.buyerRating >= 4.5) {
    reasons.push(`Highly rated buyer (${match.buyerRating}/5)`);
  }
  
  return reasons;
}

// ─── Main Matching Function ───────────────────────────────────

export function matchBuyers(
  produce: ProduceInput,
  offers: BuyerOfferInput[]
): MatchResult[] {
  // Filter to matching crop first
  const cropOffers = offers.filter(
    (o) => o.crop.toLowerCase() === produce.crop.toLowerCase()
  );
  
  if (cropOffers.length === 0) return [];
  
  // Find max offer price for normalization
  const maxOfferPrice = Math.max(...cropOffers.map((o) => o.pricePerUnit));
  
  const results: MatchResult[] = cropOffers.map((offer) => {
    const distance = estimateDistance(produce.district, offer.buyerDistrict);
    
    const priceScore = calculatePriceScore(offer.pricePerUnit, produce.minimumPrice, maxOfferPrice);
    const quantityScore = calculateQuantityScore(
      produce.quantity,
      offer.minimumQuantity,
      offer.maximumQuantity
    );
    const qualityScore = calculateQualityScore(produce.qualityGrade, offer.qualityRequirements);
    const paymentScore = calculatePaymentScore(offer.paymentWindowHours);
    const distanceScore = calculateDistanceScore(distance);
    const deadlineScore = calculateDeadlineScore(produce.sellingDeadline, offer.paymentWindowHours);
    
    // Weighted total
    const matchScore = Math.round(
      priceScore * WEIGHTS.price +
      quantityScore * WEIGHTS.quantity +
      qualityScore * WEIGHTS.quality +
      paymentScore * WEIGHTS.payment +
      distanceScore * WEIGHTS.distance +
      deadlineScore * WEIGHTS.deadline
    );
    
    // Calculate effective quantity (what buyer can actually take)
    const effectiveQuantity = Math.min(produce.quantity, offer.maximumQuantity);
    const grossRevenue = calculateGrossRevenue(effectiveQuantity, offer.pricePerUnit);
    
    const match: MatchResult = {
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      buyerLocation: offer.buyerLocation,
      buyerDistrict: offer.buyerDistrict,
      buyerState: offer.buyerState,
      buyerRating: offer.buyerRating,
      paymentWindowHours: offer.paymentWindowHours,
      pricePerUnit: offer.pricePerUnit,
      minimumQuantity: offer.minimumQuantity,
      maximumQuantity: offer.maximumQuantity,
      qualityRequirements: offer.qualityRequirements,
      matchScore,
      priceScore,
      quantityScore,
      qualityScore,
      paymentScore,
      distanceScore,
      deadlineScore,
      grossRevenue,
      reasons: [],
    };
    
    match.reasons = generateReasons(match, produce);
    
    return match;
  });
  
  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}

/**
 * Get the top N buyer matches
 */
export function getTopMatches(
  produce: ProduceInput,
  offers: BuyerOfferInput[],
  topN: number = 3
): MatchResult[] {
  return matchBuyers(produce, offers).slice(0, topN);
}

/**
 * Generate a comparison summary for multiple matches
 */
export function generateComparisonSummary(matches: MatchResult[]): string {
  if (matches.length === 0) return "No matching buyers found.";
  
  const best = matches[0];
  const lines = [
    `Best match: ${best.buyerName} with score ${best.matchScore}/100`,
    `Offer: ₹${best.pricePerUnit}/quintal`,
    `Expected revenue: ₹${best.grossRevenue.toLocaleString("en-IN")}`,
    `Payment: Within ${best.paymentWindowHours} hours`,
  ];
  
  if (matches.length > 1) {
    lines.push(
      `\nAlternatives: ${matches.slice(1).map(m => 
        `${m.buyerName} (₹${m.pricePerUnit}/qtl, score ${m.matchScore}/100)`
      ).join(", ")}`
    );
  }
  
  return lines.join("\n");
}
