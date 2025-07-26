"use client";

import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Sample data - would come from an API in a real application
const data = [
  { name: "Delivered", value: 65 },
  { name: "Shipped", value: 15 },
  { name: "Processing", value: 10 },
  { name: "Pending", value: 10 },
];

export function OrdersOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <div className="h-[300px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              color: isDark ? "#e2e8f0" : "#334155",
            }}
            formatter={(value: number) => [`${value} orders`, undefined]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}