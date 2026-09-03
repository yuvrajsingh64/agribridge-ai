import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProduceSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");

    if (!farmerId) {
      return NextResponse.json({ error: "farmerId is required" }, { status: 400 });
    }

    const produceListings = await prisma.produceListing.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(produceListings);
  } catch (error) {
    console.error("Error fetching produce:", error);
    return NextResponse.json({ error: "Failed to fetch produce" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmerId, ...rest } = body;

    if (!farmerId) {
      return NextResponse.json({ error: "farmerId is required" }, { status: 400 });
    }

    const validated = createProduceSchema.parse(rest);

    const produceListing = await prisma.produceListing.create({
      data: {
        farmerId,
        crop: validated.crop,
        variety: validated.variety,
        quantity: validated.quantity,
        unit: validated.unit,
        qualityGrade: validated.qualityGrade,
        location: validated.location,
        district: validated.district,
        state: validated.state,
        harvestDate: validated.harvestDate ? new Date(validated.harvestDate) : null,
        minimumPrice: validated.minimumPrice,
        expectedPrice: validated.expectedPrice,
        sellingDeadline: validated.sellingDeadline ? new Date(validated.sellingDeadline) : null,
        notes: validated.notes,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(produceListing, { status: 201 });
  } catch (error: any) {
    console.error("Error creating produce:", error);
    if (error?.issues) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create produce" }, { status: 500 });
  }
}
