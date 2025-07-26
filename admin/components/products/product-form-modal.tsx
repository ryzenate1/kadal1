"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Upload, X, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/apiUtils";

// Use environment variable with fallback
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  sale_price: z.coerce.number().positive({
    message: "Sale price must be a positive number.",
  }).optional().nullable(),
  stock: z.coerce.number().int().nonnegative({
    message: "Stock must be a non-negative integer.",
  }),
  featured: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  status: z.enum(["active", "out_of_stock", "hidden"]),
  imageUrl: z.string().optional(),
});

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  mode: "add" | "edit";
  onSubmitSuccess: (data: z.infer<typeof formSchema>, images: { url: string; main: boolean }[]) => void;
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  mode,
  onSubmitSuccess,
}: ProductFormModalProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<{ url: string; main: boolean }[]>(
    product?.image
      ? [{ url: product.image, main: true }]
      : []
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === "edit" && product
      ? {
          name: product.name,
          description: product.description || "",
          category: product.category || "",
          price: product.price,
          sale_price: product.sale_price,
          stock: product.stock,
          featured: product.featured,
          seasonal: product.seasonal,
          status: product.status,
        }
      : {
          name: "",
          description: "",
          category: "",
          price: 0,
          sale_price: null,
          stock: 0,
          featured: false,
          seasonal: false,
          status: "active",
        },
  });

  useEffect(() => {
    if (open && mode === "add") {
      form.reset({
        name: "",
        description: "",
        category: "",
        price: 0,
        sale_price: null,
        stock: 0,
        featured: false,
        seasonal: false,
        status: "active",
      });
      setImages([]);
      setImageUrl("");
    } else if (open && mode === "edit" && product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        price: product.price,
        sale_price: product.sale_price,
        stock: product.stock,
        featured: product.featured,
        seasonal: product.seasonal,
        status: product.status,
      });
      setImages(product?.image ? [{ url: product.image, main: true }] : []);
      setImageUrl("");
    }
  }, [open, mode, product, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitSuccess(values, images);
  }

  const addImage = () => {
    if (imageUrl.trim() !== "") {
      setImages([...images, { url: imageUrl, main: images.length === 0 }]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    if (newImages.length > 0 && images[index].main) {
      newImages[0].main = true;
    }
    
    setImages(newImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((image, i) => ({
      ...image,
      main: i === index,
    }));
    setImages(newImages);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setUploadError("");
      
      if (!file) {
        setUploadError("No file selected");
        return;
      }
      
      // Validate file type
      const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validImageTypes.includes(file.type)) {
        setUploadError("Please upload a valid image file (JPEG, PNG, WebP, or GIF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image file size should be less than 5MB");
        return;
      }
        // Use the uploadFileWithAuth utility function
      const uploadResponse = await adminApi.uploadFileWithAuth(
        `/upload/product`,
        file,
        { type: "product" }
      );
      
      // Handle successful upload
      if (uploadResponse && uploadResponse.url) {
        form.setValue("imageUrl", uploadResponse.url);
        setImageUrl(uploadResponse.url);
        setPreviewUrl(URL.createObjectURL(file));
        
        toast({
          title: "Image Uploaded",
          description: "Product image has been uploaded successfully.",
        });
      } else {
        throw new Error("Failed to get upload URL");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload image. Please try again.");
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new seafood product to your catalog."
              : "Update the details of your existing product."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Atlantic Salmon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product..."
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fish">Fish</SelectItem>
                            <SelectItem value="Shellfish">Shellfish</SelectItem>
                            <SelectItem value="Crustaceans">Crustaceans</SelectItem>
                            <SelectItem value="Mollusks">Mollusks</SelectItem>
                            <SelectItem value="Prepared">Prepared</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 24.99" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} value={field.value === null ? '' : field.value} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                        </FormControl>
                        <FormDescription>Optional sale price.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Product Images</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImage}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    In a production app, you would upload images to Cloudinary
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative group rounded-md overflow-hidden border",
                          image.main && "ring-2 ring-blue-500"
                        )}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!image.main && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setMainImage(index)}
                            >
                              Set as Main
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        {image.main && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs py-0.5 px-2 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Product Options</h3>
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Product</FormLabel>
                          <FormDescription>
                            Mark this product as featured on your storefront.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seasonal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Seasonal Product</FormLabel>
                          <FormDescription>
                            Indicate if this product is only available during certain seasons.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {mode === "add" ? "Add Product" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}