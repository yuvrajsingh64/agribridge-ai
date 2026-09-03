import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");
    const status = searchParams.get("status");

    if (!farmerId) {
      return NextResponse.json({ error: "farmerId is required" }, { status: 400 });
    }

    const where: any = {
      order: { farmerId },
    };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        order: {
          include: { buyer: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
