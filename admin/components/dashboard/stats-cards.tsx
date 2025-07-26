"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package 
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: number;
  trendLabel: string;
}

function StatCard({ title, value, description, icon, trend, trendLabel }: StatCardProps) {
  const trendColor = trend >= 0 ? "text-green-600" : "text-red-600";
  const trendIcon = trend >= 0 ? "↑" : "↓";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="flex items-center text-xs">
          <span className={`font-medium mr-1 ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
          {trendLabel}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        description="Monthly revenue"
        icon={<DollarSign className="h-4 w-4" />}
        trend={12}
        trendLabel="from last month"
      />
      <StatCard
        title="New Orders"
        value="356"
        description="New orders this week"
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={8}
        trendLabel="from last week"
      />
      <StatCard
        title="Sales Conversion"
        value="3.2%"
        description="Conversion rate"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={-1.1}
        trendLabel="from yesterday"
      />
      <StatCard
        title="Products in Stock"
        value="142"
        description="Different products"
        icon={<Package className="h-4 w-4" />}
        trend={4}
        trendLabel="new products added"
      />
    </div>
  );
}