"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, Map, Ruler, Globe, Edit, FileText, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const profileData = {
    name: 'Ramesh Kumar',
    role: 'Farmer',
    phone: '+91 98765 43210',
    email: 'ramesh.farmer@example.com',
    location: {
      village: 'Brijpur',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      pinCode: '466001'
    },
    farmDetails: {
      size: '12 Acres',
      soilType: 'Black Cotton',
      irrigation: 'Tube Well'
    },
    preferences: {
      language: 'Hindi / English',
      notifications: true
    },
    stats: {
      totalOrders: 15,
      totalRevenue: '₹14,50,000',
      activeListings: 2,
      memberSince: '2023'
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Farmer Profile</h1>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Profile Info */}
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
              <User className="w-12 h-12 text-green-700" />
            </div>
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <Badge variant="secondary" className="mt-1 mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100">
              Verified {profileData.role}
              <CheckCircle2 className="w-3 h-3 ml-1" />
            </Badge>

            <div className="w-full space-y-3 mt-4 pt-4 border-t text-sm text-left">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="w-4 h-4 text-primary" />
                <span>{profileData.preferences.language}</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {profileData.location.village},<br/>
                  {profileData.location.district}, {profileData.location.state} {profileData.location.pinCode}
                </span>
              </div>
            </div>
            
            <Button className="w-full mt-6 sm:hidden" variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-green-50/50 border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{profileData.stats.totalOrders}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Total Orders</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50 border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-700 truncate" title={profileData.stats.totalRevenue}>{profileData.stats.totalRevenue}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Revenue</div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50/50 border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{profileData.stats.activeListings}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Active Listings</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50/50 border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-purple-700">{profileData.stats.memberSince}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Member Since</div>
              </CardContent>
            </Card>
          </div>

          {/* Farm Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="w-5 h-5 text-muted-foreground" />
                Farm Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Total Land Size
                  </h4>
                  <p className="font-semibold text-lg">{profileData.farmDetails.size}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Soil Type
                  </h4>
                  <p className="font-semibold text-lg">{profileData.farmDetails.soilType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Irrigation Source</h4>
                  <p className="font-semibold">{profileData.farmDetails.irrigation}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Khasra Number</h4>
                  <p className="font-semibold text-muted-foreground">Hidden for privacy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Verification */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="text-lg">KYC & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Aadhaar Card</p>
                      <p className="text-xs text-muted-foreground">Verified on Jan 2023</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Bank Details (UPI/NEFT)</p>
                      <p className="text-xs text-muted-foreground">Linked to HDFC Bank</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
