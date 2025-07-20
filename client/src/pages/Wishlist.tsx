import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Wishlist() {
  const { isAuthenticated } = useAuth();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast.success('Item removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast.success('Item added to cart');
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-warm-tan-dark" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Sign in to view wishlist</h2>
            <p className="text-warm-tan-dark mb-6">
              Please sign in to view your saved items.
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

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-warm-tan-dark" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Your wishlist is empty</h2>
            <p className="text-warm-tan-dark mb-6">
              Save items you love to your wishlist and shop them later.
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">My Wishlist</h1>
          <p className="text-warm-tan-dark mt-2">{wishlistItems.length} saved items</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {item.product?.mainImageUrl ? (
                    <img
                      src={item.product.mainImageUrl}
                      alt={item.product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                      className="bg-white/90 hover:bg-white shadow-md"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-charcoal mb-1 line-clamp-2">
                    {item.product?.title}
                  </h3>
                  <p className="text-sm text-warm-tan-dark mb-2">
                    {item.product?.brand?.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-deep-red">
                      ${item.product?.price}
                    </div>
                    {item.product?.originalPrice && 
                     parseFloat(item.product.originalPrice) > parseFloat(item.product.price || '0') && (
                      <div className="text-sm text-warm-tan-dark line-through">
                        ${item.product.originalPrice}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => addToCartMutation.mutate(item.productId)}
                      disabled={addToCartMutation.isPending}
                      className="w-full bg-deep-red hover:bg-deep-red/90 text-white"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <div className="flex gap-2">
                      <Link href={`/products?productId=${item.productId}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-warm-tan-dark hover:text-deep-red"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}