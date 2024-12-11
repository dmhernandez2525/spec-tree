import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { Progress } from '@/components/ui/progress';
import { OrganizationSubscription } from '@/types/organization';

interface SubscriptionDetailsProps {
  subscription: OrganizationSubscription | null;
  onManageSubscription: () => Promise<void>;
  isLoading: boolean;
}

export function SubscriptionDetails({
  subscription,
  onManageSubscription,
  isLoading,
}: SubscriptionDetailsProps) {
  const nextBillingAmount = useMemo(() => {
    if (!subscription) return 0;
    return subscription.pricePerSeat * subscription.seats;
  }, [subscription]);

  const seatUtilization = useMemo(() => {
    if (!subscription) return 0;
    return Math.round((subscription.usedSeats / subscription.seats) * 100);
  }, [subscription]);

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              No active subscription found
            </p>
            <Button onClick={onManageSubscription} className="mt-4">
              Start Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge
              variant={
                subscription.status === 'active' ? 'default' : 'destructive'
              }
            >
              {subscription.status}
            </Badge>
          </div>
          <CardDescription>
            {subscription.plan.charAt(0).toUpperCase() +
              subscription.plan.slice(1)}{' '}
            Plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Billing Cycle
              </p>
              <p className="mt-1 font-medium">
                {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Next Payment
              </p>
              <p className="mt-1 font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Amount
              </p>
              <p className="mt-1 font-medium">
                ${nextBillingAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Seat Usage</span>
              <span>
                {subscription.usedSeats} of {subscription.seats} seats
              </span>
            </div>
            <Progress value={seatUtilization} />
            {seatUtilization >= 80 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Consider adding more seats to accommodate growth
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onManageSubscription}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Icons.shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Secured by Stripe
            </span>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Up to {subscription.seats} team members</span>
            </li>
            {subscription.plan === 'pro' && (
              <>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Advanced project management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </>
            )}
            {subscription.plan === 'enterprise' && (
              <>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Advanced security features</span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
