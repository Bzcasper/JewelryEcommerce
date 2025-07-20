import { useState, useEffect } from 'react';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useForm } from 'react-hook-form';

type ActiveSection = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings';

export default function Account() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

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

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  // Fetch user orders
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  // Fetch wishlist items with product details
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  const { data: wishlistProducts = [] } = useQuery({
    queryKey: ['/api/products', 'wishlist-products'],
    queryFn: async () => {
      if (wishlistItems.length === 0) return [];
      
      const productPromises = wishlistItems.map(async (item: any) => {
        const response = await fetch(`/api/products/${item.productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const product = await response.json();
        return { ...product, wishlistId: item.id };
      });
      
      return Promise.all(productPromises);
    },
    enabled: wishlistItems.length > 0,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
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
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
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

  const onProfileSubmit = (data: any) => {
    // TODO: Implement profile update
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigation = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pearl">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-charcoal mb-8">My Account</h2>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Account Navigation */}
          <div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as ActiveSection)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        activeSection === item.id
                          ? 'bg-deep-red text-white'
                          : 'text-warm-tan-dark hover:bg-warm-tan/20'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <Separator className="my-4" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-warm-tan-dark hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Account Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-charcoal">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName" className="text-sm font-medium text-charcoal">First Name</Label>
                          <Input
                            id="firstName"
                            {...register('firstName')}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm font-medium text-charcoal">Last Name</Label>
                          <Input
                            id="lastName"
                            {...register('lastName')}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email" className="text-sm font-medium text-charcoal">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className="mt-1"
                            disabled
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" className="bg-deep-red text-white hover:bg-deep-red/90">
                        Update Profile
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-deep-red mb-2">{orders.length}</div>
                      <div className="text-warm-tan-dark">Total Orders</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-deep-red mb-2">{wishlistItems.length}</div>
                      <div className="text-warm-tan-dark">Wishlist Items</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-deep-red mb-2">Gold</div>
                      <div className="text-warm-tan-dark">Member Status</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-charcoal">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-warm-tan-dark mx-auto mb-4" />
                      <p className="text-warm-tan-dark">No orders yet</p>
                      <p className="text-sm text-warm-tan-dark mt-1">Start shopping to see your orders here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border border-warm-tan/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-charcoal">Order #{order.orderNumber}</h4>
                              <p className="text-sm text-warm-tan-dark">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-charcoal">${order.total}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-warm-tan">
                                View Details
                              </Button>
                              {order.status === 'shipped' && (
                                <Button variant="outline" size="sm" className="border-warm-tan">
                                  <Truck className="w-4 h-4 mr-1" />
                                  Track Order
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Wishlist Section */}
            {activeSection === 'wishlist' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-charcoal">My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-warm-tan-dark mx-auto mb-4" />
                      <p className="text-warm-tan-dark">Your wishlist is empty</p>
                      <p className="text-sm text-warm-tan-dark mt-1">Save items you love for later</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {wishlistProducts.map((product: any) => (
                        <div key={product.id} className="border border-warm-tan/20 rounded-lg p-4">
                          <div className="relative mb-4">
                            <img
                              src={product.mainImageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200'}
                              alt={product.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeFromWishlistMutation.mutate(product.id)}
                              disabled={removeFromWishlistMutation.isPending}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
                            >
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <h4 className="font-semibold text-charcoal mb-2">{product.title}</h4>
                          <p className="text-sm text-warm-tan-dark mb-2">{product.condition}</p>
                          {product.authenticated && (
                            <div className="mb-3">
                              <AuthenticationBadge />
                            </div>
                          )}
                          <p className="text-lg font-bold text-charcoal mb-3">${product.price}</p>
                          <Button
                            onClick={() => addToCartMutation.mutate(product.id)}
                            disabled={addToCartMutation.isPending}
                            className="w-full bg-deep-red text-white hover:bg-deep-red/90"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-charcoal">Shipping Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-warm-tan-dark mx-auto mb-4" />
                    <p className="text-warm-tan-dark">No addresses saved</p>
                    <p className="text-sm text-warm-tan-dark mt-1">Add shipping addresses for faster checkout</p>
                    <Button className="mt-4 bg-deep-red text-white hover:bg-deep-red/90">
                      Add Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-charcoal">Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border border-warm-tan/20 rounded-lg">
                      <h4 className="font-medium text-charcoal mb-2">Email Notifications</h4>
                      <p className="text-sm text-warm-tan-dark">Manage your email preferences and notifications</p>
                    </div>
                    <div className="p-4 border border-warm-tan/20 rounded-lg">
                      <h4 className="font-medium text-charcoal mb-2">Privacy Settings</h4>
                      <p className="text-sm text-warm-tan-dark">Control your privacy and data sharing preferences</p>
                    </div>
                    <div className="p-4 border border-warm-tan/20 rounded-lg">
                      <h4 className="font-medium text-charcoal mb-2">Security</h4>
                      <p className="text-sm text-warm-tan-dark">Manage your account security settings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
