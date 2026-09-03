import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rupeesToPaise, generatePaymentReferenceId } from "@/lib/financial";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, farmer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });
    if (existingPayment) {
      return NextResponse.json({
        payment: existingPayment,
        message: "Payment already exists for this order",
      });
    }

    const amountInPaise = rupeesToPaise(order.grossAmount);
    const referenceId = generatePaymentReferenceId(order.orderNumber);
    const description = `AgriBridge order ${order.orderNumber} - ${order.quantity} quintals ${order.crop}`;

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    let paymentLinkId = null;
    let shortUrl = null;
    let paymentStatus: "CREATED" | "PENDING" = "PENDING";

    // Try real Razorpay integration
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes("xxxxx")) {
      try {
        const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/verify`;

        const response = await fetch("https://api.razorpay.com/v1/payment_links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            accept_partial: false,
            reference_id: referenceId,
            description,
            customer: {
              name: order.farmer.name,
              email: order.farmer.email,
              contact: order.farmer.phone || "+919876543210",
            },
            notify: { sms: false, email: false },
            callback_url: callbackUrl,
            callback_method: "get",
            notes: {
              order_id: order.id,
              order_number: order.orderNumber,
            },
          }),
        });

        if (response.ok) {
          const rzpData = await response.json();
          paymentLinkId = rzpData.id;
          shortUrl = rzpData.short_url;
          paymentStatus = "CREATED";
        } else {
          const errData = await response.json();
          console.error("Razorpay API error:", errData);
          // Fall through to demo mode
        }
      } catch (rzpError) {
        console.error("Razorpay request failed:", rzpError);
        // Fall through to demo mode
      }
    }

    // Demo mode fallback
    if (!paymentLinkId) {
      paymentLinkId = `plink_demo_${crypto.randomBytes(8).toString("hex")}`;
      shortUrl = null; // No real URL in demo mode
      paymentStatus = "CREATED";
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        razorpayPaymentLinkId: paymentLinkId,
        razorpayShortUrl: shortUrl,
        amount: amountInPaise,
        currency: "INR",
        status: paymentStatus,
        referenceId,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_REQUESTED" },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: order.farmerId,
        title: "Payment Request Created",
        message: `Razorpay payment request for ${order.orderNumber} (₹${order.grossAmount.toLocaleString("en-IN")}) has been created.`,
        type: "PAYMENT",
      },
    });

    // AI Action log
    await prisma.aIAction.create({
      data: {
        actionType: "CREATE_PAYMENT",
        description: `Payment request created for order ${order.orderNumber}: ₹${order.grossAmount.toLocaleString("en-IN")}`,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      payment,
      shortUrl,
      isDemo: !shortUrl,
      message: shortUrl
        ? "Payment link created successfully"
        : "Demo payment created — Razorpay Test Mode credentials not configured",
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
  }
}
