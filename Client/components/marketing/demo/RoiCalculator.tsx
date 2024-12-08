'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RoiMetrics {
  timeSaved: number;
  costReduction: number;
  productivityGain: number;
  annualSavings: number;
}

const formSchema = z.object({
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  avgSalary: z.number().min(0, 'Salary must be a positive number'),
  projectsPerYear: z.number().min(1, 'Must have at least 1 project per year'),
  currentPlanningTime: z.number().min(1, 'Must be at least 1 hour'),
});

export function RoiCalculator() {
  const [metrics, setMetrics] = useState<RoiMetrics | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamSize: 5,
      avgSalary: 75000,
      projectsPerYear: 12,
      currentPlanningTime: 20,
    },
  });

  function calculateRoi(data: z.infer<typeof formSchema>): RoiMetrics {
    const hourlyRate = data.avgSalary / 2080; // 40 hours/week * 52 weeks
    const currentCost =
      hourlyRate *
      data.teamSize *
      data.currentPlanningTime *
      data.projectsPerYear;
    const improvedCost = currentCost * 0.6; // 40% reduction

    return {
      timeSaved: data.currentPlanningTime * 0.4,
      costReduction: currentCost - improvedCost,
      productivityGain: 35,
      annualSavings: currentCost - improvedCost,
    };
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    const results = calculateRoi(data);
    setMetrics(results);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
          <CardDescription>
            Calculate your potential savings with Spec Tree
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Size</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Current value: {field.value} team members
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="avgSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Team Member Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="projectsPerYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects Per Year</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Current value: {field.value} projects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="currentPlanningTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Planning Hours per Project</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Current value: {field.value} hours
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <Button type="submit">Calculate ROI</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {metrics && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Your Potential Savings</CardTitle>
              <CardDescription>
                Based on industry averages and your input
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Time Saved per Project</TableCell>
                    <TableCell className="text-right">
                      {metrics.timeSaved.toFixed(1)} hours
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Annual Cost Reduction</TableCell>
                    <TableCell className="text-right">
                      ${metrics.costReduction.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Productivity Gain</TableCell>
                    <TableCell className="text-right">
                      {metrics.productivityGain}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Annual Savings</TableCell>
                    <TableCell className="text-right">
                      ${metrics.annualSavings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
