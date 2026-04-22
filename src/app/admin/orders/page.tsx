"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, RefreshCw, Search, Phone, Mail, User, CheckCircle, Truck, Package, Video, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

type OrderItem = {
  id: string;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
  weight?: string | null;
};

type OrderEvent = {
  id: string;
  status: string;
  description: string;
  location?: string | null;
  createdAt: string;
};

type Profile = {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  deliverySlot?: string | null;
  shippingName: string;
  shippingPhone?: string | null;
  shippingAddress: string;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPincode?: string | null;
  processingVideoUrl?: string | null;
  deliveryPersonName?: string | null;
  deliveryPersonPhone?: string | null;
  isDeliveryReached?: boolean | null;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
  items: OrderItem[];
  events: OrderEvent[];
};

export default function AdminOrdersPage() {
  const [adminKey, setAdminKey] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryReached, setDeliveryReached] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem("kadal_admin_key") || "";
    setAdminKey(storedKey);
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    if (!selectedOrder) return;
    setDeliveryName(selectedOrder.deliveryPersonName || "");
    setDeliveryPhone(selectedOrder.deliveryPersonPhone || "");
    setDeliveryReached(Boolean(selectedOrder.isDeliveryReached));
    setEstimatedDelivery(selectedOrder.estimatedDelivery ? selectedOrder.estimatedDelivery.slice(0, 16) : "");
  }, [selectedOrder]);

  const fetchOrders = async () => {
    if (!adminKey) {
      toast.error("Enter admin key");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${encodeURIComponent(statusFilter)}`, {
        headers: { "x-admin-key": adminKey },
      });

      if (!res.ok) throw new Error("Failed to load orders");

      const data = await res.json();
      setOrders(data);
      if (data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchOrders();
    }
  }, [adminKey, statusFilter]);

  const saveAdminKey = () => {
    localStorage.setItem("kadal_admin_key", adminKey);
    toast.success("Admin key saved");
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!adminKey) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }

    const updated = await res.json();
    setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
    toast.success("Status updated");
  };

  const saveDeliveryDetails = async () => {
    if (!selectedOrder || !adminKey) return;
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({
        deliveryPersonName: deliveryName || null,
        deliveryPersonPhone: deliveryPhone || null,
        isDeliveryReached: deliveryReached,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to update delivery details");
      return;
    }

    const updated = await res.json();
    setOrders((prev) => prev.map((order) => (order.id === selectedOrder.id ? updated : order)));
    toast.success("Delivery details updated");
  };

  const uploadMedia = async (file: File) => {
    if (!selectedOrder || !adminKey) return;

    const formData = new FormData();
    formData.append("media", file);

    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/upload-video`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData,
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload?.error || "Media upload failed");
      return;
    }

    const payload = await res.json();
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, processingVideoUrl: payload.videoUrl }
          : order
      )
    );
    toast.success("Media uploaded");
  };

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      [order.orderNumber, order.profile?.name, order.profile?.phoneNumber]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [orders, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="max-w-xs rounded-xl bg-white border-gray-200 focus:border-red-300 focus:ring-red-200"
          />
          <Button onClick={saveAdminKey} className="rounded-xl bg-red-600 hover:bg-red-700 shadow-sm">
            <Save className="h-4 w-4 mr-2" />Save Key
          </Button>
          <Button variant="outline" onClick={fetchOrders} className="rounded-xl bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900">
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, customer..."
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    statusFilter === status ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-sm text-gray-400">Loading orders...</div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left rounded-2xl border p-3 transition-all duration-200 ${
                      selectedOrderId === order.id
                        ? "border-red-600 bg-red-600 text-white shadow-md"
                        : "border-gray-100 bg-white hover:border-red-200 hover:bg-red-50/30"
                    }`}
                  >
                    <p className="text-sm font-semibold">#{order.orderNumber}</p>
                    <p className={`text-xs ${selectedOrderId === order.id ? 'text-white/80' : 'text-gray-500'}`}>{order.profile?.name || "Customer"}</p>
                    <p className={`text-xs ${selectedOrderId === order.id ? 'text-white/80' : 'text-gray-500'}`}>₹{order.totalAmount.toFixed(0)}</p>
                    <p className={`text-xs uppercase tracking-wider mt-2 ${selectedOrderId === order.id ? 'text-white/90' : 'text-gray-400'}`}>{order.status}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            {!selectedOrder ? (
              <div className="text-gray-500 text-sm">Select an order to manage.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">#{selectedOrder.orderNumber}</h2>
                    <p className="text-sm text-gray-500">Placed {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">₹{selectedOrder.totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Payment</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{selectedOrder.paymentMethod}</p>
                    <p className={`text-xs mt-1 font-semibold uppercase tracking-wider ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : selectedOrder.paymentStatus === 'failed'
                          ? 'text-red-600'
                          : 'text-amber-600'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Tracking</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.trackingNumber || 'Pending assignment'}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedOrder.deliverySlot || 'Delivery slot not set'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Customer</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{selectedOrder.profile?.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Mail className="h-4 w-4 text-gray-400" />{selectedOrder.profile?.email || "-"}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Phone className="h-4 w-4 text-gray-400" />{selectedOrder.profile?.phoneNumber || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Delivery Address</p>
                    <p className="text-sm text-gray-900">{selectedOrder.shippingName}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedOrder.shippingAddress}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPincode}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                        <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          selectedOrder.status === status
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Delivery & ETA</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={deliveryName}
                      onChange={(e) => setDeliveryName(e.target.value)}
                      placeholder="Delivery person name"
                      className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Input
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="Delivery person phone"
                      className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <Input
                      type="datetime-local"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={deliveryReached}
                        onChange={(e) => setDeliveryReached(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      Delivery reached
                    </label>
                  </div>
                  <Button onClick={saveDeliveryDetails} className="rounded-xl bg-red-600 hover:bg-red-700 shadow-sm">
                    <Truck className="h-4 w-4 mr-2" />Save Delivery Details
                  </Button>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Processing Media</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-red-600 transition-colors">
                      <Upload className="h-4 w-4 text-red-600" />
                      <span>Upload video/image</span>
                      <input
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {selectedOrder.processingVideoUrl && (
                      <a
                        href={selectedOrder.processingVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <Video className="h-4 w-4" />View current
                      </a>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Order Timeline</p>
                  <div className="space-y-2">
                    {selectedOrder.events.map((event) => (
                      <div key={event.id} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3.5 w-3.5 text-red-600" />
                        <span>{event.description}</span>
                        <span className="ml-auto text-[11px] text-gray-400">
                          {new Date(event.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    {selectedOrder.events.length === 0 && (
                      <p className="text-xs text-gray-400">No events logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
