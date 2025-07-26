"use client";

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ApiStatus } from '@/components/dashboard/api-status';
import { 
  AlertTriangle, 
  Truck, 
  Globe, 
  Plus, 
  Map, 
  SaveIcon, 
  Trash2, 
  Info,
  Loader2, 
  Edit,
  Compass
} from 'lucide-react';

// Sample shipping zone data
interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: ShippingMethod[];
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  freeOver?: number;
  status: 'active' | 'inactive';
}

const defaultShippingZones: ShippingZone[] = [
  {
    id: 'zone-1',
    name: 'Chennai Local',
    regions: ['Chennai', 'Tambaram', 'Porur', 'Adyar'],
    methods: [
      {
        id: 'method-1-1',
        name: 'Standard Delivery',
        description: 'Delivery within 24 hours',
        price: 50,
        freeOver: 500,
        status: 'active'
      },
      {
        id: 'method-1-2',
        name: 'Express Delivery',
        description: 'Same day delivery',
        price: 100,
        status: 'active'
      }
    ]
  },
  {
    id: 'zone-2',
    name: 'Tamil Nadu',
    regions: ['Coimbatore', 'Madurai', 'Salem', 'Tirunelveli'],
    methods: [
      {
        id: 'method-2-1',
        name: 'Standard Shipping',
        description: 'Delivery within 2-3 days',
        price: 100,
        freeOver: 1000,
        status: 'active'
      }
    ]
  },
  {
    id: 'zone-3',
    name: 'Rest of India',
    regions: ['All other regions'],
    methods: [
      {
        id: 'method-3-1',
        name: 'Standard Shipping',
        description: 'Delivery within 3-5 days',
        price: 150,
        freeOver: 2000,
        status: 'active'
      },
      {
        id: 'method-3-2',
        name: 'Express Shipping',
        description: 'Delivery within 1-2 days',
        price: 300,
        status: 'inactive'
      }
    ]
  }
];

export default function ShippingPage() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(defaultShippingZones);
  const [activeTab, setActiveTab] = useState('zones');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // General shipping settings
  const [generalSettings, setGeneralSettings] = useState({
    enableFreeShipping: true,
    freeShippingThreshold: '1000',
    defaultShippingFee: '100',
    enableShippingCalculator: true,
    allowLocalPickup: true,
    localPickupAddress: 'Shop #4, Marina Beach Market, Chennai',
    hideShippingUntilAddress: false,
  });

  // New zone form state
  const [newZone, setNewZone] = useState({
    name: '',
    regions: '',
  });

  // Function to add a new shipping zone
  const handleAddZone = () => {
    if (!newZone.name || !newZone.regions) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and at least one region.",
        variant: "destructive",
      });
      return;
    }

    const zoneId = `zone-${Date.now()}`;
    const zone: ShippingZone = {
      id: zoneId,
      name: newZone.name,
      regions: newZone.regions.split(',').map(r => r.trim()),
      methods: [],
    };

    setShippingZones([...shippingZones, zone]);
    setNewZone({ name: '', regions: '' });
    setEditingZoneId(zoneId);
    
    toast({
      title: "Zone Added",
      description: `Shipping zone "${zone.name}" has been added.`,
    });
  };

  // Function to delete a zone
  const handleDeleteZone = (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;
    
    setShippingZones(zones => zones.filter(zone => zone.id !== id));
    
    if (editingZoneId === id) {
      setEditingZoneId(null);
    }
    
    toast({
      title: "Zone Deleted",
      description: "Shipping zone has been deleted.",
    });
  };

  // Function to update zone details
  const handleUpdateZone = (id: string, field: string, value: string) => {
    setShippingZones(zones => 
      zones.map(zone => 
        zone.id === id 
          ? { 
              ...zone, 
              [field]: field === 'regions' 
                ? value.split(',').map(r => r.trim()) 
                : value 
            } 
          : zone
      )
    );
  };

  // Functions for shipping methods
  const handleAddMethod = (zoneId: string) => {
    const methodId = `method-${zoneId}-${Date.now()}`;
    const newMethod: ShippingMethod = {
      id: methodId,
      name: 'New Shipping Method',
      description: 'Description',
      price: 0,
      status: 'inactive'
    };
    
    setShippingZones(zones => 
      zones.map(zone => 
        zone.id === zoneId 
          ? { ...zone, methods: [...zone.methods, newMethod] }
          : zone
      )
    );
    
    setEditingMethodId(methodId);
  };

  const handleUpdateMethod = (zoneId: string, methodId: string, field: string, value: any) => {
    setShippingZones(zones => 
      zones.map(zone => 
        zone.id === zoneId 
          ? { 
              ...zone, 
              methods: zone.methods.map(method => 
                method.id === methodId 
                  ? { ...method, [field]: field === 'price' || field === 'freeOver' || field === 'minOrderValue' || field === 'maxOrderValue' ? parseFloat(value) : value }
                  : method
              )
            }
          : zone
      )
    );
  };

  const handleDeleteMethod = (zoneId: string, methodId: string) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    
    setShippingZones(zones => 
      zones.map(zone => 
        zone.id === zoneId 
          ? { 
              ...zone, 
              methods: zone.methods.filter(method => method.id !== methodId)
            }
          : zone
      )
    );
    
    if (editingMethodId === methodId) {
      setEditingMethodId(null);
    }
    
    toast({
      title: "Method Deleted",
      description: "Shipping method has been deleted.",
    });
  };

  // Save all shipping settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would send the data to your API
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your shipping settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shipping settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">      <DashboardHeader
        title="Shipping Management"
        description="Configure your store's shipping zones, rates, and delivery options."
        actions={
          <div className="flex items-center">
            <Truck className="h-6 w-6 mr-2" />
          </div>
        }
      />

      {/* API Connection Status */}
      <ApiStatus endpoint="shipping" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="zones" className="flex items-center gap-1">
            <Map size={16} /> Shipping Zones
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Globe size={16} /> General Settings
          </TabsTrigger>
        </TabsList>

        {/* Shipping Zones Tab */}
        <TabsContent value="zones" className="space-y-4 mt-6">
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-lg">Add New Shipping Zone</CardTitle>
              <CardDescription>Define regions where you ship products and set specific shipping rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-zone-name">Zone Name</Label>
                  <Input 
                    id="new-zone-name" 
                    placeholder="e.g., Local Chennai Area" 
                    value={newZone.name}
                    onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="new-zone-regions">Regions (comma separated)</Label>
                  <Input 
                    id="new-zone-regions" 
                    placeholder="e.g., Chennai, Tambaram, Adyar" 
                    value={newZone.regions}
                    onChange={(e) => setNewZone(prev => ({ ...prev, regions: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddZone}>
                <Plus className="h-4 w-4 mr-1" /> Add Zone
              </Button>
            </CardFooter>
          </Card>

          {shippingZones.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <Compass className="h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No Shipping Zones Defined</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Add your first shipping zone to get started.</p>
              </div>
            </Card>
          ) : (
            shippingZones.map((zone) => (
              <Card key={zone.id} className="mb-6">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle>{zone.name}</CardTitle>
                    <CardDescription>
                      Regions: {zone.regions.join(', ')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingZoneId(editingZoneId === zone.id ? null : zone.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> 
                      {editingZoneId === zone.id ? 'Done' : 'Edit'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700" 
                      onClick={() => handleDeleteZone(zone.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardHeader>

                {editingZoneId === zone.id && (
                  <CardContent className="border-t pt-4 pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`zone-name-${zone.id}`}>Zone Name</Label>
                        <Input 
                          id={`zone-name-${zone.id}`} 
                          value={zone.name}
                          onChange={(e) => handleUpdateZone(zone.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`zone-regions-${zone.id}`}>Regions (comma separated)</Label>
                        <Input 
                          id={`zone-regions-${zone.id}`} 
                          value={zone.regions.join(', ')}
                          onChange={(e) => handleUpdateZone(zone.id, 'regions', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}

                <CardContent className={editingZoneId === zone.id ? "pt-0" : undefined}>
                  <div className="mt-2 border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium">Shipping Methods</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddMethod(zone.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Method
                      </Button>
                    </div>

                    {zone.methods.length > 0 ? (
                      <div className="space-y-4">
                        {zone.methods.map((method) => (
                          <div 
                            key={method.id} 
                            className={`border rounded-lg p-4 ${editingMethodId === method.id ? 'border-blue-300 bg-blue-50' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">
                                  {method.name}
                                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                    method.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {method.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                </h5>
                                <p className="text-sm text-gray-500">{method.description}</p>
                                <div className="text-sm mt-1">
                                  <span className="font-semibold">₹{method.price}</span>
                                  {method.freeOver && <span className="text-green-600 ml-1"> (Free over ₹{method.freeOver})</span>}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setEditingMethodId(editingMethodId === method.id ? null : method.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700" 
                                  onClick={() => handleDeleteMethod(zone.id, method.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {editingMethodId === method.id && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`method-name-${method.id}`}>Method Name</Label>
                                    <Input 
                                      id={`method-name-${method.id}`}
                                      value={method.name}
                                      onChange={(e) => handleUpdateMethod(zone.id, method.id, 'name', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`method-status-${method.id}`}>Status</Label>
                                    <Select 
                                      value={method.status} 
                                      onValueChange={(value: 'active' | 'inactive') => handleUpdateMethod(zone.id, method.id, 'status', value)}
                                    >
                                      <SelectTrigger id={`method-status-${method.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <Label htmlFor={`method-description-${method.id}`}>Description</Label>
                                  <Input 
                                    id={`method-description-${method.id}`}
                                    value={method.description}
                                    onChange={(e) => handleUpdateMethod(zone.id, method.id, 'description', e.target.value)}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <Label htmlFor={`method-price-${method.id}`}>Price (₹)</Label>
                                    <Input 
                                      id={`method-price-${method.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={method.price}
                                      onChange={(e) => handleUpdateMethod(zone.id, method.id, 'price', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`method-freeOver-${method.id}`}>Free Over Amount (₹, optional)</Label>
                                    <Input 
                                      id={`method-freeOver-${method.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={method.freeOver || ''}
                                      onChange={(e) => handleUpdateMethod(zone.id, method.id, 'freeOver', e.target.value || undefined)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <Label htmlFor={`method-minOrder-${method.id}`}>Minimum Order Value (₹, optional)</Label>
                                    <Input 
                                      id={`method-minOrder-${method.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={method.minOrderValue || ''}
                                      onChange={(e) => handleUpdateMethod(zone.id, method.id, 'minOrderValue', e.target.value || undefined)}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`method-maxOrder-${method.id}`}>Maximum Order Value (₹, optional)</Label>
                                    <Input 
                                      id={`method-maxOrder-${method.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={method.maxOrderValue || ''}
                                      onChange={(e) => handleUpdateMethod(zone.id, method.id, 'maxOrderValue', e.target.value || undefined)}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed rounded-md">
                        <p className="text-sm text-gray-500">No shipping methods defined for this zone yet.</p>
                        <Button 
                          variant="link" 
                          onClick={() => handleAddMethod(zone.id)}
                          className="mt-2"
                        >
                          Add your first shipping method
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" /> Save All Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Shipping Options</CardTitle>
              <CardDescription>Configure default options for shipping and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border-b pb-5">
                <h3 className="text-sm font-semibold">Free Shipping</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableFreeShipping">Enable Free Shipping Option</Label>
                    <p className="text-sm text-muted-foreground">Allow free shipping for orders above a certain amount</p>
                  </div>
                  <Switch 
                    id="enableFreeShipping" 
                    checked={generalSettings.enableFreeShipping}
                    onCheckedChange={(checked) => handleSwitchChange('enableFreeShipping', checked)}
                  />
                </div>

                {generalSettings.enableFreeShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-4 border-l-2 border-gray-100">
                    <div>
                      <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                      <Input 
                        id="freeShippingThreshold" 
                        type="number" 
                        min="0" 
                        value={generalSettings.freeShippingThreshold}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, freeShippingThreshold: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Orders above this amount qualify for free shipping</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-b pb-5">
                <h3 className="text-sm font-semibold">Local Pickup</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowLocalPickup">Allow Local Pickup</Label>
                    <p className="text-sm text-muted-foreground">Let customers pick up orders from your physical location</p>
                  </div>
                  <Switch 
                    id="allowLocalPickup" 
                    checked={generalSettings.allowLocalPickup}
                    onCheckedChange={(checked) => handleSwitchChange('allowLocalPickup', checked)}
                  />
                </div>

                {generalSettings.allowLocalPickup && (
                  <div className="pt-2 pl-4 border-l-2 border-gray-100">
                    <Label htmlFor="localPickupAddress">Local Pickup Address</Label>
                    <Input 
                      id="localPickupAddress" 
                      value={generalSettings.localPickupAddress}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, localPickupAddress: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-b pb-5">
                <h3 className="text-sm font-semibold">Default Shipping Options</h3>
                <div>
                  <Label htmlFor="defaultShippingFee">Default Shipping Fee (₹)</Label>
                  <Input 
                    id="defaultShippingFee" 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={generalSettings.defaultShippingFee}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultShippingFee: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Applied when no specific shipping zone matches customer's address</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Miscellaneous Options</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableShippingCalculator">Enable Shipping Calculator</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to calculate shipping costs before checkout</p>
                  </div>
                  <Switch 
                    id="enableShippingCalculator" 
                    checked={generalSettings.enableShippingCalculator}
                    onCheckedChange={(checked) => handleSwitchChange('enableShippingCalculator', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hideShippingUntilAddress">Hide Shipping Until Address Entered</Label>
                    <p className="text-sm text-muted-foreground">Only show shipping options after customer enters their address</p>
                  </div>
                  <Switch 
                    id="hideShippingUntilAddress" 
                    checked={generalSettings.hideShippingUntilAddress}
                    onCheckedChange={(checked) => handleSwitchChange('hideShippingUntilAddress', checked)}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-md bg-amber-50 flex gap-2">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Note on Service Coverage:</p>
                  <p className="mt-1">For fresh seafood delivery, consider temperature control and delivery time constraints when setting up shipping zones. Some areas may require special handling or might not be serviceable for quality reasons.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" /> Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 