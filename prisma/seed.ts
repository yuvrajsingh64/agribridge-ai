import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AgriBridge AI database...\n");

  // ─── Clean existing data ──────────────────────────────────
  await prisma.aIAction.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.buyerMatch.deleteMany();
  await prisma.buyerOffer.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleaned existing data\n");

  // ─── Create Demo Farmer ───────────────────────────────────
  const farmer = await prisma.user.create({
    data: {
      id: "demo-farmer-ramesh",
      name: "Ramesh Kumar",
      email: "ramesh@agribridge.demo",
      phone: "+919876543210",
      role: "FARMER",
      farmerProfile: {
        create: {
          id: "demo-profile-ramesh",
          village: "Ashta Road",
          district: "Sehore",
          state: "Madhya Pradesh",
          farmSizeAcres: 5,
          preferredLanguage: "hi",
        },
      },
    },
  });
  console.log(`👨‍🌾 Created farmer: ${farmer.name}`);

  // ─── Create Produce Listings ──────────────────────────────
  const now = new Date();
  const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  
  const wheatListing = await prisma.produceListing.create({
    data: {
      id: "demo-produce-wheat",
      farmerId: farmer.id,
      crop: "Wheat",
      variety: "Sharbati",
      quantity: 80,
      unit: "quintal",
      qualityGrade: "Grade A",
      location: "Ashta Road, Sehore",
      district: "Sehore",
      state: "Madhya Pradesh",
      harvestDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      minimumPrice: 2300,
      expectedPrice: 2400,
      sellingDeadline: tenDaysLater,
      status: "ACTIVE",
      notes: "Fresh harvest, properly dried, moisture content below 12%",
    },
  });
  console.log(`🌾 Created produce: ${wheatListing.crop} - ${wheatListing.quantity} quintals`);

  // Historical produce listings
  const soyListing = await prisma.produceListing.create({
    data: {
      id: "demo-produce-soybean",
      farmerId: farmer.id,
      crop: "Soybean",
      variety: "JS-335",
      quantity: 40,
      unit: "quintal",
      qualityGrade: "Grade A",
      location: "Ashta Road, Sehore",
      district: "Sehore",
      state: "Madhya Pradesh",
      harvestDate: new Date("2026-03-15"),
      minimumPrice: 4200,
      expectedPrice: 4500,
      sellingDeadline: new Date("2026-04-01"),
      status: "SOLD",
    },
  });

  const riceListing = await prisma.produceListing.create({
    data: {
      id: "demo-produce-rice",
      farmerId: farmer.id,
      crop: "Rice",
      variety: "Basmati",
      quantity: 30,
      unit: "quintal",
      qualityGrade: "Grade A",
      location: "Ashta Road, Sehore",
      district: "Sehore",
      state: "Madhya Pradesh",
      harvestDate: new Date("2026-06-20"),
      minimumPrice: 3500,
      expectedPrice: 3800,
      sellingDeadline: new Date("2026-07-10"),
      status: "SOLD",
    },
  });

  const chickpeaListing = await prisma.produceListing.create({
    data: {
      id: "demo-produce-chickpea",
      farmerId: farmer.id,
      crop: "Chickpea",
      variety: "Desi",
      quantity: 25,
      unit: "quintal",
      qualityGrade: "Grade B",
      location: "Ashta Road, Sehore",
      district: "Sehore",
      state: "Madhya Pradesh",
      harvestDate: new Date("2026-01-10"),
      minimumPrice: 5000,
      expectedPrice: 5200,
      sellingDeadline: new Date("2026-02-01"),
      status: "SOLD",
    },
  });

  console.log("🌾 Created historical produce listings\n");

  // ─── Create 8 Buyers ──────────────────────────────────────
  const buyers = await Promise.all([
    prisma.buyer.create({
      data: {
        id: "buyer-shakti",
        name: "Shakti Foods Pvt Ltd",
        contactPerson: "Rajesh Agarwal",
        phone: "+919845012345",
        email: "procurement@shaktifoods.demo",
        location: "MIDC Industrial Area, Indore",
        district: "Indore",
        state: "Madhya Pradesh",
        rating: 4.7,
        verified: true,
        paymentWindowHours: 24,
        description: "Leading grain processing company in Central India. ISO certified, exports to 12 countries.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-central",
        name: "Central Grain Traders",
        contactPerson: "Vikram Sharma",
        phone: "+919845023456",
        email: "buy@centralgrains.demo",
        location: "Karond Market, Bhopal",
        district: "Bhopal",
        state: "Madhya Pradesh",
        rating: 4.3,
        verified: true,
        paymentWindowHours: 48,
        description: "Wholesale grain traders operating in MP since 1985.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-bharat",
        name: "Bharat Agro Processing",
        contactPerson: "Sunil Patel",
        phone: "+919845034567",
        email: "purchase@bharatagro.demo",
        location: "Industrial Estate, Ujjain",
        district: "Ujjain",
        state: "Madhya Pradesh",
        rating: 4.1,
        verified: true,
        paymentWindowHours: 72,
        description: "Large-scale agricultural processing plant with modern storage facilities.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-malwa",
        name: "Malwa Foods",
        contactPerson: "Priya Joshi",
        phone: "+919845045678",
        email: "sourcing@malwafoods.demo",
        location: "Dewas Road, Dewas",
        district: "Dewas",
        state: "Madhya Pradesh",
        rating: 4.5,
        verified: true,
        paymentWindowHours: 24,
        description: "Premium flour manufacturer known for quality wheat procurement.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-kisanfresh",
        name: "KisanFresh Procurement",
        contactPerson: "Amit Verma",
        phone: "+919845056789",
        email: "buy@kisanfresh.demo",
        location: "Mandideep Industrial Area",
        district: "Raisen",
        state: "Madhya Pradesh",
        rating: 4.4,
        verified: true,
        paymentWindowHours: 48,
        description: "Farm-to-factory procurement network with transparent pricing.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-mpgrain",
        name: "MP Grain Network",
        contactPerson: "Sanjay Mishra",
        phone: "+919845067890",
        email: "ops@mpgrain.demo",
        location: "Grain Mandi, Vidisha",
        district: "Vidisha",
        state: "Madhya Pradesh",
        rating: 3.9,
        verified: false,
        paymentWindowHours: 72,
        description: "Regional grain trading network covering central MP.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-sunrise",
        name: "Sunrise Agro Industries",
        contactPerson: "Kavita Singh",
        phone: "+919845078901",
        email: "purchase@sunriseagro.demo",
        location: "Pipariya Industrial Zone",
        district: "Hoshangabad",
        state: "Madhya Pradesh",
        rating: 4.6,
        verified: true,
        paymentWindowHours: 24,
        description: "Modern agro-processing unit with direct farmer partnerships.",
      },
    }),
    prisma.buyer.create({
      data: {
        id: "buyer-ruralharvest",
        name: "Rural Harvest Foods",
        contactPerson: "Deepak Tiwari",
        phone: "+919845089012",
        email: "procurement@ruralharvest.demo",
        location: "Sagar Road, Sagar",
        district: "Sagar",
        state: "Madhya Pradesh",
        rating: 3.8,
        verified: false,
        paymentWindowHours: 96,
        description: "Community-based procurement cooperative.",
      },
    }),
  ]);
  console.log(`🏪 Created ${buyers.length} buyers\n`);

  // ─── Create Buyer Offers ──────────────────────────────────
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const offers = await Promise.all([
    // Shakti Foods - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-shakti",
        crop: "Wheat",
        pricePerUnit: 2420,
        minimumQuantity: 50,
        maximumQuantity: 150,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Central Grain - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-central",
        crop: "Wheat",
        pricePerUnit: 2380,
        minimumQuantity: 30,
        maximumQuantity: 100,
        qualityRequirements: "Grade A/B",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Bharat Agro - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-bharat",
        crop: "Wheat",
        pricePerUnit: 2350,
        minimumQuantity: 50,
        maximumQuantity: 200,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Malwa Foods - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-malwa",
        crop: "Wheat",
        pricePerUnit: 2400,
        minimumQuantity: 20,
        maximumQuantity: 100,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // KisanFresh - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-kisanfresh",
        crop: "Wheat",
        pricePerUnit: 2390,
        minimumQuantity: 25,
        maximumQuantity: 80,
        qualityRequirements: "Grade A/B",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // MP Grain Network - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-mpgrain",
        crop: "Wheat",
        pricePerUnit: 2360,
        minimumQuantity: 40,
        maximumQuantity: 120,
        qualityRequirements: "Grade A/B",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Sunrise Agro - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-sunrise",
        crop: "Wheat",
        pricePerUnit: 2410,
        minimumQuantity: 30,
        maximumQuantity: 80,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Rural Harvest - Wheat
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-ruralharvest",
        crop: "Wheat",
        pricePerUnit: 2330,
        minimumQuantity: 10,
        maximumQuantity: 60,
        qualityRequirements: "Grade A/B/C",
        validUntil,
        status: "ACTIVE",
      },
    }),
    // Additional crop offers
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-shakti",
        crop: "Soybean",
        pricePerUnit: 4500,
        minimumQuantity: 20,
        maximumQuantity: 100,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-central",
        crop: "Rice",
        pricePerUnit: 3700,
        minimumQuantity: 20,
        maximumQuantity: 80,
        qualityRequirements: "Grade A",
        validUntil,
        status: "ACTIVE",
      },
    }),
    prisma.buyerOffer.create({
      data: {
        buyerId: "buyer-malwa",
        crop: "Chickpea",
        pricePerUnit: 5100,
        minimumQuantity: 10,
        maximumQuantity: 50,
        qualityRequirements: "Grade A/B",
        validUntil,
        status: "ACTIVE",
      },
    }),
  ]);
  console.log(`📋 Created ${offers.length} buyer offers\n`);

  // ─── Create Historical Orders ─────────────────────────────
  const historicalOrders = await Promise.all([
    prisma.order.create({
      data: {
        id: "demo-order-soy",
        orderNumber: "AGB-2026-0042",
        farmerId: farmer.id,
        buyerId: "buyer-shakti",
        produceListingId: soyListing.id,
        crop: "Soybean",
        quantity: 40,
        pricePerUnit: 4500,
        grossAmount: 180000,
        status: "COMPLETED",
        createdAt: new Date("2026-03-20"),
      },
    }),
    prisma.order.create({
      data: {
        id: "demo-order-rice",
        orderNumber: "AGB-2026-0067",
        farmerId: farmer.id,
        buyerId: "buyer-central",
        produceListingId: riceListing.id,
        crop: "Rice",
        quantity: 30,
        pricePerUnit: 3700,
        grossAmount: 111000,
        status: "COMPLETED",
        createdAt: new Date("2026-06-25"),
      },
    }),
    prisma.order.create({
      data: {
        id: "demo-order-chick",
        orderNumber: "AGB-2026-0023",
        farmerId: farmer.id,
        buyerId: "buyer-malwa",
        produceListingId: chickpeaListing.id,
        crop: "Chickpea",
        quantity: 25,
        pricePerUnit: 5100,
        grossAmount: 127500,
        status: "COMPLETED",
        createdAt: new Date("2026-01-18"),
      },
    }),
  ]);
  console.log(`📦 Created ${historicalOrders.length} historical orders`);

  // ─── Create Historical Payments & Transactions ────────────
  for (const order of historicalOrders) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayPaymentId: `pay_demo_${order.id.slice(-6)}`,
        razorpayPaymentLinkId: `plink_demo_${order.id.slice(-6)}`,
        amount: order.grossAmount * 100, // paise
        currency: "INR",
        status: "PAID",
        referenceId: `AGB-ORD-${order.orderNumber.replace("AGB-", "")}`,
      },
    });

    await prisma.transaction.create({
      data: {
        orderId: order.id,
        transactionId: `rzp_test_${Math.random().toString(36).slice(2, 10)}`,
        amount: order.grossAmount,
        paymentMethod: "Razorpay",
        status: "PAID",
        completedAt: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("💳 Created historical payments & transactions\n");

  // ─── Create Notifications ─────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: farmer.id,
        title: "Welcome to AgriBridge AI",
        message: "Your account has been set up. Start by listing your produce!",
        type: "INFO",
        read: true,
        createdAt: new Date("2026-01-01"),
      },
      {
        userId: farmer.id,
        title: "New buyer matches available",
        message: "AI found 8 buyer matches for your Wheat listing. Check recommendations now.",
        type: "INFO",
        read: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: farmer.id,
        title: "Soybean order completed",
        message: "Your order AGB-2026-0042 with Shakti Foods has been completed. ₹1,80,000 received.",
        type: "SUCCESS",
        read: true,
        createdAt: new Date("2026-03-21"),
      },
      {
        userId: farmer.id,
        title: "Rice payment received",
        message: "Payment of ₹1,11,000 received for Rice order AGB-2026-0067.",
        type: "PAYMENT",
        read: true,
        createdAt: new Date("2026-06-26"),
      },
      {
        userId: farmer.id,
        title: "High demand for Wheat",
        message: "Wheat prices in your region have increased by 3% this week. Good time to sell!",
        type: "INFO",
        read: false,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ],
  });
  console.log("🔔 Created notifications\n");

  // ─── Create AI Actions (Decision Log) ─────────────────────
  await prisma.aIAction.createMany({
    data: [
      {
        actionType: "MATCH_BUYERS",
        description: "Matched 8 buyers against Wheat listing (80 quintals, Grade A)",
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
      {
        actionType: "FILTER_BUYERS",
        description: "Filtered 3 top buyers based on Grade A quality requirement",
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 59 * 60 * 1000),
      },
      {
        actionType: "RANK_BUYERS",
        description: "Ranked buyers by price, quantity compatibility, payment speed, and distance",
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 58 * 60 * 1000),
      },
      {
        actionType: "RECOMMEND",
        description: "Recommended Shakti Foods Pvt Ltd — Score: 95/100, ₹2,420/qtl, 24hr payment",
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 57 * 60 * 1000),
      },
      {
        actionType: "ANALYZE_MARKET",
        description: "Analyzed MP wheat market: Average price ₹2,380/qtl, your offer is 1.7% above average",
        status: "COMPLETED",
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ],
  });
  console.log("🤖 Created AI activity log\n");

  console.log("──────────────────────────────────────────");
  console.log("✅ Seeding complete!");
  console.log("──────────────────────────────────────────");
  console.log(`\n  Farmer: ${farmer.name} (${farmer.email})`);
  console.log(`  Produce: 4 listings (1 active, 3 historical)`);
  console.log(`  Buyers: ${buyers.length}`);
  console.log(`  Offers: ${offers.length}`);
  console.log(`  Orders: ${historicalOrders.length} historical`);
  console.log(`  Notifications: 5`);
  console.log(`  AI Actions: 5`);
  console.log(`\n  Demo farmer ID: ${farmer.id}`);
  console.log("──────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
