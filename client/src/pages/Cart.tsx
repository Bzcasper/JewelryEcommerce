import { useState } from 'react';
import { Link } from 'wouter';
import { Minus, Plus, Trash2, Shield, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthenticationBadge from '@/components/AuthenticationBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useEffect } from 'react';

export default function Cart() {
  const [promoCode, setPromoCode] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch cart items with product details
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  // Fetch product details for cart items
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', 'cart-products'],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const productPromises = cartItems.map(async (item: any) => {
        const response = await fetch(`/api/products/${item.productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
      });
      
      return Promise.all(productPromises);
    },
    enabled: cartItems.length > 0,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement promo code logic
    toast({
      title: "Promo code applied",
      description: "Your discount has been applied to the order.",
    });
  };

  // Calculate totals
  const cartWithProducts = cartItems.map((item: any) => {
    const product = products.find((p: any) => p.id === item.productId);
    return { ...item, product };
  }).filter((item: any) => item.product);

  const subtotal = cartWithProducts.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = subtotal > 500 ? 0 : 25;
  const insurance = Math.round(subtotal * 0.01);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + insurance + tax;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pearl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-charcoal">Shopping Cart</h2>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-deep-red text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <div className="w-20 h-1 bg-deep-red"></div>
            <div className="w-8 h-8 bg-warm-tan text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
            <div className="w-20 h-1 bg-warm-tan/30"></div>
            <div className="w-8 h-8 bg-warm-tan/30 text-warm-tan-dark rounded-full flex items-center justify-center text-sm font-semibold">3</div>
          </div>
        </div>
        
        {cartLoading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border-b border-warm-tan/20">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div>
              <Card className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </Card>
            </div>
          </div>
        ) : cartWithProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-warm-tan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-warm-tan-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">Your cart is empty</h3>
              <p className="text-warm-tan-dark">Add some beautiful vintage pieces to get started.</p>
            </div>
            <Link href="/products">
              <Button className="bg-deep-red text-white hover:bg-deep-red/90">
                Shop Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-charcoal mb-6">Cart Items ({cartWithProducts.length})</h3>
                  
                  <div className="space-y-4">
                    {cartWithProducts.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border-b border-warm-tan/20 last:border-b-0">
                        <img
                          src={item.product.mainImageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-charcoal">{item.product.title}</h4>
                          <p className="text-sm text-warm-tan-dark">{item.product.condition}</p>
                          {item.selectedSize && (
                            <p className="text-sm text-warm-tan-dark">Size: {item.selectedSize}</p>
                          )}
                          {item.product.authenticated && (
                            <div className="mt-2">
                              <AuthenticationBadge />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-charcoal mb-2">${item.product.price}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              className="w-8 h-8 p-0 border-warm-tan"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-charcoal font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                              className="w-8 h-8 p-0 border-warm-tan"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-charcoal mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-warm-tan-dark">Subtotal</span>
                      <span className="text-charcoal font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-tan-dark">Shipping</span>
                      <span className="text-charcoal font-medium">
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-tan-dark">Insurance</span>
                      <span className="text-charcoal font-medium">${insurance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-tan-dark">Tax</span>
                      <span className="text-charcoal font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-charcoal">Total</span>
                      <span className="text-charcoal">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <form onSubmit={handlePromoSubmit} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" variant="outline" className="border-warm-tan">
                        Apply
                      </Button>
                    </form>
                  </div>

                  {/* Authentication Badge */}
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-medium text-sm">All items authenticated</span>
                    </div>
                    <p className="text-green-700 text-xs">Every piece comes with a certificate of authenticity</p>
                  </div>

                  {/* Checkout Button */}
                  <Button className="w-full bg-deep-red text-white py-4 rounded-lg font-semibold text-lg hover:bg-deep-red/90 transition-all mb-4">
                    Proceed to Checkout
                  </Button>

                  {/* Payment Options */}
                  <div className="text-center mb-6">
                    <p className="text-xs text-warm-tan-dark mb-3">Or pay with</p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">PayPal</Badge>
                      <Badge className="bg-black text-white hover:bg-gray-800">Apple Pay</Badge>
                      <Badge variant="outline" className="border-warm-tan text-warm-tan-dark hover:bg-warm-tan hover:text-white">Google Pay</Badge>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-warm-tan-dark">
                      <Lock className="w-3 h-3" />
                      <span>SSL Encrypted • 30-day returns</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
