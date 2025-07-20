import { useState } from 'react';
import { Link } from 'wouter';
import { Shield, Award, Leaf, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@shared/schema';

export default function Homepage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  // Fetch featured products
  const { data: featuredResult, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/products', { featured: true, limit: 8 }],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true&limit=8');
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-pearl">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-6 leading-tight">
                Premium<br />
                <span className="text-deep-red">Jewelry Collection</span>
              </h2>
              <p className="text-lg text-warm-tan-dark mb-8 leading-relaxed">
                Discover authenticated pre-owned luxury jewelry pieces. Each item is expertly verified for authenticity and quality, bringing you sustainable luxury with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-deep-red text-white px-8 py-4 rounded-lg font-semibold hover:bg-deep-red/90 transition-all shadow-lg">
                    Shop Collection
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-2 border-deep-red text-deep-red px-8 py-4 rounded-lg font-semibold hover:bg-deep-red hover:text-white transition-all">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-warm-tan-dark">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Expert Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Curated vintage jewelry collection display"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute top-6 left-6">
                <div className="auth-badge">
                  <Shield className="w-3 h-3" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-charcoal text-center mb-12">Shop by Category</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category: any) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-8 text-center">
                    <img
                      src={category.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200'}
                      alt={`${category.name} collection`}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h4 className="font-semibold text-charcoal mb-2">{category.name}</h4>
                    <p className="text-sm text-warm-tan-dark">{category.productCount || 0} pieces</p>
                    <p className="text-xs text-warm-tan-dark">From $150</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-charcoal text-center mb-12">Featured Pieces</h3>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 w-full"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredResult?.products?.slice(0, 4).map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenModal={handleProductClick}
                />
              ))}
            </div>
          )}

          {featuredResult?.products?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-warm-tan-dark">No featured products available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/products">
              <Button variant="outline" className="border-deep-red text-deep-red hover:bg-deep-red hover:text-white">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600 w-8 h-8" />
              </div>
              <h4 className="font-semibold text-charcoal mb-2">Expert Authentication</h4>
              <p className="text-warm-tan-dark">Every piece is verified by our team of jewelry experts with certificates of authenticity.</p>
            </div>
            <div className="animate-fade-in">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-yellow-600 w-8 h-8" />
              </div>
              <h4 className="font-semibold text-charcoal mb-2">Quality Guaranteed</h4>
              <p className="text-warm-tan-dark">30-day return policy with full refund if you're not completely satisfied with your purchase.</p>
            </div>
            <div className="animate-fade-in">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-green-600 w-8 h-8" />
              </div>
              <h4 className="font-semibold text-charcoal mb-2">Sustainable Luxury</h4>
              <p className="text-warm-tan-dark">Give vintage jewelry new life while reducing environmental impact through circular fashion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-pearl mb-8">Get notified about new arrivals and exclusive vintage pieces.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white"
              required
            />
            <Button type="submit" className="bg-deep-red text-white hover:bg-deep-red/90">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-warm-tan mt-4">Join 15,000+ subscribers • Unsubscribe anytime</p>
        </div>
      </section>

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
