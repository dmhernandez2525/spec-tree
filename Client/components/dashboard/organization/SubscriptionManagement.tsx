import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Icons } from '@/components/shared/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchOrganizationData } from '@/lib/store/organization-slice';
import { BillingHistory } from './BillingHistory';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: 'For small teams just getting started',
    features: [
      'Up to 5 team members',
      'Basic project management',
      'Community support',
      'Standard AI features',
    ],
    seatsIncluded: 5,
    additionalSeatPrice: 10,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: 'For growing teams that need more',
    features: [
      'Up to 20 team members',
      'Advanced project management',
      'Priority support',
      'Custom workflows',
      'Advanced AI capabilities',
      'API access',
    ],
    seatsIncluded: 20,
    additionalSeatPrice: 8,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    description: 'For large organizations',
    features: [
      'Unlimited team members',
      'Enterprise features',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'Custom AI models',
      'SLA guarantee',
    ],
    seatsIncluded: -1,
    additionalSeatPrice: 5,
  },
];

interface PaymentFormProps {
  onSuccess: () => void;
  currentPlan?: string;
}

function PaymentForm({ onSuccess, currentPlan }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(
    () => plans.find((p) => p.id === currentPlan) || plans[0]
  );
  const [additionalSeats, setAdditionalSeats] = useState(0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not been initialized');
      return;
    }

    setIsProcessing(true);

    try {
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement)!,
        });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: selectedPlan.priceId,
          additionalSeats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      toast.success('Subscription updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice =
    selectedPlan.price + additionalSeats * selectedPlan.additionalSeatPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedPlan.id === plan.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : ''
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant="secondary">${plan.price}/month</Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {selectedPlan.id !== 'enterprise' && (
          <div className="space-y-2">
            <Label>Additional Seats</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={additionalSeats}
                onChange={(e) =>
                  setAdditionalSeats(parseInt(e.target.value) || 0)
                }
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                ${selectedPlan.additionalSeatPrice}/seat/month
              </span>
            </div>
          </div>
        )}

        <div className="rounded-md border p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium">Payment Details</h4>
            <p className="text-sm text-muted-foreground">
              You will be charged ${totalPrice}/month
            </p>
          </div>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'var(--foreground)',
                  '::placeholder': {
                    color: 'var(--muted-foreground)',
                  },
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isProcessing || !stripe}>
          {isProcessing ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${selectedPlan.name}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function SubscriptionManagement() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(
    (state) => state.organization.subscription
  );

  const handleSubscriptionSuccess = () => {
    setShowPaymentDialog(false);
    // Refresh subscription data
    dispatch(fetchOrganizationData(subscription.organizationId));
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open subscription management:', error);
      toast.error('Failed to open subscription management');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </div>
              {subscription && (
                <Badge variant="outline">
                  {subscription.plan.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h4>
                    <p className="mt-1 font-medium">
                      <Badge variant="outline">{subscription.status}</Badge>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Billing Cycle
                    </h4>
                    <p className="mt-1 font-medium">
                      {subscription.billingCycle === 'yearly'
                        ? 'Yearly'
                        : 'Monthly'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Next Payment
                    </h4>
                    <p className="mt-1 font-medium">
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Amount
                    </h4>
                    <p className="mt-1 font-medium">
                      ${subscription.pricePerSeat * subscription.seats}/month
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
                  <Progress
                    value={(subscription.usedSeats / subscription.seats) * 100}
                  />
                  {subscription.usedSeats / subscription.seats > 0.8 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Consider upgrading your plan to add more seats
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={handleManageSubscription}>
                    Manage Billing
                  </Button>
                  <Dialog
                    open={showPaymentDialog}
                    onOpenChange={setShowPaymentDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>Change Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle>Change Subscription Plan</DialogTitle>
                        <DialogDescription>
                          Choose a new plan for your organization
                        </DialogDescription>
                      </DialogHeader>
                      <PaymentForm
                        onSuccess={handleSubscriptionSuccess}
                        currentPlan={subscription.plan}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-2">
                  No active subscription
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a plan to get started with Spec Tree
                </p>
                <Dialog
                  open={showPaymentDialog}
                  onOpenChange={setShowPaymentDialog}
                >
                  <DialogTrigger asChild>
                    <Button>Choose a Plan</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Choose a Subscription Plan</DialogTitle>
                      <DialogDescription>
                        Select the plan that best fits your needs
                      </DialogDescription>
                    </DialogHeader>
                    <PaymentForm onSuccess={handleSubscriptionSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan Features</CardTitle>
              <CardDescription>
                Features included in your {subscription.plan} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans
                  .find((p) => p.id === subscription.plan)
                  ?.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Icons.check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
        <BillingHistory />
      </div>
    </Elements>
  );
}
