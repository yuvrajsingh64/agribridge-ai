"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, CheckCircle2, Circle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderDetail {
  id: string;
  orderNumber: string;
  farmerId: string;
  buyer: { id: string; name: string; location: string };
  crop: string;
  quantity: number;
  pricePerUnit: number;
  grossAmount: number;
  status: "PENDING" | "PAYMENT_REQUESTED" | "PAYMENT_CONFIRMED" | "DISPATCHED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
  payment?: { id: string; status: string; razorpayShortUrl?: string; amount: number };
  createdAt: string;
}

const STEPS = [
  { status: "PENDING", label: "Buyer Selected" },
  { status: "PAYMENT_REQUESTED", label: "Payment Requested" },
  { status: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { status: "DISPATCHED", label: "Dispatched" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "COMPLETED", label: "Completed" },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleCreatePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming we update local state or re-fetch
        setOrder({ ...order!, payment: data.payment, status: "PAYMENT_REQUESTED" });
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/orders')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground">{order.crop} - {order.quantity} qtl</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer</span>
                <span className="font-medium">{order.buyer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{order.quantity} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Quintal</span>
                <span className="font-medium">{formatCurrency(order.pricePerUnit)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span>{formatCurrency(order.grossAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription className="flex items-center text-yellow-600 bg-yellow-50 p-2 rounded-md mt-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                Razorpay Test Mode — No real money will be charged.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.status === "PENDING" && !order.payment ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">Payment has not been requested yet.</p>
                  <Button onClick={handleCreatePayment} disabled={isProcessingPayment}>
                    {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Razorpay Payment
                  </Button>
                </div>
              ) : order.status === "PAYMENT_REQUESTED" || (order.payment && order.payment.status !== "PAID") ? (
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <p className="font-medium">Payment Pending</p>
                    <p className="text-sm text-muted-foreground">Amount: {formatCurrency(order.grossAmount)}</p>
                  </div>
                  {order.payment?.razorpayShortUrl ? (
                    <Button asChild>
                      <a href={order.payment.razorpayShortUrl} target="_blank" rel="noreferrer">
                        Pay Now <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button disabled variant="outline">Demo Mode — No Payment Link</Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Payment Successful</p>
                    <p className="text-sm">Payment ID: {order.payment?.id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 border-l-2 border-muted ml-3">
                {STEPS.map((step, index) => {
                  const isCompleted = currentStepIndex >= index || order.status === "COMPLETED";
                  const isCurrent = currentStepIndex === index && order.status !== "COMPLETED";
                  
                  return (
                    <div key={step.status} className="relative">
                      <div className={`absolute -left-[35px] bg-background ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isCompleted ? <CheckCircle2 className="h-6 w-6 fill-primary/10" /> : <Circle className="h-6 w-6" />}
                      </div>
                      <div className={`${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'} ${isCurrent ? 'font-bold text-primary' : ''}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
