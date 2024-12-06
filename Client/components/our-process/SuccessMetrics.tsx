import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Metric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface ChartData {
  name: string;
  value: number;
}

const metrics: Metric[] = [
  {
    title: 'Average Project Completion Time',
    value: '-40%',
    change: 'Faster project delivery',
    isPositive: true,
  },
  {
    title: 'Team Productivity',
    value: '+35%',
    change: 'Increased efficiency',
    isPositive: true,
  },
  {
    title: 'Requirements Coverage',
    value: '+60%',
    change: 'More comprehensive planning',
    isPositive: true,
  },
  {
    title: 'Project Cost Reduction',
    value: '-25%',
    change: 'Lower operational costs',
    isPositive: true,
  },
];

const chartData: ChartData[] = [
  { name: 'Project Planning', value: 85 },
  { name: 'Team Collaboration', value: 92 },
  { name: 'Requirement Quality', value: 78 },
  { name: 'Delivery Speed', value: 88 },
  { name: 'Cost Efficiency', value: 75 },
];

export function SuccessMetrics() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  metric.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuccessMetrics;
