'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  {
    name: 'Jan',
    total: 2,
  },
  {
    name: 'Feb',
    total: 4,
  },
  {
    name: 'Mar',
    total: 3,
  },
  {
    name: 'Apr',
    total: 5,
  },
  {
    name: 'May',
    total: 7,
  },
  {
    name: 'Jun',
    total: 6,
  },
  {
    name: 'Jul',
    total: 8,
  },
  {
    name: 'Aug',
    total: 10,
  },
  {
    name: 'Sep',
    total: 12,
  },
  {
    name: 'Oct',
    total: 9,
  },
  {
    name: 'Nov',
    total: 11,
  },
  {
    name: 'Dec',
    total: 12,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
