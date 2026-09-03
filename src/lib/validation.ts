import { z } from "zod";

// ─── Produce Validation ───────────────────────────────────────

export const createProduceSchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  variety: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(["quintal", "ton", "kg"]).default("quintal"),
  qualityGrade: z.enum(["Grade A", "Grade B", "Grade C"]),
  location: z.string().min(1, "Location is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  harvestDate: z.string().optional(),
  minimumPrice: z.number().int().positive("Minimum price must be positive"),
  expectedPrice: z.number().int().positive().optional(),
  sellingDeadline: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateProduceInput = z.infer<typeof createProduceSchema>;

// ─── Order Validation ─────────────────────────────────────────

export const createOrderSchema = z.object({
  buyerId: z.string().min(1, "Buyer is required"),
  produceListingId: z.string().min(1, "Produce listing is required"),
  quantity: z.number().positive("Quantity must be positive"),
  pricePerUnit: z.number().int().positive("Price must be positive"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ─── Payment Validation ──────────────────────────────────────

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const verifyPaymentSchema = z.object({
  razorpayPaymentLinkId: z.string(),
  razorpayPaymentLinkReferenceId: z.string(),
  razorpayPaymentLinkStatus: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ─── AI Chat Validation ──────────────────────────────────────

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  conversationId: z.string().optional(),
  farmerId: z.string().min(1, "Farmer ID is required"),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;

// ─── Buyer Match Validation ──────────────────────────────────

export const buyerMatchSchema = z.object({
  produceListingId: z.string().min(1, "Produce listing is required"),
});

export type BuyerMatchInput = z.infer<typeof buyerMatchSchema>;
