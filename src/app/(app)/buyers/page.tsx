"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Star, MapPin, CheckCircle2, TrendingUp, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BuyerOffer {
  id: string;
  crop: string;
  pricePerUnit: number;
  qualityRequirements: string;
  minimumQuantity: number;
  maximumQuantity: number;
}

interface Buyer {
  id: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  paymentWindowHours: number;
  description: string;
  offers: BuyerOffer[];
  matchScore?: number;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string>("all");

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/buyers');
      if (res.ok) {
        const data = await res.json();
        setBuyers(data);
      }
    } catch (error) {
      console.error("Failed to fetch buyers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAiMatch = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/buyers/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produceListingId: 'demo-produce-wheat' }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const matchData = data.matches || data;
        // matchData returns [{ buyerId, matchScore, ... }]
        const updatedBuyers = buyers.map(buyer => {
          const match = matchData.find((m: any) => m.buyerId === buyer.id);
          return { ...buyer, matchScore: match ? match.matchScore : undefined };
        });
        
        // Sort by match score
        updatedBuyers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setBuyers(updatedBuyers);
      }
    } catch (error) {
      console.error("Failed to run AI match:", error);
    } finally {
      setIsMatching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredBuyers = buyers.filter(b => 
    filterCrop === "all" ? true : b.offers.some(o => o.crop === filterCrop)
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Marketplace</h1>
          <p className="text-muted-foreground">Find buyers for your produce</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleRunAiMatch} disabled={isMatching} className="bg-primary">
            {isMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
            Run AI Match
          </Button>
          <Link href="/buyers/compare">
            <Button variant="outline">Compare Top Matches</Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label>Filter by Crop</Label>
            <Select value={filterCrop} onValueChange={setFilterCrop}>
              <SelectTrigger>
                <SelectValue placeholder="All Crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="Wheat">Wheat</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Soybean">Soybean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <Label>Min Price (₹)</Label>
            <Input type="number" placeholder="Enter amount" />
          </div>
          <Button variant="secondary" className="flex-1 md:flex-none">
            <Search className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBuyers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <CardTitle className="mb-2">No Buyers Found</CardTitle>
          <CardDescription>Try adjusting your filters.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {buyer.name}
                      {buyer.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="mr-1 h-3 w-3" /> {buyer.location}
                    </CardDescription>
                  </div>
                  {buyer.matchScore && (
                    <Badge variant={buyer.matchScore > 80 ? "default" : "secondary"} className="bg-primary/10 text-primary hover:bg-primary/20">
                      {buyer.matchScore}% Match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-medium">{buyer.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Pays in {buyer.paymentWindowHours}h</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{buyer.description}</p>
                
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Buying Offers:</h4>
                  {buyer.offers.map((offer, idx) => (
                    <div key={idx} className="bg-muted p-2 rounded-md text-sm flex justify-between items-center">
                      <div>
                        <span className="font-medium">{offer.crop}</span>
                        <span className="text-muted-foreground text-xs ml-2">({offer.qualityRequirements})</span>
                      </div>
                      <div className="font-semibold text-primary">
                        {formatCurrency(offer.pricePerUnit)}/qtl
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/buyers/compare?buyers=${buyer.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
