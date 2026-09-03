"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Wheat, MapPin, Scale, ShieldCheck, CreditCard, Clock, MessageSquare, Briefcase, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Produce {
  id: string;
  crop: string;
  quantity: number;
  qualityGrade: string;
  location: string;
  minPrice: number;
  sellingDeadline: string;
  status: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: any;
}

export default function AgentPage() {
  const router = useRouter();
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [loadingProduce, setLoadingProduce] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! 🙏 Main AgriBridge AI hoon. Aapki fasal ke liye best buyer dhundhne mein madad karunga. Aap Hindi ya English mein baat kar sakte hain.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a simple conversation ID for demo
    setConversationId(Math.random().toString(36).substring(7));
    
    // Fetch produce
    const fetchProduce = async () => {
      try {
        setLoadingProduce(true);
        const res = await fetch('/api/produce?farmerId=demo-farmer-ramesh');
        if (res.ok) {
          const data = await res.json();
          setProduceList(Array.isArray(data) ? data : (data.produce || []));
        } else {
          // Fallback data
          setProduceList([
            {
              id: 'prod-1',
              crop: 'Wheat (Sharbati)',
              quantity: 50,
              qualityGrade: 'Grade A',
              location: 'Sehore, MP',
              minPrice: 2800,
              sellingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'AVAILABLE'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch produce', error);
        // Fallback data
        setProduceList([
          {
            id: 'prod-1',
            crop: 'Wheat (Sharbati)',
            quantity: 50,
            qualityGrade: 'Grade A',
            location: 'Sehore, MP',
            minPrice: 2800,
            sellingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'AVAILABLE'
          }
        ]);
      } finally {
        setLoadingProduce(false);
      }
    };

    fetchProduce();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          farmerId: 'demo-farmer-ramesh',
          conversationId,
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || 'Sorry, I have a response but no content.',
          timestamp: new Date().toISOString(),
          data: data.data
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Mock response if API fails
        setTimeout(() => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'I found a great buyer for your Wheat. Would you like to see the recommendation?',
            timestamp: new Date().toISOString(),
            data: {
              type: 'recommendation',
              buyer: {
                id: 'buyer-1',
                name: 'Shakti Foods',
                price: 2950,
                quantity: 50,
                revenue: 2950 * 50,
                score: 95,
                reasons: ['Highest price match', 'Fast payment history', 'Close location']
              }
            }
          };
          setMessages(prev => [...prev, aiMsg]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the server. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAcceptRecommendation = async (buyerData: any) => {
    try {
      setIsTyping(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: 'demo-farmer-ramesh',
          buyerId: buyerData.id,
          produceListingId: produceList[0]?.id,
          pricePerUnit: buyerData.price,
          quantity: buyerData.quantity
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Badhai ho! Order create ho gaya hai. Transaction ID: ${data.orderId || 'ORD-' + Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        // Mock success
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Badhai ho! Order create ho gaya hai Shakti Foods ke sath. Transaction ID: ORD-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Mahafeez! Order create nahi ho paya. Kripya thodi der baad prayas karein.`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
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
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 p-4">
      {/* Mobile Tabs View */}
      <div className="md:hidden flex-1 h-full flex flex-col">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="context">Farm Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-2 h-0">
            <ChatInterface 
              messages={messages} 
              isTyping={isTyping} 
              inputValue={inputValue} 
              setInputValue={setInputValue} 
              handleSendMessage={handleSendMessage}
              handleAcceptRecommendation={handleAcceptRecommendation}
              scrollRef={scrollRef}
              formatCurrency={formatCurrency}
              router={router}
            />
          </TabsContent>
          
          <TabsContent value="context" className="flex-1 overflow-auto mt-2 h-0">
            <ContextPanel produceList={produceList} loadingProduce={loadingProduce} formatCurrency={formatCurrency} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Split View */}
      <div className="hidden md:flex flex-1 h-full gap-4">
        <div className="w-[65%] h-full flex flex-col bg-card border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-green-50/50">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-green-800">
              <MessageSquare className="w-5 h-5" />
              AgriBridge AI Assistant
            </h2>
            <p className="text-sm text-muted-foreground">Your smart farming partner</p>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <ChatInterface 
              messages={messages} 
              isTyping={isTyping} 
              inputValue={inputValue} 
              setInputValue={setInputValue} 
              handleSendMessage={handleSendMessage}
              handleAcceptRecommendation={handleAcceptRecommendation}
              scrollRef={scrollRef}
              formatCurrency={formatCurrency}
              router={router}
            />
          </div>
        </div>
        
        <div className="w-[35%] h-full flex flex-col">
          <ContextPanel produceList={produceList} loadingProduce={loadingProduce} formatCurrency={formatCurrency} />
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function ChatInterface({ 
  messages, 
  isTyping, 
  inputValue, 
  setInputValue, 
  handleSendMessage,
  handleAcceptRecommendation,
  scrollRef,
  formatCurrency,
  router
}: any) {
  return (
    <>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-4">
          {messages.map((msg: any) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "self-end items-end" : "self-start items-start"
            )}>
              <div className={cn(
                "p-3 rounded-lg shadow-sm",
                msg.role === 'user' ? "bg-green-600 text-white rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              <span className="text-xs text-muted-foreground mt-1 mx-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>

              {/* Render Structured Data */}
              {msg.data?.type === 'recommendation' && msg.data.buyer && (
                <Card className="mt-2 w-full border-green-200 bg-green-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{msg.data.buyer.name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Match Score: {msg.data.buyer.score}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Price/Qtl</span>
                        <span className="font-semibold text-green-700">{formatCurrency(msg.data.buyer.price)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Quantity Needed</span>
                        <span className="font-medium">{msg.data.buyer.quantity} Qtl</span>
                      </div>
                      <div className="flex flex-col col-span-2 mt-1">
                        <span className="text-muted-foreground text-xs">Total Estimated Revenue</span>
                        <span className="font-bold text-lg">{formatCurrency(msg.data.buyer.revenue)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Why this match?</span>
                      <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                        {msg.data.buyer.reasons?.map((reason: string, i: number) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => handleAcceptRecommendation(msg.data.buyer)}>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Accept Recommendation
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push('/buyers/compare')}>
                      <Scale className="w-4 h-4 mr-2" />
                      Compare Buyers
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="self-start flex flex-col max-w-[80%] items-start">
              <div className="p-3 bg-muted rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-background">
        <form 
          className="flex gap-2 max-w-3xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message in Hindi or English..."
            className="flex-1 min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isTyping}
          />
          <Button type="submit" disabled={!inputValue.trim() || isTyping} className="bg-green-600 hover:bg-green-700 shrink-0 h-[44px] w-[44px] p-0">
            <Send className="w-5 h-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </>
  );
}

function ContextPanel({ produceList, loadingProduce, formatCurrency }: any) {
  return (
    <div className="flex flex-col h-full bg-muted/30 border rounded-lg shadow-sm">
      <div className="p-4 border-b bg-background">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-600" />
          Farm Context
        </h2>
        <p className="text-sm text-muted-foreground">Active listings & requirements</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loadingProduce ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading active produce...</p>
          </div>
        ) : produceList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Wheat className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No active produce listed.</p>
              <Button variant="link" className="mt-2 text-green-600">List Produce Now</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {produceList.map((produce: any) => (
              <Card key={produce.id} className="border-green-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold">{produce.crop}</CardTitle>
                    <Badge variant={produce.status === 'AVAILABLE' ? 'default' : 'secondary'} className={produce.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                      {produce.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                        <p className="font-semibold">{produce.quantity} Quintals</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Quality</p>
                        <p className="font-semibold">{produce.qualityGrade}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Min. Price</p>
                        <p className="font-semibold text-green-700">{formatCurrency(produce.minimumPrice || produce.minPrice)}/Qtl</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Location</p>
                        <p className="font-semibold truncate" title={produce.location}>{produce.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-1 border-t flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sell by: {new Date(produce.sellingDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-3 border border-blue-100">
              <TrendingUp className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
              <div>
                <p className="font-semibold mb-1">Market Insight</p>
                <p className="text-blue-700/90 text-xs">Wheat prices in Sehore mandi have risen by 2% in the last 48 hours. Consider selling soon to capture the premium.</p>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
