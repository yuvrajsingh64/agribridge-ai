"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ArrowRight, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  crop: string;
  quantity: number;
  buyer: { id: string; name: string };
  grossAmount: number;
  status: "PENDING" | "PAYMENT_REQUESTED" | "PAYMENT_CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const farmerId = "demo-farmer-ramesh";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?farmerId=${farmerId}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "PAYMENT_REQUESTED": return <Badge className="bg-blue-500 hover:bg-blue-600">Payment Req.</Badge>;
      case "PAYMENT_CONFIRMED": return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case "COMPLETED": return <Badge className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
      case "CANCELLED": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground">Track and manage your sales</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center bg-muted/50">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No Orders Yet</CardTitle>
          <CardDescription>
            You don't have any active orders. Match with buyers to start selling.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{order.crop}</span>
                      <span className="text-muted-foreground text-sm">#{order.orderNumber}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium text-foreground">{order.buyer?.name}</span>
                      <span>•</span>
                      <span>{order.quantity} qtl</span>
                      <span>•</span>
                      <span className="flex items-center"><Calendar className="h-3 w-3 mr-1"/> {format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(order.grossAmount)}</div>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
