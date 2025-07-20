import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@shared/schema';

export default function ProductListing() {
  const [location] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    eraId: undefined as number | undefined,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    search: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setFilters({
      categoryId: params.get('categoryId') ? parseInt(params.get('categoryId')!) : undefined,
      brandId: params.get('brandId') ? parseInt(params.get('brandId')!) : undefined,
      eraId: params.get('eraId') ? parseInt(params.get('eraId')!) : undefined,
      priceMin: params.get('priceMin') ? parseFloat(params.get('priceMin')!) : undefined,
      priceMax: params.get('priceMax') ? parseFloat(params.get('priceMax')!) : undefined,
      search: params.get('search') || '',
    });
  }, [location]);

  // Fetch products
  const { data: productsResult, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', filters, sortBy, currentPage, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.brandId) params.append('brandId', filters.brandId.toString());
      if (filters.eraId) params.append('eraId', filters.eraId.toString());
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.search) params.append('search', filters.search);
      params.append('limit', limit.toString());
      params.append('offset', ((currentPage - 1) * limit).toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Fetch filter options
  const { data: categories = [] } = useQuery({ queryKey: ['/api/categories'] });
  const { data: brands = [] } = useQuery({ queryKey: ['/api/brands'] });
  const { data: eras = [] } = useQuery({ queryKey: ['/api/eras'] });

  const products = productsResult?.products || [];
  const totalProducts = productsResult?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-charcoal mb-4">Filter Products</h3>
      
      {/* Price Filter */}
      <div>
        <h4 className="font-medium text-charcoal mb-3">Price Range</h4>
        <div className="space-y-2">
          {[
            { label: 'Under $500', min: 0, max: 500 },
            { label: '$500 - $1,000', min: 500, max: 1000 },
            { label: '$1,000 - $2,500', min: 1000, max: 2500 },
            { label: 'Over $2,500', min: 2500, max: undefined },
          ].map((range) => (
            <div key={range.label} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${range.min}-${range.max}`}
                checked={filters.priceMin === range.min && filters.priceMax === range.max}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleFilterChange('priceMin', range.min);
                    handleFilterChange('priceMax', range.max);
                  } else {
                    handleFilterChange('priceMin', undefined);
                    handleFilterChange('priceMax', undefined);
                  }
                }}
              />
              <label htmlFor={`price-${range.min}-${range.max}`} className="text-sm text-warm-tan-dark">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="font-medium text-charcoal mb-3">Brand</h4>
        <div className="space-y-2">
          {brands.slice(0, 6).map((brand: any) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brandId === brand.id}
                onCheckedChange={(checked) => {
                  handleFilterChange('brandId', checked ? brand.id : undefined);
                }}
              />
              <label htmlFor={`brand-${brand.id}`} className="text-sm text-warm-tan-dark">
                {brand.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Era Filter */}
      <div>
        <h4 className="font-medium text-charcoal mb-3">Era</h4>
        <div className="space-y-2">
          {eras.map((era: any) => (
            <div key={era.id} className="flex items-center space-x-2">
              <Checkbox
                id={`era-${era.id}`}
                checked={filters.eraId === era.id}
                onCheckedChange={(checked) => {
                  handleFilterChange('eraId', checked ? era.id : undefined);
                }}
              />
              <label htmlFor={`era-${era.id}`} className="text-sm text-warm-tan-dark">
                {era.name} ({era.period})
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pearl">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-warm-tan-dark hover:text-deep-red">Home</a></li>
            <li className="text-warm-tan-dark">›</li>
            <li className="text-charcoal font-medium">Products</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <Card className="p-6 shadow-lg">
              <FilterSidebar />
            </Card>
          </div>

          {/* Mobile Filter */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-pearl">
                <div className="mt-8">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort & View Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-warm-tan-dark">
                Showing {products.length} of {totalProducts} results
              </p>
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border border-warm-tan rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, index) => (
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
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 mb-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product: Product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenModal={handleProductClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="border-warm-tan"
                      >
                        Previous
                      </Button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? 'bg-deep-red' : 'border-warm-tan'}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span>...</span>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(totalPages)}
                            className="border-warm-tan"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="border-warm-tan"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-warm-tan-dark text-lg mb-4">No products found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setFilters({
                      categoryId: undefined,
                      brandId: undefined,
                      eraId: undefined,
                      priceMin: undefined,
                      priceMax: undefined,
                      search: '',
                    });
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="border-deep-red text-deep-red hover:bg-deep-red hover:text-white"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
