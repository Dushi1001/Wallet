import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

// Sample data for chart (would come from API in real implementation)
const generateSampleData = (range: TimeRange) => {
  const now = new Date();
  const data: { date: string; value: number }[] = [];
  
  let points = 0;
  let interval = 0;
  let startValue = 35000;
  let volatility = 0;
  
  switch (range) {
    case "1D":
      points = 24;
      interval = 60 * 60 * 1000; // 1 hour
      volatility = 0.002;
      break;
    case "1W":
      points = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day
      volatility = 0.01;
      break;
    case "1M":
      points = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day
      volatility = 0.02;
      break;
    case "3M":
      points = 12;
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week
      volatility = 0.04;
      break;
    case "1Y":
      points = 12;
      interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
      volatility = 0.06;
      break;
    case "ALL":
      points = 10;
      interval = 365 * 24 * 60 * 60 * 1000; // ~1 year
      volatility = 0.1;
      break;
  }
  
  let value = startValue;
  
  for (let i = points - 1; i >= 0; i--) {
    const dateObj = new Date(now.getTime() - i * interval);
    const change = (Math.random() - 0.45) * volatility * value;
    value += change;
    
    // Format the date according to the range
    let formattedDate = '';
    if (range === "1D") {
      formattedDate = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (range === "1W" || range === "1M") {
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    
    data.push({
      date: formattedDate,
      value: Math.max(0, value),
    });
  }
  
  return data;
};

export default function PortfolioChart() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/portfolio/chart", timeRange],
    queryFn: () => generateSampleData(timeRange),
    enabled: !!user,
  });
  
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 border border-border rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            {formatTooltipValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="xl:col-span-2 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold">Portfolio Performance</h2>
        <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
          <ToggleGroupItem value="1D" variant={timeRange === "1D" ? "default" : "outline"} size="sm">1D</ToggleGroupItem>
          <ToggleGroupItem value="1W" variant={timeRange === "1W" ? "default" : "outline"} size="sm">1W</ToggleGroupItem>
          <ToggleGroupItem value="1M" variant={timeRange === "1M" ? "default" : "outline"} size="sm">1M</ToggleGroupItem>
          <ToggleGroupItem value="3M" variant={timeRange === "3M" ? "default" : "outline"} size="sm">3M</ToggleGroupItem>
          <ToggleGroupItem value="1Y" variant={timeRange === "1Y" ? "default" : "outline"} size="sm">1Y</ToggleGroupItem>
          <ToggleGroupItem value="ALL" variant={timeRange === "ALL" ? "default" : "outline"} size="sm">All</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="h-[300px] w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dx={-10}
                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
