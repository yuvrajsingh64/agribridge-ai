"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, MapPin, IndianRupee, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Produce {
  id: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  location: string;
  district: string;
  state: string;
  minimumPrice: number;
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  sellingDeadline: string;
}

export default function ProducePage() {
  const [produce, setProduce] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const farmerId = "demo-farmer-ramesh";

  const fetchProduce = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/produce?farmerId=${farmerId}`);
      if (res.ok) {
        const data = await res.json();
        setProduce(data);
      }
    } catch (error) {
      console.error("Failed to fetch produce:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      farmerId,
      crop: formData.get("crop"),
      variety: formData.get("variety"),
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit"),
      qualityGrade: formData.get("qualityGrade"),
      location: formData.get("location"),
      district: formData.get("district"),
      state: formData.get("state"),
      harvestDate: formData.get("harvestDate"),
      minimumPrice: Number(formData.get("minimumPrice")),
      sellingDeadline: formData.get("sellingDeadline"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
        fetchProduce();
      }
    } catch (error) {
      console.error("Failed to create produce:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Produce["status"]) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500 hover:bg-green-600";
      case "SOLD": return "bg-blue-500 hover:bg-blue-600";
      case "EXPIRED": return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-gray-500 hover:bg-gray-600";
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
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produce Management</h1>
          <p className="text-muted-foreground">Manage your harvest and listings</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Produce
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Produce</DialogTitle>
              <DialogDescription>
                List your produce to find potential buyers. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Crop *</Label>
                  <Select name="crop" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Wheat", "Rice", "Soybean", "Chickpea", "Maize", "Cotton", "Sugarcane"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety</Label>
                  <Input id="variety" name="variety" placeholder="e.g. Sharbati" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select name="unit" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quintal">Quintal</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualityGrade">Quality Grade *</Label>
                  <Select name="qualityGrade" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade A">Grade A</SelectItem>
                      <SelectItem value="Grade B">Grade B</SelectItem>
                      <SelectItem value="Grade C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPrice">Minimum Price (₹) *</Label>
                  <Input id="minimumPrice" name="minimumPrice" type="number" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Village/Location *</Label>
                  <Input id="location" name="location" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" name="district" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input id="harvestDate" name="harvestDate" type="date" required />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="sellingDeadline">Selling Deadline *</Label>
                  <Input id="sellingDeadline" name="sellingDeadline" type="date" required />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Any specific requirements or details..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Produce
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : produce.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center bg-muted/50">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No Produce Listed</CardTitle>
          <CardDescription>
            You haven't listed any produce yet. Click "Add Produce" to start selling.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produce.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.crop}</CardTitle>
                    {item.variety && <CardDescription>{item.variety}</CardDescription>}
                  </div>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality</span>
                  <span className="font-medium">{item.qualityGrade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <IndianRupee className="mr-1 h-3 w-3" /> Min. Price
                  </span>
                  <span className="font-medium">{formatCurrency(item.minimumPrice)}/{item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <MapPin className="mr-1 h-3 w-3" /> Location
                  </span>
                  <span className="font-medium">{item.location}, {item.district}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="mr-1 h-3 w-3" /> Deadline
                  </span>
                  <span className="font-medium">{format(new Date(item.sellingDeadline), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
