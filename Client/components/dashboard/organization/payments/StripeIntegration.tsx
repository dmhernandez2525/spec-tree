import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/use-store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { SubscriptionDetails } from './SubscriptionDetails';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeIntegrationProps {
  onSubscriptionUpdated: () => void;
}

export function StripeIntegration({
  onSubscriptionUpdated,
}: StripeIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const elements = useElements();
  const subscription = useAppSelector(
    (state) => state.organization.subscription
  );

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create setup intent');

      const { clientSecret } = await response.json();

      // Open Stripe portal for payment method update
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement('card')!,
          billing_details: {
            name: 'Test User', // TODO: Get from user profile
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success('Payment method updated successfully');
      onSubscriptionUpdated();
    } catch (error) {
      toast.error('Failed to update payment method');
      console.error('Payment method update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to open subscription management');
      console.error('Subscription management error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentMethodSelector
              onUpdatePaymentMethod={handleUpdatePaymentMethod}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>
              View and manage your current subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubscriptionDetails
              subscription={subscription}
              onManageSubscription={handleManageSubscription}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </Elements>
  );
}
