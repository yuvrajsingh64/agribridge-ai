import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateGrossRevenue, generateOrderNumber } from "@/lib/financial";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");

    if (!farmerId) {
      return NextResponse.json({ error: "farmerId is required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { farmerId },
      include: { buyer: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { buyerId, produceListingId, quantity, pricePerUnit, farmerId } = await request.json();

    if (!buyerId || !produceListingId || !farmerId) {
      return NextResponse.json(
        { error: "buyerId, produceListingId, and farmerId are required" },
        { status: 400 }
      );
    }

    const listing = await prisma.produceListing.findUnique({
      where: { id: produceListingId },
    });
    if (!listing) {
      return NextResponse.json({ error: "Produce listing not found" }, { status: 404 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerId },
    });
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    const qty = quantity || listing.quantity;
    const price = pricePerUnit || listing.minimumPrice;
    const grossAmount = calculateGrossRevenue(qty, price);
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        farmerId,
        buyerId,
        produceListingId,
        crop: listing.crop,
        quantity: qty,
        pricePerUnit: price,
        grossAmount,
        status: "PENDING",
      },
      include: { buyer: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: farmerId,
        title: "Order Created",
        message: `Order ${orderNumber} created with ${buyer.name} for ${qty} quintals of ${listing.crop} at ₹${price.toLocaleString("en-IN")}/qtl.`,
        type: "ORDER",
      },
    });

    // Log AI action
    await prisma.aIAction.create({
      data: {
        actionType: "CREATE_ORDER",
        description: `Order ${orderNumber} created: ${qty} qtl ${listing.crop} × ₹${price}/qtl = ₹${grossAmount.toLocaleString("en-IN")} with ${buyer.name}`,
        status: "COMPLETED",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
