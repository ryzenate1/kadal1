"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function Promotions() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - would come from an API in a real application
  const [promotionData, setPromotionData] = useState({
    title: "Fresh Catch Guarantee",
    description: "We guarantee the freshness of all our seafood products. If you're not completely satisfied, we'll refund your purchase.",
    imageUrl: "https://images.pexels.com/photos/2067057/pexels-photo-2067057.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    buttonText: "Learn More",
    buttonLink: "/fresh-guarantee",
    isActive: true,
  });

  const handleSave = () => {
    // In a real app, this would call an API endpoint
    setIsEditing(false);
    toast({
      title: "Promotion section updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleCancel = () => {
    // Reset to original values and exit edit mode
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Promotion Banner</CardTitle>
          <CardDescription>
            Manage the promotional banner on the homepage.
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Promotion
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={promotionData.imageUrl}
                    alt="Promotion"
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
                <div className="md:w-1/2 p-6 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-4">{promotionData.title}</h2>
                  <p className="mb-6">{promotionData.description}</p>
                  <Button className="w-fit">{promotionData.buttonText}</Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="promo-active-status" checked={promotionData.isActive} disabled />
              <Label htmlFor="promo-active-status">
                {promotionData.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-title">Title</Label>
                  <Input
                    id="promo-title"
                    value={promotionData.title}
                    onChange={(e) =>
                      setPromotionData({ ...promotionData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-description">Description</Label>
                  <Textarea
                    id="promo-description"
                    value={promotionData.description}
                    onChange={(e) =>
                      setPromotionData({ ...promotionData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-button-text">Button Text</Label>
                    <Input
                      id="promo-button-text"
                      value={promotionData.buttonText}
                      onChange={(e) =>
                        setPromotionData({ ...promotionData, buttonText: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-button-link">Button Link</Label>
                    <Input
                      id="promo-button-link"
                      value={promotionData.buttonLink}
                      onChange={(e) =>
                        setPromotionData({ ...promotionData, buttonLink: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="promo-active-status-edit"
                    checked={promotionData.isActive}
                    onCheckedChange={(checked) =>
                      setPromotionData({ ...promotionData, isActive: checked })
                    }
                  />
                  <Label htmlFor="promo-active-status-edit">
                    {promotionData.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-image-url">Image URL</Label>
                  <Input
                    id="promo-image-url"
                    value={promotionData.imageUrl}
                    onChange={(e) =>
                      setPromotionData({ ...promotionData, imageUrl: e.target.value })
                    }
                  />
                </div>
                <div className="rounded-lg overflow-hidden h-[200px] border">
                  <img
                    src={promotionData.imageUrl}
                    alt="Promotion preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  For best results, use an image with dimensions of at least 800x600 pixels.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      )}
    </Card>
  );
}