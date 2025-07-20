import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiRequest } from '@/lib/queryClient';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutFormProps {
  amount: number;
  orderId?: string;
  onSuccess?: () => void;
}

function CheckoutForm({ amount, orderId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent on the server
      const { clientSecret } = await apiRequest('POST', '/api/checkout/create-payment-intent', {
        amount,
        orderId
      });

      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        toast.error('Payment failed. Please try again.');
      } else {
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1C274C',
        '::placeholder': {
          color: '#8D93A5',
        },
      },
      invalid: {
        color: '#DC2626',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-warm-tan/20 rounded-lg">
              <CardElement options={cardElementOptions} />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-warm-tan-dark flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Secure payment powered by Stripe
              </div>
              <div className="text-2xl font-bold text-charcoal">
                ${(amount / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-deep-red hover:bg-deep-red/90 text-white py-6 text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

interface StripeCheckoutProps extends CheckoutFormProps {}

export default function StripeCheckout(props: StripeCheckoutProps) {
  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-warm-tan-dark">
            Payment processing is not configured. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}