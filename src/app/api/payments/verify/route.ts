import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle Razorpay callback redirect (GET with payment params)
    const paymentLinkId = searchParams.get("razorpay_payment_link_id");
    const referenceId = searchParams.get("razorpay_payment_link_reference_id");
    const status = searchParams.get("razorpay_payment_link_status");
    const paymentId = searchParams.get("razorpay_payment_id");
    const signature = searchParams.get("razorpay_signature");

    if (paymentLinkId && referenceId && status && paymentId && signature) {
      // Verify signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        const payload = `${paymentLinkId}|${referenceId}|${status}|${paymentId}`;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(payload)
          .digest("hex");

        const isValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf-8"),
          Buffer.from(signature, "utf-8")
        );

        if (!isValid) {
          // Redirect to order page with error
          return NextResponse.redirect(
            new URL("/orders?payment=failed&reason=invalid_signature", request.url)
          );
        }
      }

      // Find and update payment
      const payment = await prisma.payment.findFirst({
        where: { razorpayPaymentLinkId: paymentLinkId },
        include: { order: true },
      });

      if (payment && payment.status !== "PAID") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentId,
          },
        });

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
              transactionId: paymentId,
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
            title: "Payment Received! ✅",
            message: `Payment of ₹${payment.order.grossAmount.toLocaleString("en-IN")} received for order ${payment.order.orderNumber}.`,
            type: "SUCCESS",
          },
        });
      }

      // Redirect to order page
      return NextResponse.redirect(
        new URL(`/orders/${payment?.orderId}?payment=success`, request.url)
      );
    }

    return NextResponse.json({ error: "Missing payment parameters" }, { status: 400 });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      new URL("/orders?payment=error", request.url)
    );
  }
}

// POST for manual/demo verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ message: "Payment already verified", payment });
    }

    // Update payment
    const demoPaymentId = paymentId || `pay_demo_${crypto.randomBytes(6).toString("hex")}`;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId: demoPaymentId,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_CONFIRMED" },
    });

    // Create transaction (idempotent)
    const existingTx = await prisma.transaction.findFirst({
      where: { orderId },
    });
    if (!existingTx) {
      await prisma.transaction.create({
        data: {
          orderId,
          transactionId: demoPaymentId,
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
        title: "Payment Confirmed! ✅",
        message: `Payment of ₹${payment.order.grossAmount.toLocaleString("en-IN")} confirmed for order ${payment.order.orderNumber}.`,
        type: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transactionId: demoPaymentId,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
