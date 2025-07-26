"use client";

import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample data - would come from an API in a real application
const data = [
  {
    name: "Jan",
    revenue: 4000,
    profit: 2400,
  },
  {
    name: "Feb",
    revenue: 3000,
    profit: 1398,
  },
  {
    name: "Mar",
    revenue: 2000,
    profit: 9800,
  },
  {
    name: "Apr",
    revenue: 2780,
    profit: 3908,
  },
  {
    name: "May",
    revenue: 1890,
    profit: 4800,
  },
  {
    name: "Jun",
    revenue: 2390,
    profit: 3800,
  },
  {
    name: "Jul",
    revenue: 3490,
    profit: 4300,
  },
  {
    name: "Aug",
    revenue: 4000,
    profit: 2400,
  },
  {
    name: "Sep",
    revenue: 3000,
    profit: 1398,
  },
  {
    name: "Oct",
    revenue: 2000,
    profit: 9800,
  },
  {
    name: "Nov",
    revenue: 2780,
    profit: 3908,
  },
  {
    name: "Dec",
    revenue: 1890,
    profit: 4800,
  },
];

export function RevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#e2e8f0" : "#334155";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  return (
    <div className="h-[300px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={textColor} />
          <YAxis
            stroke={textColor}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: gridColor,
              color: textColor,
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            name="Total Revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="2"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2))"
            fillOpacity={0.3}
            name="Net Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}