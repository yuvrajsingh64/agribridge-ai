import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchBuyers, type BuyerOfferInput } from "@/lib/matching";
import { calculateGrossRevenue, calculateTransactionCost, formatINR } from "@/lib/financial";

// ─── Intent Detection ─────────────────────────────────────────

function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  
  // Hindi/Hinglish patterns
  if (msg.match(/(best|top|sabse|sahi|accha).*buyer/) || msg.match(/buyer.*(kaun|kon|who)/)) return "find_best_buyer";
  if (msg.match(/(compare|tulna|difference|fark)/)) return "compare_buyers";
  if (msg.match(/(revenue|earn|kamai|kamau|kitna.*mil|how much.*get|total.*amount)/)) return "calculate_revenue";
  if (msg.match(/(why|kyu|reason|explain|samjha)/)) return "explain_recommendation";
  if (msg.match(/(fast|quick|jaldi|speed|24.*hour|payment.*time|payment.*speed)/)) return "fastest_payment";
  if (msg.match(/(price|highest|zyada|maximum|max)/)) return "highest_price";
  if (msg.match(/(accept|maan|le lu|choose|select|karna chahiye)/)) return "should_accept";
  if (msg.match(/(50|partial|kuch|half|aadha).*quintal/)) return "partial_quantity";
  if (msg.match(/(reject|nahi|decline|what.*if.*no)/)) return "reject_offer";
  if (msg.match(/(find|dhundh|search|buyer|sell|bech)/)) return "find_best_buyer";
  
  return "general_question";
}

// ─── Response Generator ───────────────────────────────────────

async function generateResponse(
  intent: string,
  message: string,
  farmerId: string
) {
  // Load farmer context
  const produce = await prisma.produceListing.findMany({
    where: { farmerId, status: "ACTIVE" },
  });

  if (produce.length === 0 && intent !== "general_question") {
    return {
      content: "Aapke paas abhi koi active produce listing nahi hai. Pehle apni fasal ki details add karein, phir main buyers dhundhne mein madad karunga.",
      structuredData: null,
    };
  }

  const listing = produce[0];

  // Load matching buyer offers
  const buyerOffers = listing ? await prisma.buyerOffer.findMany({
    where: {
      crop: listing.crop,
      status: "ACTIVE",
    },
    include: { buyer: true },
  }) : [];

  // Transform to matching input
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

  // Run matching
  const matches = listing ? matchBuyers(
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
  ) : [];

  switch (intent) {
    case "find_best_buyer": {
      if (matches.length === 0) {
        return {
          content: `Abhi aapke ${listing?.crop || "produce"} ke liye koi matching buyer nahi mila. Jaldi hi naye buyers add honge.`,
          structuredData: null,
        };
      }
      const best = matches[0];
      const txCost = calculateTransactionCost(best.grossRevenue);
      const netRevenue = best.grossRevenue - txCost;

      return {
        content: `## 🏆 Best Match: ${best.buyerName}\n\n**₹${best.pricePerUnit.toLocaleString("en-IN")}/quintal** · ${listing!.quantity} quintals · Match Score: **${best.matchScore}/100**\n\n**Expected Revenue:** ${formatINR(best.grossRevenue)}\n**Estimated Net:** ${formatINR(netRevenue)} (after ~1% platform fee)\n**Payment:** Within ${best.paymentWindowHours} hours\n\n### Why this buyer:\n${best.reasons.map((r) => `• ${r}`).join("\n")}\n\n${matches.length > 1 ? `\n📊 ${matches.length - 1} other buyers also match. Compare them for the full picture.` : ""}`,
        structuredData: {
          type: "recommendation",
          data: {
            buyerId: best.buyerId,
            buyerName: best.buyerName,
            pricePerUnit: best.pricePerUnit,
            quantity: listing!.quantity,
            grossRevenue: best.grossRevenue,
            netRevenue,
            txCost,
            matchScore: best.matchScore,
            paymentHours: best.paymentWindowHours,
            reasons: best.reasons,
            produceListingId: listing!.id,
          },
        },
      };
    }

    case "compare_buyers": {
      const top3 = matches.slice(0, 3);
      if (top3.length === 0) {
        return { content: "Koi matching buyer nahi mila comparison ke liye.", structuredData: null };
      }

      const comparison = top3.map((m) => ({
        buyerId: m.buyerId,
        buyerName: m.buyerName,
        pricePerUnit: m.pricePerUnit,
        quantity: Math.min(listing!.quantity, m.maximumQuantity),
        grossRevenue: m.grossRevenue,
        matchScore: m.matchScore,
        paymentHours: m.paymentWindowHours,
        qualityRequirements: m.qualityRequirements,
        buyerLocation: m.buyerLocation,
      }));

      let content = `## 📊 Top ${top3.length} Buyer Comparison\n\n`;
      content += `| | ${top3.map((m) => `**${m.buyerName}**`).join(" | ")} |\n`;
      content += `|---|${top3.map(() => "---").join("|")}|\n`;
      content += `| Price/qtl | ${top3.map((m) => `₹${m.pricePerUnit.toLocaleString("en-IN")}`).join(" | ")} |\n`;
      content += `| Revenue | ${top3.map((m) => formatINR(m.grossRevenue)).join(" | ")} |\n`;
      content += `| Payment | ${top3.map((m) => `${m.paymentWindowHours}hrs`).join(" | ")} |\n`;
      content += `| Score | ${top3.map((m) => `${m.matchScore}/100`).join(" | ")} |\n`;
      content += `\n**AI Recommendation: ${top3[0].buyerName}** (highest match score)`;

      return {
        content,
        structuredData: { type: "comparison", data: comparison },
      };
    }

    case "calculate_revenue":
    case "highest_price": {
      if (matches.length === 0) {
        return { content: "Matching buyers nahi mile revenue calculate karne ke liye.", structuredData: null };
      }
      const best = matches[0];
      const gross = best.grossRevenue;
      const txCost = calculateTransactionCost(gross);
      const net = gross - txCost;

      return {
        content: `## 💰 Revenue Calculation\n\n**${listing!.crop}:** ${listing!.quantity} quintals × ₹${best.pricePerUnit.toLocaleString("en-IN")}/qtl\n\n| | Amount |\n|---|---|\n| Gross Revenue | ${formatINR(gross)} |\n| Platform Fee (~1%) | ${formatINR(txCost)} |\n| **Net Revenue** | **${formatINR(net)}** |\n\nBuyer: **${best.buyerName}** · Payment within ${best.paymentWindowHours} hours`,
        structuredData: {
          type: "revenue",
          data: { gross, txCost, net, buyerName: best.buyerName, pricePerUnit: best.pricePerUnit },
        },
      };
    }

    case "fastest_payment": {
      const sorted = [...matches].sort((a, b) => a.paymentWindowHours - b.paymentWindowHours);
      const fastest = sorted[0];
      if (!fastest) {
        return { content: "Koi matching buyer nahi mila.", structuredData: null };
      }
      return {
        content: `## ⚡ Fastest Payment Buyer\n\n**${fastest.buyerName}** pays within **${fastest.paymentWindowHours} hours**\n\nOffer: ₹${fastest.pricePerUnit.toLocaleString("en-IN")}/qtl\nRevenue: ${formatINR(fastest.grossRevenue)}\nMatch Score: ${fastest.matchScore}/100`,
        structuredData: {
          type: "recommendation",
          data: {
            buyerId: fastest.buyerId,
            buyerName: fastest.buyerName,
            pricePerUnit: fastest.pricePerUnit,
            quantity: listing!.quantity,
            grossRevenue: fastest.grossRevenue,
            matchScore: fastest.matchScore,
            paymentHours: fastest.paymentWindowHours,
            reasons: fastest.reasons,
            produceListingId: listing!.id,
          },
        },
      };
    }

    case "should_accept": {
      if (matches.length === 0) {
        return { content: "Pehle buyer matches dhundhte hain.", structuredData: null };
      }
      const best = matches[0];
      const aboveMin = best.pricePerUnit - listing!.minimumPrice;
      const percentAbove = ((aboveMin / listing!.minimumPrice) * 100).toFixed(1);

      return {
        content: `## ✅ Should You Accept?\n\n${best.buyerName} ka offer ₹${best.pricePerUnit.toLocaleString("en-IN")}/qtl hai, jo aapki minimum price (₹${listing!.minimumPrice.toLocaleString("en-IN")}) se **${percentAbove}% zyada** hai.\n\n**Mere analysis mein:** Haan, yeh offer accept karna sahi hoga kyunki:\n${best.reasons.map((r) => `• ${r}`).join("\n")}\n\nMatch Score: **${best.matchScore}/100**\n\nAgar aap agree hain, toh "Accept Recommendation" click karein.`,
        structuredData: {
          type: "recommendation",
          data: {
            buyerId: best.buyerId,
            buyerName: best.buyerName,
            pricePerUnit: best.pricePerUnit,
            quantity: listing!.quantity,
            grossRevenue: best.grossRevenue,
            matchScore: best.matchScore,
            paymentHours: best.paymentWindowHours,
            reasons: best.reasons,
            produceListingId: listing!.id,
          },
        },
      };
    }

    case "explain_recommendation": {
      if (matches.length === 0) {
        return { content: "Pehle buyer recommendation generate karna padega.", structuredData: null };
      }
      const best = matches[0];
      return {
        content: `## 🧠 AI Reasoning\n\nMain ${matches.length} buyers ko score karta hoon in factors ke basis pe:\n\n| Factor | Weight | ${best.buyerName} Score |\n|---|---|---|\n| Price | 40% | ${best.priceScore}/100 |\n| Quantity Match | 20% | ${best.quantityScore}/100 |\n| Quality Match | 15% | ${best.qualityScore}/100 |\n| Payment Speed | 10% | ${best.paymentScore}/100 |\n| Distance | 10% | ${best.distanceScore}/100 |\n| Deadline | 5% | ${best.deadlineScore}/100 |\n| **Overall** | **100%** | **${best.matchScore}/100** |\n\n**AgriBridge Match Score** — Yeh score buyer ki suitability dikhata hai aapki specific requirements ke liye.`,
        structuredData: null,
      };
    }

    case "partial_quantity": {
      const quantity = 50;
      if (matches.length === 0) {
        return { content: "Koi matching buyer nahi mila.", structuredData: null };
      }
      const best = matches[0];
      const partialRevenue = calculateGrossRevenue(quantity, best.pricePerUnit);
      return {
        content: `## 📦 Partial Quantity (${quantity} quintals)\n\nAgar aap sirf ${quantity} quintals bechte hain ${best.buyerName} ko:\n\n| | Amount |\n|---|---|\n| Quantity | ${quantity} quintals |\n| Price | ₹${best.pricePerUnit.toLocaleString("en-IN")}/qtl |\n| Revenue | ${formatINR(partialRevenue)} |\n\nBaaki ${listing!.quantity - quantity} quintals ke liye doosre buyer dhundhe ja sakte hain.`,
        structuredData: null,
      };
    }

    case "reject_offer": {
      if (matches.length <= 1) {
        return {
          content: "Agar best offer reject karte hain, toh alternatives limited hain. Main suggest karunga ki offer accept karein.",
          structuredData: null,
        };
      }
      const next = matches[1];
      return {
        content: `## 🔄 Next Best Option\n\nAgar top offer reject karte hain, next best buyer hai:\n\n**${next.buyerName}**\n₹${next.pricePerUnit.toLocaleString("en-IN")}/qtl · Revenue: ${formatINR(next.grossRevenue)} · Score: ${next.matchScore}/100\n\nDifference from best: ₹${((matches[0].pricePerUnit - next.pricePerUnit) * listing!.quantity).toLocaleString("en-IN")} kam milega.`,
        structuredData: null,
      };
    }

    default:
      return {
        content: `Namaste! 🙏 Main AgriBridge AI hoon.\n\nMain aapki help kar sakta hoon:\n• **Best buyer** dhundhne mein\n• **Buyers compare** karne mein\n• **Revenue calculate** karne mein\n• **Payment speed** check karne mein\n\nAap Hindi ya English mein pooch sakte hain!\n\nExample: "Mere wheat ke liye best buyer kaun hai?"`,
        structuredData: null,
      };
  }
}

// ─── API Handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, farmerId } = body;

    if (!message || !farmerId) {
      return NextResponse.json(
        { error: "message and farmerId are required" },
        { status: 400 }
      );
    }

    // Create or load conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: farmerId,
          title: message.slice(0, 50),
        },
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Detect intent and generate response
    const intent = detectIntent(message);
    const response = await generateResponse(intent, message, farmerId);

    // Save assistant message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: response.content,
        structuredData: response.structuredData ? JSON.stringify(response.structuredData) : null,
      },
    });

    // Log AI action
    await prisma.aIAction.create({
      data: {
        conversationId: conversation.id,
        actionType: intent.toUpperCase(),
        description: `Processed: "${message.slice(0, 80)}" → Intent: ${intent}`,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: response.content,
      structuredData: response.structuredData,
      intent,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI processing failed. Please try again." },
      { status: 500 }
    );
  }
}
