'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
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
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { FeatureTutorialButton } from '@/components/dashboard/tutorial/FeatureTutorialButton';
import { useAchievements } from '@/components/dashboard/achievements/AchievementsProvider';
import { Badge } from '@/components/ui/badge';
import { TutorialProgress } from '@/components/dashboard/tutorial/TutorialProgress';
import { AchievementsDisplay } from '@/components/dashboard/achievements/AchievementsDisplay';
import type {
  TaskMetric,
  GenerationMetric,
  EditMetric,
  TimelineMetric,
  ProjectMetric,
  UserActivityMetric,
} from '@/types/analytics';

// Mock data - replace with real data fetching
const taskMetrics: TaskMetric = {
  totalTasks: 248,
  completedTasks: 183,
  pendingTasks: 65,
  overdueTotal: 12,
  averageCompletionTime: 3.5,
};

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

// Component Definitions
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
  className?: string;
}

const MetricCard = ({
  title,
  value,
  description,
  trend,
  className,
}: MetricCardProps) => (
  <Card className={className}>
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

const generationMetrics: GenerationMetric = {
  totalGenerated: 526,
  epicsGenerated: 24,
  featuresGenerated: 86,
  userStoriesGenerated: 192,
  tasksGenerated: 224,
  averageGenerationTime: 2.3,
  successRate: 94.5,
};

const editMetrics: EditMetric = {
  totalEdits: 834,
  epicsEdited: 45,
  featuresEdited: 156,
  userStoriesEdited: 312,
  tasksEdited: 321,
  averageEditTime: 1.8,
  mostEditedType: 'userStory',
};

const timelineMetrics: TimelineMetric[] = [
  {
    date: '2024-01-01',
    generatedItems: 45,
    editedItems: 23,
    completedItems: 34,
  },
  {
    date: '2024-02-01',
    generatedItems: 52,
    editedItems: 28,
    completedItems: 38,
  },
  {
    date: '2024-03-01',
    generatedItems: 48,
    editedItems: 25,
    completedItems: 36,
  },
];

const projectMetrics: ProjectMetric = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 4,
  averageProjectDuration: 45.5,
  projectSuccessRate: 92.3,
};

const userActivityMetrics: UserActivityMetric = {
  totalUsers: 156,
  activeUsers: 89,
  mostActiveTime: '14:00',
  averageSessionDuration: 42.5,
  userEngagementRate: 78.4,
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { hasUnlockedAchievement } = useAchievements();

  const hasAdvancedAnalytics = hasUnlockedAchievement('analytics-master');
  const hasCustomAnalytics = hasUnlockedAchievement('data-scientist');

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <FeatureTutorialButton featureId="analytics-deep-dive" />
        </div>
        <div className="flex items-center gap-4">
          {hasAdvancedAnalytics && (
            <Badge variant="secondary" className="h-7">
              Advanced Analytics Enabled
            </Badge>
          )}
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value="12"
          description="+2 from last month"
          trend={8}
          className="analytics-metrics"
        />
        <MetricCard
          title="Completion Rate"
          value="92%"
          description="Average across all projects"
          trend={5}
          className="analytics-metrics"
        />
        <MetricCard
          title="AI Context Usage"
          value="450"
          description="Total contexts generated"
          trend={12}
          className="analytics-metrics"
        />
        <MetricCard
          title="Team Efficiency"
          value="87%"
          description="Based on delivery times"
          trend={3}
          className="analytics-metrics"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Generated Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generationMetrics.totalGenerated}
            </div>
            <div className="text-xs text-muted-foreground">
              {generationMetrics.successRate}% success rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Edited Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editMetrics.totalEdits}</div>
            <div className="text-xs text-muted-foreground">
              Avg {editMetrics.averageEditTime} mins per edit
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskMetrics.completedTasks}/{taskMetrics.totalTasks}
            </div>
            <div className="text-xs text-muted-foreground">
              {(
                (taskMetrics.completedTasks / taskMetrics.totalTasks) *
                100
              ).toFixed(1)}
              % completion rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectMetrics.activeProjects}
            </div>
            <div className="text-xs text-muted-foreground">
              {projectMetrics.projectSuccessRate}% success rate
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Project Timeline */}
      <Card className="performance-charts">
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
      {/* Generation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineMetrics}>
                <defs>
                  <linearGradient
                    id="generatedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'PPP')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="generatedItems"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#generatedGradient)"
                  name="Generated Items"
                />
                <Area
                  type="monotone"
                  dataKey="editedItems"
                  stroke="hsl(var(--secondary))"
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.3}
                  name="Edited Items"
                />
                <Area
                  type="monotone"
                  dataKey="completedItems"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.3}
                  name="Completed Items"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Item Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generated Items by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Epics',
                      value: generationMetrics.epicsGenerated,
                    },
                    {
                      name: 'Features',
                      value: generationMetrics.featuresGenerated,
                    },
                    {
                      name: 'User Stories',
                      value: generationMetrics.userStoriesGenerated,
                    },
                    {
                      name: 'Tasks',
                      value: generationMetrics.tasksGenerated,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <TutorialProgress />
              <div className="mt-6">
                <AchievementsDisplay />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edited Items by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Epics',
                      value: editMetrics.epicsEdited,
                    },
                    {
                      name: 'Features',
                      value: editMetrics.featuresEdited,
                    },
                    {
                      name: 'User Stories',
                      value: editMetrics.userStoriesEdited,
                    },
                    {
                      name: 'Tasks',
                      value: editMetrics.tasksEdited,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      // ... previous code remains the same until the User Activity card ...
      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Active Users
              </p>
              <p className="text-2xl font-bold">
                {userActivityMetrics.activeUsers}/
                {userActivityMetrics.totalUsers}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Avg Session Duration
              </p>
              <p className="text-2xl font-bold">
                {userActivityMetrics.averageSessionDuration}m
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Most Active Time
              </p>
              <p className="text-2xl font-bold">
                {userActivityMetrics.mostActiveTime}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Engagement Rate
              </p>
              <p className="text-2xl font-bold">
                {userActivityMetrics.userEngagementRate}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-sm font-medium">
                    {projectMetrics.activeProjects}
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${
                        (projectMetrics.activeProjects /
                          projectMetrics.totalProjects) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed Projects
                  </p>
                  <p className="text-sm font-medium">
                    {projectMetrics.completedProjects}
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${
                        (projectMetrics.completedProjects /
                          projectMetrics.totalProjects) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Project Duration
                </p>
                <p className="text-2xl font-bold">
                  {projectMetrics.averageProjectDuration} days
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Project Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {projectMetrics.projectSuccessRate}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Task Completion Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <p className="text-sm font-medium">Completed Tasks</p>
              </div>
              <p className="text-2xl font-bold">{taskMetrics.completedTasks}</p>
              <p className="text-sm text-muted-foreground">
                Avg completion time: {taskMetrics.averageCompletionTime} days
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-secondary" />
                <p className="text-sm font-medium">Pending Tasks</p>
              </div>
              <p className="text-2xl font-bold">{taskMetrics.pendingTasks}</p>
              <p className="text-sm text-muted-foreground">
                Active in progress tasks
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-destructive" />
                <p className="text-sm font-medium">Overdue Tasks</p>
              </div>
              <p className="text-2xl font-bold">{taskMetrics.overdueTotal}</p>
              <p className="text-sm text-muted-foreground">
                Require immediate attention
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Export Options */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Export as CSV</Button>
        <Button variant="outline">Generate Report</Button>
      </div>
      {/* {hasAdvancedAnalytics && (
        <></>
      )} */}
    </div>
  );
}
