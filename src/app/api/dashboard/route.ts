import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchBuyers, type BuyerOfferInput } from "@/lib/matching";
import { calculateGrossRevenue, formatINR } from "@/lib/financial";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");

    if (!farmerId) {
      return NextResponse.json({ error: "farmerId is required" }, { status: 400 });
    }

    // Load all farmer data
    const produce = await prisma.produceListing.findMany({ where: { farmerId } });
    const orders = await prisma.order.findMany({
      where: { farmerId },
      include: { payment: true, buyer: true },
    });

    const activeListings = produce.filter((p: any) => p.status === "ACTIVE");
    const activeListing = activeListings[0];

    const activeOrders = orders.filter(
      (o: any) => !["COMPLETED", "CANCELLED"].includes(o.status)
    ).length;

    // Calculate pending payment amount
    let pendingPayment = 0;
    orders.forEach((o: any) => {
      if (["PENDING", "PAYMENT_REQUESTED"].includes(o.status)) {
        pendingPayment += o.grossAmount;
      }
    });

    // Get best offer from marketplace
    let bestOffer = 0;
    let expectedRevenue = 0;
    let recommendation = null;

    if (activeListing) {
      const buyerOffers = await prisma.buyerOffer.findMany({
        where: { crop: activeListing.crop, status: "ACTIVE" },
        include: { buyer: true },
      });

      const offerInputs: BuyerOfferInput[] = buyerOffers.map((o: any) => ({
        buyerId: o.buyer.id,
        buyerName: o.buyer.name,
        buyerLocation: o.buyer.location,
        buyerDistrict: o.buyer.district,
        buyerState: o.buyer.state,
        buyerRating: o.buyer.rating,
        paymentWindowHours: o.buyer.paymentWindowHours,
        crop: o.crop,
        pricePerUnit: o.pricePerUnit,
        minimumQuantity: o.minimumQuantity,
        maximumQuantity: o.maximumQuantity,
        qualityRequirements: o.qualityRequirements,
        validUntil: o.validUntil,
      }));

      const matches = matchBuyers(
        {
          crop: activeListing.crop,
          quantity: activeListing.quantity,
          unit: activeListing.unit,
          qualityGrade: activeListing.qualityGrade,
          location: activeListing.location,
          district: activeListing.district,
          state: activeListing.state,
          minimumPrice: activeListing.minimumPrice,
          sellingDeadline: activeListing.sellingDeadline,
        },
        offerInputs
      );

      if (matches.length > 0) {
        const best = matches[0];
        bestOffer = best.pricePerUnit;
        expectedRevenue = best.grossRevenue;

        recommendation = {
          buyerName: best.buyerName,
          pricePerUnit: best.pricePerUnit,
          quantity: activeListing.quantity,
          grossRevenue: best.grossRevenue,
          matchScore: best.matchScore,
          paymentHours: best.paymentWindowHours,
          buyerCount: matches.length,
          reasons: best.reasons,
        };
      }
    }

    // AI opportunity score based on market conditions
    const aiScore = recommendation
      ? Math.min(100, Math.round(recommendation.matchScore * 0.9 + 5))
      : 50;

    return NextResponse.json({
      totalProduce: activeListing?.quantity || 0,
      activeCrop: activeListing?.crop || "None",
      bestOffer,
      expectedRevenue,
      pendingPayment,
      activeOrders,
      aiScore,
      recommendation,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
