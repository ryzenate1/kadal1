"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrderTracking } from "@/services/orderTrackingService";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  Package,
  RefreshCw,
  Share2,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress.js";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type TimelineStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const timelineOrder: TimelineStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

type TimelineStep = {
  key: TimelineStatus;
  completed: boolean;
  active: boolean;
  time: string | null | undefined;
};

const statusMeta: Record<
  TimelineStatus,
  { label: string; description: string; icon: typeof Clock; badgeClass: string }
> = {
  pending: {
    label: "Order Placed",
    description: "We received your order and payment details.",
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-800",
  },
  confirmed: {
    label: "Confirmed",
    description: "Your order is confirmed and queued for preparation.",
    icon: CheckCircle,
    badgeClass: "bg-blue-100 text-blue-800",
  },
  processing: {
    label: "Preparing",
    description: "Your seafood is being cleaned, packed, and prepared.",
    icon: Package,
    badgeClass: "bg-primary/10 text-primary",
  },
  shipped: {
    label: "Out for Delivery",
    description: "Your order is on the way.",
    icon: Truck,
    badgeClass: "bg-orange-100 text-orange-800",
  },
  delivered: {
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle,
    badgeClass: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled.",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-800",
  },
};

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(status?: string | null) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { orderId } = use(params);
  const { trackingData, isLoading, error, isConnected, refreshTracking } = useOrderTracking(orderId);

  const currentStatus = (trackingData?.order?.status || "pending") as TimelineStatus;

  const timeline = useMemo(() => {
    if (currentStatus === "cancelled") {
      return [
        {
          key: "cancelled" as TimelineStatus,
          completed: true,
          active: true,
          time:
            trackingData?.tracking.locationUpdates.at(-1)?.timestamp || trackingData?.order.createdAt || null,
        },
      ] as TimelineStep[];
    }

    const statusIndex = timelineOrder.indexOf(currentStatus);
    return timelineOrder.map((status, index): TimelineStep => {
      const event = trackingData?.tracking.locationUpdates.find((entry) => entry.status === status);
      return {
        key: status,
        completed: index <= statusIndex,
        active: status === currentStatus,
        time: event?.timestamp || (status === "pending" ? trackingData?.order.createdAt : null),
      };
    });
  }, [currentStatus, trackingData]);

  const currentMeta = statusMeta[currentStatus] || statusMeta.pending;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied");
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tracking/${orderId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Track order ${orderId}`,
          text: "Track my Kadal order",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast.success("Tracking link ready");
    } catch (shareError) {
      console.error("Share error:", shareError);
      toast.error("Failed to share tracking link");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
              {isConnected && (
                <Badge className="bg-green-100 text-green-800">Live</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{orderId}</span>
              <button onClick={handleCopy} className="text-primary hover:text-primary/80">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Button variant="outline" onClick={() => refreshTracking()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-medium">Unable to load tracking details</div>
                <div className="text-sm">{error}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && !trackingData ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
          </div>
        ) : trackingData ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentMeta.label}</span>
                    <Badge className={currentMeta.badgeClass}>{formatStatus(currentStatus)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-gray-600">{currentMeta.description}</p>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{trackingData.tracking.progressPercentage}%</span>
                  </div>
                  <Progress value={trackingData.tracking.progressPercentage} className="mb-6 h-2" />

                  <div className="space-y-5">
                    {timeline.map((step, index) => {
                      const meta = statusMeta[step.key];
                      const Icon = meta.icon;
                      return (
                        <div key={step.key} className="relative flex gap-4">
                          {index < timeline.length - 1 && (
                            <div
                              className={`absolute left-4 top-8 h-10 w-0.5 ${
                                step.completed ? "bg-primary" : "bg-gray-200"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                              step.active
                                ? "bg-primary text-white"
                                : step.completed
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-gray-900">{meta.label}</div>
                              <div className="text-sm text-gray-500">{formatDateTime(step.time)}</div>
                            </div>
                            <div className="text-sm text-gray-600">{meta.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tracking Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trackingData.tracking.locationUpdates.length > 0 ? (
                    trackingData.tracking.locationUpdates
                      .slice()
                      .reverse()
                      .map((event, index) => (
                        <div key={`${event.status}-${event.timestamp}-${index}`} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-gray-900">{formatStatus(event.status)}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(event.timestamp)}</div>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">{event.description}</div>
                          {event.metadata?.location && (
                            <div className="mt-1 text-xs text-gray-500">{event.metadata.location}</div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-gray-600">No tracking events have been recorded yet.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Order Status</span>
                    <span className="font-medium">{formatStatus(currentStatus)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment</span>
                    <span className="font-medium">{formatStatus(trackingData.order.paymentStatus)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{trackingData.order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Placed On</span>
                    <span className="font-medium">{formatDateTime(trackingData.order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">{formatDateTime(trackingData.order.estimatedDelivery)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ETA</span>
                    <span className="font-medium">
                      {trackingData.tracking.eta > 0 ? `${trackingData.tracking.eta} min` : "N/A"}
                    </span>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-3 text-sm font-medium text-gray-900">
                      Items ({trackingData.order.orderItems?.length || 0})
                    </div>
                    <div className="space-y-3">
                      {trackingData.order.orderItems?.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={item.product?.imageUrl || "/images/fish/mackerel.jpg"}
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {item.product?.name || "Product"}
                            </div>
                            <div className="text-xs text-gray-600">
                              Qty {item.quantity} x {formatMoney(item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900">Delivery Address</div>
                    <div className="text-sm text-gray-600">
                      <div>{trackingData.order.user?.name || "Customer"}</div>
                      <div>{trackingData.order.address?.address || "Address unavailable"}</div>
                      <div>
                        {[trackingData.order.address?.city, trackingData.order.address?.state, trackingData.order.address?.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(trackingData.order.totalAmount)}</span>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Tracking Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
