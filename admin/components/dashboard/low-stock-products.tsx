"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fish, AlertTriangle } from "lucide-react";

// Sample data - would come from an API in a real application
const lowStockProducts = [
  {
    id: "PROD-101",
    name: "Atlantic Salmon",
    category: "Fish",
    stock: 5,
    threshold: 10,
    price: 24.99,
  },
  {
    id: "PROD-203",
    name: "Jumbo Shrimp",
    category: "Shellfish",
    stock: 8,
    threshold: 15,
    price: 19.95,
  },
  {
    id: "PROD-155",
    name: "Fresh Tuna Steaks",
    category: "Fish",
    stock: 3,
    threshold: 8,
    price: 32.50,
  },
  {
    id: "PROD-187",
    name: "Maine Lobster",
    category: "Shellfish",
    stock: 2,
    threshold: 5,
    price: 44.99,
  },
  {
    id: "PROD-122",
    name: "Alaskan King Crab",
    category: "Shellfish",
    stock: 4,
    threshold: 10,
    price: 59.95,
  },
];

function getStockLevel(current: number, threshold: number) {
  const percentage = (current / threshold) * 100;
  if (percentage <= 20) {
    return "critical";
  } else if (percentage <= 50) {
    return "low";
  } else {
    return "warning";
  }
}

function getStockLevelColor(level: string) {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "low":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

export function LowStockProducts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Low Stock Products
          </CardTitle>
          <CardDescription>
            Products that need to be restocked soon.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.map((product) => {
              const level = getStockLevel(product.stock, product.threshold);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center">
                    <Fish className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getStockLevelColor(level)}
                      >
                        {product.stock}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        / {product.threshold}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm">
            Manage inventory
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}