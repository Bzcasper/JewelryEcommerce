import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import StripeCheckout from '@/components/StripeCheckout';
import { toast } from 'react-hot-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest('PATCH', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast.error('Failed to update quantity');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product?.price || '0') * item.quantity);
  }, 0);

  const tax = subtotal * 0.0875; // 8.75% tax
  const shipping = subtotal > 500 ? 0 : 25; // Free shipping over $500
  const total = subtotal + tax + shipping;

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    toast.success('Order placed successfully!');
    // In a real app, you would redirect to an order confirmation page
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-warm-tan-dark" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Sign in to view cart</h2>
            <p className="text-warm-tan-dark mb-6">
              Please sign in to view your shopping cart and checkout.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-deep-red hover:bg-deep-red/90 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-red"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-warm-tan-dark" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Your cart is empty</h2>
            <p className="text-warm-tan-dark mb-6">
              Discover our exquisite collection of luxury jewelry.
            </p>
            <Link href="/products">
              <Button className="w-full bg-deep-red hover:bg-deep-red/90 text-white">
                Browse Collection
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowCheckout(false)}
              className="mb-4"
            >
              ← Back to Cart
            </Button>
            <h1 className="text-3xl font-bold text-charcoal">Checkout</h1>
          </div>
          
          <StripeCheckout
            amount={Math.round(total * 100)} // Convert to cents
            onSuccess={handleCheckoutSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-charcoal mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <Card>
              <CardContent className="p-6">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                        {item.product?.mainImageUrl ? (
                          <img
                            src={item.product.mainImageUrl}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">
                          {item.product?.title}
                        </h3>
                        <p className="text-sm text-warm-tan-dark mb-2">
                          {item.product?.category?.name} • {item.product?.brand?.name}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={updateQuantityMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-charcoal">
                          ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-warm-tan-dark">
                            ${parseFloat(item.product?.price || '0').toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-charcoal mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-warm-tan-dark">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-tan-dark">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-tan-dark">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-warm-tan-dark">
                      Free shipping on orders over $500
                    </p>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-charcoal">Total</span>
                  <span className="text-2xl font-bold text-deep-red">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-deep-red hover:bg-deep-red/90 text-white"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
                
                <p className="text-xs text-center text-warm-tan-dark mt-4">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}