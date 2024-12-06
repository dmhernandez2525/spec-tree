'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data - replace with actual API data
const projectData = [
  { month: 'Jan', completed: 4, active: 3, planned: 2 },
  { month: 'Feb', completed: 3, active: 4, planned: 3 },
  { month: 'Mar', completed: 5, active: 2, planned: 4 },
  { month: 'Apr', completed: 6, active: 3, planned: 2 },
  { month: 'May', completed: 4, active: 5, planned: 3 },
  { month: 'Jun', completed: 7, active: 2, planned: 4 },
];

const workItemData = [
  { month: 'Jan', epics: 2, features: 8, stories: 24, tasks: 64 },
  { month: 'Feb', epics: 3, features: 12, stories: 36, tasks: 96 },
  { month: 'Mar', epics: 2, features: 10, stories: 30, tasks: 80 },
  { month: 'Apr', epics: 4, features: 16, stories: 48, tasks: 128 },
  { month: 'May', epics: 3, features: 12, stories: 36, tasks: 96 },
  { month: 'Jun', epics: 5, features: 20, stories: 60, tasks: 160 },
];

const aiUsageData = [
  { month: 'Jan', contextGenerated: 45, questionsAsked: 120, accuracy: 92 },
  { month: 'Feb', contextGenerated: 52, questionsAsked: 140, accuracy: 94 },
  { month: 'Mar', contextGenerated: 48, questionsAsked: 130, accuracy: 93 },
  { month: 'Apr', contextGenerated: 60, questionsAsked: 160, accuracy: 95 },
  { month: 'May', contextGenerated: 55, questionsAsked: 150, accuracy: 94 },
  { month: 'Jun', contextGenerated: 65, questionsAsked: 170, accuracy: 96 },
];

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
}

const MetricCard = ({ title, value, description, trend }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {trend && (
        <span
          className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value="12"
          description="+2 from last month"
          trend={8}
        />
        <MetricCard
          title="Completion Rate"
          value="92%"
          description="Average across all projects"
          trend={5}
        />
        <MetricCard
          title="AI Context Usage"
          value="450"
          description="Total contexts generated"
          trend={12}
        />
        <MetricCard
          title="Team Efficiency"
          value="87%"
          description="Based on delivery times"
          trend={3}
        />
      </div>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="hsl(var(--secondary))"
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="hsl(var(--muted-foreground))"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Work Items Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Work Items Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workItemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="epics" fill="hsl(var(--primary))" />
                <Bar dataKey="features" fill="hsl(var(--secondary))" />
                <Bar dataKey="stories" fill="hsl(var(--accent))" />
                <Bar dataKey="tasks" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="contextGenerated"
                  stroke="hsl(var(--primary))"
                  name="Contexts Generated"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="questionsAsked"
                  stroke="hsl(var(--secondary))"
                  name="Questions Asked"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--accent))"
                  name="Accuracy (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
