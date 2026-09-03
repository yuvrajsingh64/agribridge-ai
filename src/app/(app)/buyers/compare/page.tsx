"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ChevronLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BuyerMatch {
  buyerId: string;
  name: string;
  score: number;
  pricePerUnit: number;
  quantityAccepted: string;
  grossRevenue: number;
  paymentSpeed: string;
  qualityRequirement: string;
  isRecommended: boolean;
}

export default function CompareBuyersPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/buyers/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produceListingId: 'demo-produce-wheat' }),
        });
        
        if (res.ok) {
          const data = await res.json();
          const matchData = Array.isArray(data) ? data : (data.matches || []);
          
          const mappedMatches: BuyerMatch[] = matchData.slice(0, 3).map((m: any, index: number) => ({
            buyerId: m.buyerId,
            name: m.buyerName || m.name,
            score: m.matchScore || m.score,
            pricePerUnit: m.pricePerUnit,
            quantityAccepted: `${m.minimumQuantity || 0} - ${m.maximumQuantity || 0} qtl`,
            grossRevenue: m.grossRevenue || 0,
            paymentSpeed: m.paymentWindowHours ? `Within ${m.paymentWindowHours}h` : 'Unknown',
            qualityRequirement: m.qualityRequirements || 'Any',
            isRecommended: index === 0
          }));
          
          setMatches(mappedMatches);
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparison();
  }, []);

  const handleChooseBuyer = async (buyerId: string) => {
    setIsOrdering(buyerId);
    try {
      const match = matches.find(m => m.buyerId === buyerId);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          produceListingId: 'demo-produce-wheat',
          farmerId: 'demo-farmer-ramesh',
          quantity: 80, // Using the demo listing quantity
          pricePerUnit: match?.pricePerUnit || 2400
        }),
      });
      
      if (res.ok) {
        router.push('/orders');
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsOrdering(null);
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

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare Buyers</h1>
          <p className="text-muted-foreground">Top AI-matched buyers for your Wheat listing</p>
        </div>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.buyerId} className={`relative flex flex-col ${match.isRecommended ? 'border-primary shadow-md' : ''}`}>
              {match.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                  <Award className="w-3 h-3 mr-1" /> AI Recommended
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle>{match.name}</CardTitle>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary text-lg px-3 py-1">
                    {match.score}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price offered</p>
                  <p className="text-xl font-bold">{formatCurrency(match.pricePerUnit)}<span className="text-sm font-normal text-muted-foreground">/qtl</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(match.grossRevenue)}</p>
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Quantity accepted</p>
                  <p className="font-medium">{match.quantityAccepted}</p>
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Payment Speed</p>
                  <p className="font-medium flex items-center">
                    {match.paymentSpeed}
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Quality Required</p>
                  <p className="font-medium">{match.qualityRequirement}</p>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button 
                  className="w-full" 
                  variant={match.isRecommended ? "default" : "outline"}
                  onClick={() => handleChooseBuyer(match.buyerId)}
                  disabled={!!isOrdering}
                >
                  {isOrdering === match.buyerId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Choose {match.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>We couldn't find matching buyers at this time.</CardDescription>
        </Card>
      )}

      {matches.some(m => m.isRecommended) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Award className="h-5 w-5 mr-2 text-primary" /> Why this recommendation?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The AI recommended buyer offers the optimal balance of high price, fast payment speed, and reliable track record for your specific location and quality grade.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
