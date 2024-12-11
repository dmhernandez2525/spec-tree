import { useState } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

interface PaymentMethodSelectorProps {
  onUpdatePaymentMethod: () => Promise<void>;
  isLoading: boolean;
}

export function PaymentMethodSelector({
  onUpdatePaymentMethod,
  isLoading,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {/* Existing payment methods */}
        <Card className="relative border p-4">
          <input
            type="radio"
            name="payment-method"
            id="existing-card"
            className="peer hidden"
            checked={selectedMethod === 'existing'}
            onChange={() => setSelectedMethod('existing')}
          />
          <label
            htmlFor="existing-card"
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Icons.creditCard className="h-6 w-6" />
              <div>
                <p className="font-medium">•••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/24</p>
              </div>
            </div>
          </label>
        </Card>

        {/* Add new payment method */}
        <Card className="relative border p-4">
          <input
            type="radio"
            name="payment-method"
            id="new-card"
            className="peer hidden"
            checked={selectedMethod === 'new'}
            onChange={() => setSelectedMethod('new')}
          />
          <label
            htmlFor="new-card"
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Icons.plus className="h-6 w-6" />
              <div>
                <p className="font-medium">Add new payment method</p>
              </div>
            </div>
          </label>
          {selectedMethod === 'new' && (
            <div className="mt-4 rounded-md border p-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#dc2626',
                    },
                  },
                }}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onUpdatePaymentMethod}
          disabled={isLoading || !selectedMethod}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Payment Method'
          )}
        </Button>
      </div>
    </div>
  );
}
