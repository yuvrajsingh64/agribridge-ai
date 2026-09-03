import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");
    const minPrice = searchParams.get("minPrice");

    const where: any = {};

    const buyers = await prisma.buyer.findMany({
      include: {
        offers: {
          where: {
            status: "ACTIVE",
            ...(crop ? { crop } : {}),
            ...(minPrice ? { pricePerUnit: { gte: parseInt(minPrice) } } : {}),
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    // Filter out buyers with no matching offers
    const filtered = crop
      ? buyers.filter((b: any) => b.offers.length > 0)
      : buyers;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json({ error: "Failed to fetch buyers" }, { status: 500 });
  }
}
