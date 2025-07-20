import { Heart, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthenticationBadge from './AuthenticationBadge';
import { QuickPreview } from '@/components/ui/quick-preview';
import type { Product } from '@shared/schema';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export default function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
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
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest('DELETE', `/api/wishlist/${product.id}`);
      } else {
        await apiRequest('POST', '/api/wishlist', {
          productId: product.id,
        });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: isLiked ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.title} has been ${isLiked ? 'removed from' : 'added to'} your wishlist.`,
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
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToWishlistMutation.mutate();
  };

  return (
    <Card className="product-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group">
      <div className="relative" onClick={() => onOpenModal(product)}>
        {/* Image with Quick Preview */}
        <div className="relative">
          <img
            src={product.mainImageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
            alt={product.title}
            className="w-full h-64 object-cover"
          />
          <QuickPreview
            src={product.mainImageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
            alt={`${product.title} preview`}
            triggerClassName="absolute inset-0"
            delay={200}
          />
        </div>
        
        {product.authenticated && (
          <div className="absolute top-3 left-3">
            <AuthenticationBadge />
          </div>
        )}

        <div className="zoom-indicator opacity-0 group-hover:opacity-100 transition-opacity">
          <Search className="w-4 h-4" />
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={handleWishlist}
            disabled={addToWishlistMutation.isPending}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6" onClick={() => onOpenModal(product)}>
        <h4 className="font-semibold text-charcoal mb-2 line-clamp-2">{product.title}</h4>
        <p className="text-sm text-warm-tan-dark mb-2">{product.condition}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-charcoal">${product.price}</p>
          {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
            <p className="text-sm text-warm-tan-dark line-through">${product.originalPrice}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
