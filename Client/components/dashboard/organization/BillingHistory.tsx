import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

const mockBillingHistory: BillingHistoryItem[] = [
  {
    id: 'inv_123',
    date: '2024-03-15',
    amount: 49.99,
    status: 'paid',
    description: 'Professional Plan - Monthly',
    invoiceUrl: '#',
  },
  {
    id: 'inv_122',
    date: '2024-02-15',
    amount: 49.99,
    status: 'paid',
    description: 'Professional Plan - Monthly',
    invoiceUrl: '#',
  },
  {
    id: 'inv_121',
    date: '2024-01-15',
    amount: 29.99,
    status: 'paid',
    description: 'Starter Plan - Monthly',
    invoiceUrl: '#',
  },
];

export function BillingHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBillingHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {new Date(item.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>${item.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === 'paid' ? 'default' : 'destructive'}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={item.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icons.download className="h-4 w-4" />
                      <span className="sr-only">Download invoice</span>
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
