'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type MetricType = 'productivity' | 'efficiency' | 'savings' | 'satisfaction';

interface Metric {
  name: string;
  color: string;
  value: number;
  change: number;
}

const monthlyData = [
  {
    month: 'Jan',
    productivity: 20,
    efficiency: 24,
    savings: 35,
    satisfaction: 80,
  },
  {
    month: 'Feb',
    productivity: 45,
    efficiency: 38,
    savings: 42,
    satisfaction: 82,
  },
  {
    month: 'Mar',
    productivity: 62,
    efficiency: 54,
    savings: 55,
    satisfaction: 85,
  },
  {
    month: 'Apr',
    productivity: 78,
    efficiency: 70,
    savings: 67,
    satisfaction: 88,
  },
  {
    month: 'May',
    productivity: 85,
    efficiency: 82,
    savings: 78,
    satisfaction: 90,
  },
  {
    month: 'Jun',
    productivity: 92,
    efficiency: 88,
    savings: 85,
    satisfaction: 95,
  },
];

const metrics: Record<MetricType, Metric> = {
  productivity: {
    name: 'Productivity Increase',
    color: 'hsl(var(--primary))',
    value: 92,
    change: 15,
  },
  efficiency: {
    name: 'Efficiency Gain',
    color: 'hsl(var(--secondary))',
    value: 88,
    change: 12,
  },
  savings: {
    name: 'Cost Savings',
    color: 'hsl(var(--accent))',
    value: 85,
    change: 20,
  },
  satisfaction: {
    name: 'User Satisfaction',
    color: 'hsl(var(--chart-1))',
    value: 95,
    change: 8,
  },
};

const pieData = [
  { name: 'Planning Time', value: 40 },
  { name: 'Development', value: 25 },
  { name: 'Review', value: 20 },
  { name: 'Deployment', value: 15 },
];

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export function ResultsGraph() {
  const [activeMetric, setActiveMetric] = useState<MetricType>('productivity');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  interface TooltipEntry {
    name: string;
    value: number;
    color: string;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none p-2 shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-medium">{label}</p>
            {payload.map((entry: TooltipEntry, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}%`}
              </p>
            ))}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Metrics Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(metrics) as MetricType[]).map((key) => {
          const metric = metrics[key];
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveMetric(key)}
              className="cursor-pointer"
            >
              <Card className={activeMetric === key ? 'border-primary' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{metric.name}</p>
                    <Badge
                      variant={metric.change > 0 ? 'default' : 'destructive'}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </Badge>
                  </div>
                  <p
                    className="mt-2 text-2xl font-bold"
                    style={{ color: metric.color }}
                  >
                    {metric.value}%
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Track key performance indicators over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="area" className="space-y-4">
            <TabsList>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <div className="h-[400px]">
              <AnimatePresence mode="wait">
                <TabsContent value="area" className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        {(Object.keys(metrics) as MetricType[]).map((key) => (
                          <linearGradient
                            key={key}
                            id={`color${key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={metrics[key].color}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={metrics[key].color}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {(Object.keys(metrics) as MetricType[]).map((key) => (
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={metrics[key].color}
                          fill={`url(#color${key})`}
                          strokeWidth={2}
                          fillOpacity={1}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="line" className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {(Object.keys(metrics) as MetricType[]).map((key) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={metrics[key].color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="bar" className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {(Object.keys(metrics) as MetricType[]).map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={metrics[key].color}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="distribution" className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={hoveredIndex === index ? 1 : 0.8}
                            stroke={
                              hoveredIndex === index
                                ? COLORS[index % COLORS.length]
                                : 'none'
                            }
                            strokeWidth={hoveredIndex === index ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
