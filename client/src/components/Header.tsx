import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Camera, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '@/components/SearchBar';

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get cart count for authenticated users
  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const cartCount = cartItems.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navigation = [
    { name: 'Rings', href: '/products?category=rings' },
    { name: 'Necklaces', href: '/products?category=necklaces' },
    { name: 'Earrings', href: '/products?category=earrings' },
    { name: 'Bracelets', href: '/products?category=bracelets' },
    { name: 'Watches', href: '/products?category=watches' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-warm-tan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="hexagon flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M6 3h12l4 6-4 6H6l-4-6z"/>
                <circle cx="12" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal tracking-wide">Luxury Jewelry</h1>
              <p className="text-xs text-warm-tan-dark">Premium Collection</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="text-charcoal hover:text-deep-red transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search with Algolia */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            <Button variant="ghost" size="sm" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* AI Upload */}
            <Link href="/upload">
              <Button variant="ghost" size="sm" className="text-charcoal hover:text-deep-red">
                <Camera className="h-5 w-5" />
              </Button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="sm" className="text-charcoal hover:text-deep-red">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Account */}
            {isAuthenticated ? (
              <Link href="/account">
                <Button variant="ghost" size="sm" className="text-charcoal hover:text-deep-red">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/api/login'}
                className="text-charcoal hover:text-deep-red"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-charcoal hover:text-deep-red">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 bg-deep-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-pearl">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="sm:hidden">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search jewelry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-tan-dark h-4 w-4" />
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-3">
                    <Link href="/" className="text-charcoal font-medium py-2">Home</Link>
                    {navigation.map((item) => (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className="text-charcoal font-medium py-2"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <hr className="border-warm-tan/20" />

                  {/* Mobile Account Links */}
                  <div className="flex flex-col space-y-3">
                    {isAuthenticated ? (
                      <>
                        <Link href="/account" className="text-charcoal font-medium py-2">My Account</Link>
                        <Link href="/upload" className="text-charcoal font-medium py-2">AI Upload</Link>
                        <button 
                          onClick={() => window.location.href = '/api/logout'}
                          className="text-charcoal font-medium py-2 text-left"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => window.location.href = '/api/login'}
                        className="text-charcoal font-medium py-2 text-left"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
