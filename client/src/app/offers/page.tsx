"use client";

import { useState, useEffect } from "react";
import { Star, Clock, Percent, Gift, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code?: string;
  minOrder?: number;
  type: 'percentage' | 'flat' | 'bogo' | 'free_delivery';
  active: boolean;
  image?: string;
}

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      // Mock offers data - replace with real API call
      const mockOffers: Offer[] = [
        {
          id: '1',
          title: 'Fresh Fish Special',
          description: 'Get 25% off on all fresh fish varieties',
          discount: '25% OFF',
          validUntil: '2025-06-30',
          code: 'FRESH25',
          minOrder: 500,
          type: 'percentage',
          active: true
        },
        {
          id: '2',
          title: 'Free Delivery',
          description: 'Free delivery on orders above ₹299',
          discount: 'Free Delivery',
          validUntil: '2025-07-15',
          minOrder: 299,
          type: 'free_delivery',
          active: true
        },
        {
          id: '3',
          title: 'Buy 1 Get 1',
          description: 'Buy 1 kg of prawns, get 500g free',
          discount: 'BOGO',
          validUntil: '2025-06-25',
          code: 'PRAWN1GET1',
          type: 'bogo',
          active: true
        },
        {
          id: '4',
          title: 'First Order Discount',
          description: 'New customers get ₹100 off on first order',
          discount: '₹100 OFF',
          validUntil: '2025-12-31',
          code: 'WELCOME100',
          minOrder: 400,
          type: 'flat',
          active: true
        },
        {
          id: '5',
          title: 'Weekend Special',
          description: '15% off on all orders placed during weekends',
          discount: '15% OFF',
          validUntil: '2025-07-31',
          code: 'WEEKEND15',
          type: 'percentage',
          active: true
        }
      ];

      setOffers(mockOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const copyOfferCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Offer code ${code} copied to clipboard!`);
  };

  const getOfferIcon = (type: Offer['type']) => {
    switch (type) {
      case 'percentage': return <Percent className="h-5 w-5" />;
      case 'flat': return <Tag className="h-5 w-5" />;
      case 'bogo': return <Gift className="h-5 w-5" />;
      case 'free_delivery': return <Star className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 3;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Current Offers</h1>
              <p className="text-gray-600">Save more on your fresh fish orders</p>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {isExpiringSoon(offer.validUntil) && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs font-medium">
                  Expires Soon!
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      {getOfferIcon(offer.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <div className="text-2xl font-bold text-red-600">{offer.discount}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                <div className="space-y-2 mb-4">
                  {offer.minOrder && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Tag className="h-4 w-4" />
                      <span>Minimum order: ₹{offer.minOrder}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {offer.code && (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Use code:</p>
                        <p className="font-mono font-bold text-gray-900">{offer.code}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyOfferCode(offer.code!)}
                        className="text-xs"
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast.success("Redirecting to shop...");
                    router.push('/');
                  }}
                >
                  Shop Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Offers Message */}
        {offers.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
            <p className="text-gray-500">Check back later for exciting offers and deals!</p>
          </div>
        )}

        {/* Terms and Conditions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Offers are valid for registered users only</li>
              <li>• Offers cannot be combined with other promotions</li>
              <li>• Minimum order values are calculated before taxes and delivery charges</li>
              <li>• Kadal Thunai reserves the right to modify or cancel offers without prior notice</li>
              <li>• Offers are applicable on selected products only</li>
              <li>• Free delivery offers are valid within the standard delivery area</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
