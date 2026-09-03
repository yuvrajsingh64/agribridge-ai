"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpRight, Calendar, Package, Receipt, IndianRupee } from 'lucide-react';

interface Transaction {
  id: string;
  orderId: string;
  date: string;
  crop: string;
  buyer: string;
  amount: number;
  paymentMethod: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions?farmerId=demo-farmer-ramesh');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.transactions || []);
          // Map API shape to component shape
          setTransactions(items.map((t: any) => ({
            id: t.id,
            orderId: t.order?.orderNumber || t.orderId,
            date: t.completedAt || t.createdAt,
            crop: t.order?.crop || '',
            buyer: t.order?.buyer?.name || '',
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            status: t.status,
          })));
        } else {
          // Fallback data
          setTransactions([
            { id: 'TXN-001', orderId: 'ORD-8923', date: '2024-03-15T10:30:00Z', crop: 'Wheat (Grade A)', buyer: 'Shakti Foods', amount: 147500, paymentMethod: 'Bank Transfer', status: 'PAID' },
            { id: 'TXN-002', orderId: 'ORD-8745', date: '2024-03-10T14:15:00Z', crop: 'Soybean', buyer: 'Central Grain Traders', amount: 85000, paymentMethod: 'UPI', status: 'PAID' },
            { id: 'TXN-003', orderId: 'ORD-9102', date: '2024-03-22T09:45:00Z', crop: 'Chickpea', buyer: 'Malwa Processors', amount: 62000, paymentMethod: 'Bank Transfer', status: 'PENDING' },
            { id: 'TXN-004', orderId: 'ORD-8511', date: '2024-02-28T16:20:00Z', crop: 'Rice (Basmati)', buyer: 'AgriCorp India', amount: 215000, paymentMethod: 'Bank Transfer', status: 'FAILED' },
            { id: 'TXN-005', orderId: 'ORD-8299', date: '2024-02-15T11:10:00Z', crop: 'Wheat (Grade B)', buyer: 'Local Mandi', amount: 45000, paymentMethod: 'Cash', status: 'PAID' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        // Fallback data
        setTransactions([
          { id: 'TXN-001', orderId: 'ORD-8923', date: '2024-03-15T10:30:00Z', crop: 'Wheat (Grade A)', buyer: 'Shakti Foods', amount: 147500, paymentMethod: 'Bank Transfer', status: 'PAID' },
          { id: 'TXN-002', orderId: 'ORD-8745', date: '2024-03-10T14:15:00Z', crop: 'Soybean', buyer: 'Central Grain Traders', amount: 85000, paymentMethod: 'UPI', status: 'PAID' },
          { id: 'TXN-003', orderId: 'ORD-9102', date: '2024-03-22T09:45:00Z', crop: 'Chickpea', buyer: 'Malwa Processors', amount: 62000, paymentMethod: 'Bank Transfer', status: 'PENDING' },
          { id: 'TXN-004', orderId: 'ORD-8511', date: '2024-02-28T16:20:00Z', crop: 'Rice (Basmati)', buyer: 'AgriCorp India', amount: 215000, paymentMethod: 'Bank Transfer', status: 'FAILED' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Paid</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(t => activeTab === 'ALL' || t.status === activeTab);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View and manage all your past sales and payments.</p>
        </div>
        <Card className="bg-green-50/50 border-green-100 px-4 py-2 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <IndianRupee className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
            <p className="font-bold text-green-800 text-lg">
              {formatCurrency(transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>A list of your recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PAID">Paid</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="FAILED">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="m-0">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Receipt className="h-12 w-12 opacity-20 mb-3" />
                  <p>No transactions found for this filter.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-md border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium">Transaction ID</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Crop</th>
                          <th className="px-4 py-3 font-medium">Buyer</th>
                          <th className="px-4 py-3 font-medium text-right">Amount</th>
                          <th className="px-4 py-3 font-medium">Method</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((t) => (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{t.id}
                              <div className="text-xs text-muted-foreground font-normal">{t.orderId}</div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(t.date)}</td>
                            <td className="px-4 py-3 font-medium">{t.crop}</td>
                            <td className="px-4 py-3">{t.buyer}</td>
                            <td className="px-4 py-3 text-right font-bold">{formatCurrency(t.amount)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{t.paymentMethod}</td>
                            <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {filteredTransactions.map((t) => (
                      <Card key={t.id} className="overflow-hidden shadow-sm">
                        <div className="p-4 bg-muted/20 border-b flex justify-between items-center">
                          <div>
                            <span className="font-semibold">{t.id}</span>
                            <span className="text-xs text-muted-foreground ml-2 block">{formatDate(t.date)}</span>
                          </div>
                          {getStatusBadge(t.status)}
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Package className="w-3 h-3"/> Crop</p>
                            <p className="font-medium mt-1">{t.crop}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Buyer</p>
                            <p className="font-medium mt-1">{t.buyer}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><IndianRupee className="w-3 h-3"/> Amount</p>
                            <p className="font-bold text-base mt-1">{formatCurrency(t.amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> Method</p>
                            <p className="font-medium mt-1">{t.paymentMethod}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
