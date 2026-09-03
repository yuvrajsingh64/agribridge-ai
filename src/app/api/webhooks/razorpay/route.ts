import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment_link.paid") {
      const paymentLink = event.payload.payment_link.entity;
      const paymentEntity = event.payload.payment.entity;

      // Find payment by razorpay link ID
      const payment = await prisma.payment.findFirst({
        where: { razorpayPaymentLinkId: paymentLink.id },
        include: { order: true },
      });

      if (!payment) {
        console.warn(`Payment not found for link: ${paymentLink.id}`);
        return NextResponse.json({ status: "ok", message: "Payment not found" });
      }

      // Idempotent: check if already processed
      if (payment.status === "PAID") {
        return NextResponse.json({ status: "ok", message: "Already processed" });
      }

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: paymentEntity.id,
        },
      });

      // Update order
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAYMENT_CONFIRMED" },
      });

      // Create transaction (idempotent)
      const existingTx = await prisma.transaction.findFirst({
        where: { orderId: payment.orderId },
      });
      if (!existingTx) {
        await prisma.transaction.create({
          data: {
            orderId: payment.orderId,
            transactionId: paymentEntity.id,
            amount: payment.order.grossAmount,
            paymentMethod: "Razorpay",
            status: "PAID",
            completedAt: new Date(),
          },
        });
      }

      // Notification
      await prisma.notification.create({
        data: {
          userId: payment.order.farmerId,
          title: "Payment Received via Razorpay ✅",
          message: `Payment of ₹${payment.order.grossAmount.toLocaleString("en-IN")} received for order ${payment.order.orderNumber}.`,
          type: "SUCCESS",
        },
      });

      console.log(`Webhook: Payment ${paymentEntity.id} processed for order ${payment.order.orderNumber}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
