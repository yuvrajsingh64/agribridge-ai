"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BarChart, Sparkles, TrendingUp, Package, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAction {
  id: string;
  time: string;
  description: string;
  type: 'MATCH_BUYERS' | 'FILTER_BUYERS' | 'RANK_BUYERS' | 'RECOMMEND' | 'ANALYZE_MARKET' | 'CREATE_ORDER' | 'PAYMENT';
  status: 'SUCCESS' | 'PENDING' | 'INFO';
}

export default function ActivityPage() {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setActions([
        { id: 'act-1', time: '09:47 AM', description: 'Razorpay payment request generated', type: 'PAYMENT', status: 'SUCCESS' },
        { id: 'act-2', time: '09:46 AM', description: 'Order created with Shakti Foods', type: 'CREATE_ORDER', status: 'SUCCESS' },
        { id: 'act-3', time: '09:45 AM', description: 'Farmer accepted recommendation for Wheat (Grade A)', type: 'MATCH_BUYERS', status: 'INFO' },
        { id: 'act-4', time: '09:44 AM', description: 'Recommended Shakti Foods based on highest score (95%)', type: 'RECOMMEND', status: 'SUCCESS' },
        { id: 'act-5', time: '09:43 AM', description: 'Ranked buyers by price, quantity, payment speed and distance', type: 'RANK_BUYERS', status: 'SUCCESS' },
        { id: 'act-6', time: '09:43 AM', description: 'Filtered 3 buyers based on Grade A requirement', type: 'FILTER_BUYERS', status: 'SUCCESS' },
        { id: 'act-7', time: '09:42 AM', description: 'Matched 8 potential buyers against your wheat listing', type: 'MATCH_BUYERS', status: 'SUCCESS' },
        { id: 'act-8', time: '08:15 AM', description: 'Analyzed morning mandi rates for Sehore region', type: 'ANALYZE_MARKET', status: 'INFO' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'MATCH_BUYERS': return <Search className="w-4 h-4" />;
      case 'FILTER_BUYERS': return <Filter className="w-4 h-4" />;
      case 'RANK_BUYERS': return <BarChart className="w-4 h-4" />;
      case 'RECOMMEND': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'ANALYZE_MARKET': return <TrendingUp className="w-4 h-4" />;
      case 'CREATE_ORDER': return <Package className="w-4 h-4" />;
      case 'PAYMENT': return <CreditCardIcon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Success</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>;
      case 'INFO':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Info</Badge>;
      default:
        return null;
    }
  };

  // Helper for Payment icon since it wasn't in original imports
  const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-md">
              <Sparkles className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <CardTitle>AI Activity Log</CardTitle>
              <CardDescription>Transparent log of AI decisions and actions on your behalf</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading activity log...</p>
            </div>
          ) : (
            <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
              {actions.map((action, index) => (
                <div key={action.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-3.5 top-1 w-7 h-7 rounded-full border-4 border-background flex items-center justify-center bg-muted text-muted-foreground shadow-sm",
                    action.type === 'RECOMMEND' || action.type === 'CREATE_ORDER' ? 'bg-green-100 text-green-700' : ''
                  )}>
                    {getIcon(action.type)}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-background">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {action.time}
                        <span className="hidden sm:inline-block mx-1">•</span>
                        <span className="hidden sm:inline-block text-xs uppercase tracking-wider">{action.type.replace('_', ' ')}</span>
                      </div>
                      <p className={cn(
                        "text-base", 
                        action.type === 'RECOMMEND' || action.type === 'CREATE_ORDER' ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {action.description}
                      </p>
                    </div>
                    <div className="mt-1 sm:mt-0 shrink-0">
                      {getStatusBadge(action.status)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Timeline end indicator */}
              <div className="absolute -left-1.5 bottom-0 w-3 h-3 rounded-full bg-muted border-2 border-background"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
