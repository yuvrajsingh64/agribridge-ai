"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wheat,
  TrendingUp,
  IndianRupee,
  Clock,
  Package,
  Brain,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardData {
  totalProduce: number;
  activeCrop: string;
  bestOffer: number;
  expectedRevenue: number;
  pendingPayment: number;
  activeOrders: number;
  aiScore: number;
  recommendation: {
    buyerName: string;
    pricePerUnit: number;
    quantity: number;
    grossRevenue: number;
    matchScore: number;
    paymentHours: number;
    reasons: string[];
    buyerCount: number;
  } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard?farmerId=demo-farmer-ramesh");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Use fallback data if API fails
        setData(getFallbackData());
      }
    } catch {
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  }

  function getFallbackData(): DashboardData {
    return {
      totalProduce: 80,
      activeCrop: "Wheat",
      bestOffer: 2420,
      expectedRevenue: 193600,
      pendingPayment: 0,
      activeOrders: 0,
      aiScore: 87,
      recommendation: {
        buyerName: "Shakti Foods Pvt Ltd",
        pricePerUnit: 2420,
        quantity: 80,
        grossRevenue: 193600,
        matchScore: 95,
        paymentHours: 24,
        buyerCount: 8,
        reasons: [
          "Highest price among matching buyers",
          "Accepts your full quantity",
          "Requires Grade A wheat",
          "Delivery window matches your 10-day requirement",
        ],
      },
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }

  const d = data || getFallbackData();

  const metrics = [
    {
      title: "Available Produce",
      value: `${d.totalProduce} quintals`,
      sub: d.activeCrop,
      icon: Wheat,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      title: "Best Current Offer",
      value: `₹${d.bestOffer.toLocaleString("en-IN")}/qtl`,
      sub: "Active marketplace",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Expected Revenue",
      value: `₹${d.expectedRevenue.toLocaleString("en-IN")}`,
      sub: "Based on best offer",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Payment",
      value: `₹${d.pendingPayment.toLocaleString("en-IN")}`,
      sub: "Awaiting confirmation",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active Orders",
      value: d.activeOrders.toString(),
      sub: "In progress",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "AI Opportunity Score",
      value: `${d.aiScore}/100`,
      sub: "Market conditions",
      icon: Brain,
      color: "text-green-700",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Ramesh 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s your farm commerce overview
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{m.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {m.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${m.bg}`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendation */}
      {d.recommendation && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-700" />
              <CardTitle className="text-lg text-green-900">
                AI Recommendation
              </CardTitle>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 text-xs">
                {d.recommendation.buyerCount} buyers matched
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl border border-green-100 p-5">
              <p className="text-gray-600 mb-4">
                Your wheat has{" "}
                <strong>{d.recommendation.buyerCount} strong buyer matches</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Recommended Buyer</p>
                  <p className="text-lg font-bold text-gray-900">
                    {d.recommendation.buyerName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Offer</p>
                    <p className="font-bold text-green-700">
                      ₹{d.recommendation.pricePerUnit.toLocaleString("en-IN")}/qtl
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Match Score</p>
                    <p className="font-bold text-green-700">
                      {d.recommendation.matchScore}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {d.recommendation.quantity} quintals
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Expected Revenue</p>
                  <p className="font-semibold text-green-700">
                    ₹{d.recommendation.grossRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Payment</p>
                  <p className="font-semibold text-gray-900">
                    Within {d.recommendation.paymentHours} hrs
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Why this buyer:</p>
                <ul className="space-y-1">
                  {d.recommendation.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agent" className="flex-1">
                  <Button className="w-full bg-green-700 hover:bg-green-800">
                    <Brain className="h-4 w-4 mr-2" />
                    Ask AI Agent
                  </Button>
                </Link>
                <Link href="/buyers" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View All Buyers
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/produce">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <Wheat className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Produce</p>
                <p className="text-sm text-gray-500">Manage listings</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Orders</p>
                <p className="text-sm text-gray-500">Track orders</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/transactions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <IndianRupee className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Transactions</p>
                <p className="text-sm text-gray-500">Payment history</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Demo Label */}
      <p className="text-xs text-gray-400 text-center">
        Demo marketplace data — AgriBridge AI Hackathon MVP
      </p>
    </div>
  );
}
