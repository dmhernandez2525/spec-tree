'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// AI Model pricing (per 1K tokens)
const MODEL_PRICING = {
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  // Gemini
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-2.0-flash-exp': { input: 0.0001, output: 0.0004 },
};

// Mock usage data - in production this would come from an API
const mockUsageData = {
  currentMonth: {
    totalCost: 127.45,
    budget: 200,
    tokensUsed: {
      input: 2450000,
      output: 820000,
    },
    byProvider: {
      openai: { cost: 65.20, tokens: { input: 1200000, output: 380000 } },
      anthropic: { cost: 42.15, tokens: { input: 850000, output: 290000 } },
      gemini: { cost: 20.10, tokens: { input: 400000, output: 150000 } },
    },
    byModel: [
      { model: 'gpt-4o', requests: 245, cost: 42.50 },
      { model: 'claude-3-5-sonnet', requests: 312, cost: 35.80 },
      { model: 'gpt-4o-mini', requests: 890, cost: 22.70 },
      { model: 'gemini-1.5-pro', requests: 156, cost: 12.45 },
      { model: 'gemini-1.5-flash', requests: 423, cost: 7.65 },
      { model: 'claude-3-haiku', requests: 234, cost: 6.35 },
    ],
    dailyUsage: [
      { date: 'Mon', openai: 12.5, anthropic: 8.2, gemini: 3.4 },
      { date: 'Tue', openai: 15.3, anthropic: 9.1, gemini: 4.2 },
      { date: 'Wed', openai: 8.7, anthropic: 6.5, gemini: 2.8 },
      { date: 'Thu', openai: 11.2, anthropic: 7.8, gemini: 3.1 },
      { date: 'Fri', openai: 14.8, anthropic: 8.9, gemini: 3.9 },
      { date: 'Sat', openai: 5.2, anthropic: 3.4, gemini: 1.8 },
      { date: 'Sun', openai: 4.1, anthropic: 2.8, gemini: 1.2 },
    ],
  },
  monthlyTrend: [
    { month: 'Sep', cost: 89.50 },
    { month: 'Oct', cost: 105.20 },
    { month: 'Nov', cost: 118.75 },
    { month: 'Dec', cost: 122.30 },
    { month: 'Jan', cost: 127.45 },
  ],
};

const PROVIDER_COLORS = {
  openai: '#10B981',
  anthropic: '#F59E0B',
  gemini: '#3B82F6',
};

const PIE_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

export function CostTrackingPanel() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const data = mockUsageData;
  const budgetUsagePercent = (data.currentMonth.totalCost / data.currentMonth.budget) * 100;

  const providerData = [
    { name: 'OpenAI', value: data.currentMonth.byProvider.openai.cost, color: PROVIDER_COLORS.openai },
    { name: 'Anthropic', value: data.currentMonth.byProvider.anthropic.cost, color: PROVIDER_COLORS.anthropic },
    { name: 'Gemini', value: data.currentMonth.byProvider.gemini.cost, color: PROVIDER_COLORS.gemini },
  ];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatTokens = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">AI Cost Tracking</h3>
          <p className="text-muted-foreground">Monitor your AI usage and costs across providers</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.currentMonth.totalCost)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{budgetUsagePercent.toFixed(0)}%</div>
              <Badge variant={budgetUsagePercent > 80 ? 'destructive' : 'secondary'}>
                {formatCurrency(data.currentMonth.budget - data.currentMonth.totalCost)} left
              </Badge>
            </div>
            <Progress value={budgetUsagePercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Input Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokens(data.currentMonth.tokensUsed.input)}</div>
            <p className="text-xs text-muted-foreground">Total input tokens used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Output Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokens(data.currentMonth.tokensUsed.output)}</div>
            <p className="text-xs text-muted-foreground">Total output tokens used</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Provider & Model */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Provider</CardTitle>
            <CardDescription>Breakdown of spending across AI providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {providerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {providerData.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: provider.color }}
                    />
                    <span className="text-sm">{provider.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(provider.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
            <CardDescription>Detailed breakdown by AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.currentMonth.byModel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="model" width={100} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Model: ${label}`}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                    {data.currentMonth.byModel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend</CardTitle>
          <CardDescription>Daily spending breakdown by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.currentMonth.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="openai" name="OpenAI" stackId="a" fill={PROVIDER_COLORS.openai} />
                <Bar dataKey="anthropic" name="Anthropic" stackId="a" fill={PROVIDER_COLORS.anthropic} />
                <Bar dataKey="gemini" name="Gemini" stackId="a" fill={PROVIDER_COLORS.gemini} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Trend</CardTitle>
          <CardDescription>Cost trends over the past months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Provider</CardTitle>
          <CardDescription>Input and output token breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(data.currentMonth.byProvider).map(([provider, usage]) => (
              <div key={provider} className="space-y-3 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS] }}
                  />
                  <span className="font-medium capitalize">{provider}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Input Tokens</p>
                    <p className="font-medium">{formatTokens(usage.tokens.input)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Output Tokens</p>
                    <p className="font-medium">{formatTokens(usage.tokens.output)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Cost</p>
                  <p className="text-lg font-bold">{formatCurrency(usage.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Pricing Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Model Pricing Reference</CardTitle>
          <CardDescription>Current pricing per 1K tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(MODEL_PRICING).map(([model, pricing]) => (
              <div key={model} className="flex items-center justify-between p-2 rounded border text-sm">
                <span className="font-medium">{model}</span>
                <div className="text-muted-foreground">
                  <span>${pricing.input.toFixed(5)}</span>
                  <span className="mx-1">/</span>
                  <span>${pricing.output.toFixed(5)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CostTrackingPanel;
