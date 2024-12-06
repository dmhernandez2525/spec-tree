'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

interface Subscription {
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  nextBilling: string;
  amount: number;
}

const invoices: Invoice[] = [
  {
    id: 'INV-001',
    date: '2024-03-01',
    amount: 49.99,
    status: 'paid',
  },
  {
    id: 'INV-002',
    date: '2024-02-01',
    amount: 49.99,
    status: 'paid',
  },
  {
    id: 'INV-003',
    date: '2024-01-01',
    amount: 49.99,
    status: 'paid',
  },
];

const subscription: Subscription = {
  plan: 'Professional',
  status: 'active',
  nextBilling: '2024-04-01',
  amount: 49.99,
};

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

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <Button>
          <Icons.alert className="mr-2 h-4 w-4" />
          Update Payment Method
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan}</h3>
                    <p className="text-muted-foreground">
                      ${subscription.amount}/month
                    </p>
                  </div>
                  <Badge
                    variant={
                      subscription.status === 'active'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Next billing date</span>
                    <span>
                      {new Date(subscription.nextBilling).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing cycle</span>
                    <span>Monthly</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="destructive">Cancel Subscription</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="invoices">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.id}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === 'paid'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Icons.alert className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
