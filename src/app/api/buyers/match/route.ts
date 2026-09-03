import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchBuyers, type BuyerOfferInput } from "@/lib/matching";

export async function POST(request: NextRequest) {
  try {
    const { produceListingId } = await request.json();

    if (!produceListingId) {
      return NextResponse.json({ error: "produceListingId is required" }, { status: 400 });
    }

    const listing = await prisma.produceListing.findUnique({
      where: { id: produceListingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Produce listing not found" }, { status: 404 });
    }

    const buyerOffers = await prisma.buyerOffer.findMany({
      where: { crop: listing.crop, status: "ACTIVE" },
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
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        qualityGrade: listing.qualityGrade,
        location: listing.location,
        district: listing.district,
        state: listing.state,
        minimumPrice: listing.minimumPrice,
        sellingDeadline: listing.sellingDeadline,
      },
      offerInputs
    );

    // Store matches in DB (upsert pattern)
    for (const match of matches) {
      const offerId = buyerOffers.find((o: any) => o.buyer.id === match.buyerId)?.id;
      await prisma.buyerMatch.upsert({
        where: {
          id: `${produceListingId}-${match.buyerId}`,
        },
        update: {
          matchScore: match.matchScore,
          priceScore: match.priceScore,
          quantityScore: match.quantityScore,
          qualityScore: match.qualityScore,
          paymentScore: match.paymentScore,
          distanceScore: match.distanceScore,
          deadlineScore: match.deadlineScore,
          grossRevenue: match.grossRevenue,
          aiReasoning: match.reasons.join("; "),
        },
        create: {
          id: `${produceListingId}-${match.buyerId}`,
          produceListingId,
          buyerId: match.buyerId,
          buyerOfferId: offerId,
          matchScore: match.matchScore,
          priceScore: match.priceScore,
          quantityScore: match.quantityScore,
          qualityScore: match.qualityScore,
          paymentScore: match.paymentScore,
          distanceScore: match.distanceScore,
          deadlineScore: match.deadlineScore,
          grossRevenue: match.grossRevenue,
          aiReasoning: match.reasons.join("; "),
        },
      });
    }

    // Log AI action
    await prisma.aIAction.create({
      data: {
        actionType: "MATCH_BUYERS",
        description: `Matched ${matches.length} buyers for ${listing.crop} (${listing.quantity} ${listing.unit})`,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      matches,
      total: matches.length,
      produceListingId,
    });
  } catch (error) {
    console.error("Buyer matching error:", error);
    return NextResponse.json({ error: "Failed to match buyers" }, { status: 500 });
  }
}
