"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  LayoutDashboard,
  ShoppingBasket,
  Package,
  Users,
  Settings,
  FileCog,
  TrendingUp,
  Tag,
  Truck,
  BadgeCheck,
  LayoutList,
  Shield,
  Fish,
  Star,
  BookOpen,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
    const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Analytics",
      icon: TrendingUp,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      label: "Products",
      icon: Package,
      href: "/dashboard/products",
      active: pathname === "/dashboard/products",
    },
    {
      label: "Categories",
      icon: LayoutList,
      href: "/dashboard/categories",
      active: pathname === "/dashboard/categories",
    },
    {
      label: "Fish Picks",
      icon: Fish,
      href: "/dashboard/fish-picks",
      active: pathname === "/dashboard/fish-picks",
    },
    {
      label: "Featured Fish",
      icon: Star,
      href: "/dashboard/featured-fish",
      active: pathname === "/dashboard/featured-fish",
    },
    {
      label: "Orders",
      icon: ShoppingBasket,
      href: "/dashboard/orders",
      active: pathname === "/dashboard/orders",
    },
    {
      label: "Inventory",
      icon: Tag,
      href: "/dashboard/inventory",
      active: pathname === "/dashboard/inventory",
    },
    {
      label: "Shipping",
      icon: Truck,
      href: "/dashboard/shipping",
      active: pathname === "/dashboard/shipping",
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    },
    {
      label: "Trusted Badges",
      icon: Shield,
      href: "/dashboard/trusted-badges",
      active: pathname === "/dashboard/trusted-badges",
    },
    {
      label: "Blog Posts",
      icon: BookOpen,
      href: "/dashboard/blog-posts",
      active: pathname === "/dashboard/blog-posts",
    },
    {
      label: "Media",
      icon: Image,
      href: "/dashboard/media",
      active: pathname === "/dashboard/media",
    },
    {
      label: "Content",
      icon: FileCog,
      href: "/dashboard/content",
      active: pathname.startsWith("/dashboard/content"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {routes.map((route) => (
        <Link 
          key={route.href} 
          href={route.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-secondary-foreground",
            route.active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
          )}
        >
          <route.icon className="w-5 h-5 mr-3" />
          {route.label}
        </Link>
      ))}
    </nav>
  );
} 