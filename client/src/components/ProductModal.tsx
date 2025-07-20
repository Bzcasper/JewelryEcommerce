import { useState } from 'react';
import { X, Heart, ShoppingCart, Share2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AuthenticationBadge from './AuthenticationBadge';
import type { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // Check if product exists after hooks
  if (!product) return null;

  const images = [product.mainImageUrl, ...(product.imageUrls || [])].filter(Boolean);
  const availableSizes = product.size ? [product.size] : ['6', '6.5', '7', '7.5', '8'];

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity,
        selectedSize: selectedSize || product.size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
      onClose();
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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToWishlistMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    // Add to cart and redirect to cart
    addToCartMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Product Images */}
          <div className="relative">
            <div className="relative">
              <img
                src={images[selectedImageIndex] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600'}
                alt={product.title}
                className="w-full h-96 lg:h-full object-cover"
              />
              
              {product.authenticated && (
                <div className="absolute top-4 left-4">
                  <AuthenticationBadge />
                </div>
              )}

              <div className="zoom-indicator">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shadow-lg flex-shrink-0 ${
                        selectedImageIndex === index ? 'border-white' : 'border-white/50'
                      }`}
                    >
                      <img
                        src={image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                        alt={`${product.title} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-charcoal">
                {product.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                View details for {product.title}
              </DialogDescription>
              <p className="text-warm-tan-dark">{product.condition}</p>
              {product.authenticated && (
                <div className="mt-2">
                  <AuthenticationBadge />
                </div>
              )}
            </DialogHeader>
            
            <div className="text-3xl font-bold text-charcoal mb-6">
              ${product.price}
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <span className="text-lg text-warm-tan-dark line-through ml-2">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-warm-tan-dark">Condition:</span>
                <span className="text-charcoal font-medium">{product.condition}</span>
              </div>
              {product.size && (
                <div className="flex justify-between">
                  <span className="text-warm-tan-dark">Size:</span>
                  <span className="text-charcoal font-medium">{product.size}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-warm-tan-dark text-sm mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {product.resizable && (
              <div className="mb-6">
                <h4 className="font-medium text-charcoal mb-3">Size Options</h4>
                <div className="flex gap-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 ${
                        selectedSize === size
                          ? 'bg-deep-red text-white'
                          : 'border-warm-tan text-warm-tan-dark hover:border-deep-red hover:text-deep-red'
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h4 className="font-medium text-charcoal mb-3">Quantity</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-warm-tan"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-charcoal font-medium min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-warm-tan"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full bg-deep-red text-white py-4 rounded-lg font-semibold text-lg hover:bg-deep-red/90 transition-all"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                disabled={addToCartMutation.isPending}
                className="w-full border-2 border-deep-red text-deep-red py-4 rounded-lg font-semibold hover:bg-deep-red hover:text-white transition-all"
              >
                Buy Now
              </Button>
            </div>

            {/* Payment Options */}
            <div className="mb-6">
              <p className="text-sm text-warm-tan-dark mb-3">Payment options:</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-yellow-400 text-black">PayPal</Badge>
                <Badge variant="secondary" className="bg-black text-white">Apple Pay</Badge>
                <Badge variant="outline" className="border-warm-tan text-warm-tan-dark">Google Pay</Badge>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex justify-between items-center text-sm mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWishlist}
                disabled={addToWishlistMutation.isPending}
                className="flex items-center gap-2 text-warm-tan-dark hover:text-deep-red"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>Add to Wishlist</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-warm-tan-dark hover:text-deep-red"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>

            {/* Security Info */}
            <div className="pt-6 border-t border-warm-tan/20">
              <div className="flex items-center justify-between text-xs text-warm-tan-dark">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
