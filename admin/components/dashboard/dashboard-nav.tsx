"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Fish, 
  ShoppingCart, 
  Users, 
  LayoutTemplate, 
  BarChart3, 
  Settings, 
  Package, 
  Tag, 
  Truck,
  ImageIcon,
  Award,
  Activity,
  Star,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: <Fish className="mr-2 h-4 w-4" />,
  },
  {
    title: "Fish Picks",
    href: "/dashboard/fish-picks",
    icon: <Fish className="mr-2 h-4 w-4" />,
  },
  {
    title: "Featured Fish",
    href: "/dashboard/featured-fish",
    icon: <Star className="mr-2 h-4 w-4" />,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="mr-2 h-4 w-4" />,
  },  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: <Users className="mr-2 h-4 w-4" />,
  },  {
    title: "User Activity",
    href: "/dashboard/user-activity",
    icon: <Activity className="mr-2 h-4 w-4" />,
  },
  {
    title: "Blog Posts",
    href: "/dashboard/blog-posts",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  {
    title: "Content",
    href: "/dashboard/content",
    icon: <LayoutTemplate className="mr-2 h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
  },
];

const configNavItems: NavItem[] = [
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: <Tag className="mr-2 h-4 w-4" />,
  },
  {
    title: "Trusted Badges",
    href: "/dashboard/trusted-badges",
    icon: <Award className="mr-2 h-4 w-4" />,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: <Package className="mr-2 h-4 w-4" />,
  },
  {
    title: "Shipping",
    href: "/dashboard/shipping",
    icon: <Truck className="mr-2 h-4 w-4" />,
  },
  {
    title: "Media Library",
    href: "/dashboard/media",
    icon: <ImageIcon className="mr-2 h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
  {
    title: "System Test",
    href: "/dashboard/system-test",
    icon: <Activity className="mr-2 h-4 w-4" />,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4">
      {/* Logo Section */}
      <div className="flex h-12 sm:h-16 items-center px-2 sm:px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Fish className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
          <span className="text-base sm:text-lg font-bold text-red-700 dark:text-red-300">
            Kadal Thunai
          </span>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="px-2 sm:px-4 text-xs font-semibold uppercase text-muted-foreground">
          Main
        </p>
        <nav className="grid gap-1 px-1 sm:px-2">
          {mainNavItems.map((item, index) => (
            <Button
              key={index}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "justify-start hover:bg-red-50 hover:text-red-700 h-9 sm:h-10 text-sm",
                pathname === item.href && "font-semibold bg-red-100 text-red-700"
              )}
              asChild
            >
              <Link href={item.href}>
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Configuration Navigation */}
      <div className="space-y-1">
        <p className="px-2 sm:px-4 text-xs font-semibold uppercase text-muted-foreground">
          Configuration
        </p>
        <nav className="grid gap-1 px-1 sm:px-2">
          {configNavItems.map((item, index) => (
            <Button
              key={index}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "justify-start hover:bg-red-50 hover:text-red-700 h-9 sm:h-10 text-sm",
                pathname === item.href && "font-semibold bg-red-100 text-red-700"
              )}
              asChild
            >
              <Link href={item.href}>
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}