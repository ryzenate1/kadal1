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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function HomeHero() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - would come from an API in a real application
  const [heroData, setHeroData] = useState({
    headline: "Fresh From The Ocean To Your Table",
    subheading: "Premium seafood delivered directly to your door. Sustainably caught and expertly prepared.",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    imageUrl: "https://images.pexels.com/photos/3296395/pexels-photo-3296395.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    isActive: true,
  });

  const handleSave = () => {
    // In a real app, this would call an API endpoint
    setIsEditing(false);
    toast({
      title: "Hero section updated",
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
          <CardTitle>Homepage Hero Section</CardTitle>
          <CardDescription>
            Manage the main hero banner on the homepage.
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Hero
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden h-[300px] border">
              <img
                src={heroData.imageUrl}
                alt="Hero banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {heroData.headline}
                </h2>
                <p className="text-white/90 max-w-md mb-4">
                  {heroData.subheading}
                </p>
                <Button className="w-fit">{heroData.ctaText}</Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active-status" checked={heroData.isActive} disabled />
              <Label htmlFor="active-status">
                {heroData.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={heroData.headline}
                    onChange={(e) =>
                      setHeroData({ ...heroData, headline: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheading">Subheading</Label>
                  <Textarea
                    id="subheading"
                    value={heroData.subheading}
                    onChange={(e) =>
                      setHeroData({ ...heroData, subheading: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-text">CTA Text</Label>
                    <Input
                      id="cta-text"
                      value={heroData.ctaText}
                      onChange={(e) =>
                        setHeroData({ ...heroData, ctaText: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-link">CTA Link</Label>
                    <Input
                      id="cta-link"
                      value={heroData.ctaLink}
                      onChange={(e) =>
                        setHeroData({ ...heroData, ctaLink: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="active-status-edit"
                    checked={heroData.isActive}
                    onCheckedChange={(checked) =>
                      setHeroData({ ...heroData, isActive: checked })
                    }
                  />
                  <Label htmlFor="active-status-edit">
                    {heroData.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">Background Image URL</Label>
                  <Input
                    id="image-url"
                    value={heroData.imageUrl}
                    onChange={(e) =>
                      setHeroData({ ...heroData, imageUrl: e.target.value })
                    }
                  />
                </div>
                <div className="rounded-lg overflow-hidden h-[200px] border">
                  <img
                    src={heroData.imageUrl}
                    alt="Hero banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  For best results, use an image with dimensions of at least 1600x800 pixels.
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