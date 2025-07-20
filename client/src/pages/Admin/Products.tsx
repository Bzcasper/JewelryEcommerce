import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    }
  });

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categoryId?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Product Management</h1>
            <p className="text-warm-tan-dark mt-2">
              Manage your jewelry inventory and product catalog
            </p>
          </div>
          <Button className="bg-deep-red hover:bg-deep-red/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">{products.length}</div>
              <p className="text-sm text-warm-tan-dark">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {products.filter((p: any) => p.authenticated).length}
              </div>
              <p className="text-sm text-warm-tan-dark">Authenticated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {products.filter((p: any) => p.condition === 'Excellent').length}
              </div>
              <p className="text-sm text-warm-tan-dark">Excellent Condition</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                ${products.reduce((sum: number, p: any) => sum + parseFloat(p.price || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-warm-tan-dark">Total Value</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-tan-dark w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={categoryFilter === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className={categoryFilter === 'all' ? "bg-deep-red hover:bg-deep-red/90" : ""}
                >
                  All Categories
                </Button>
                {categories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={categoryFilter === category.id.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category.id.toString())}
                    className={categoryFilter === category.id.toString() ? "bg-deep-red hover:bg-deep-red/90" : ""}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Products ({filteredProducts.length})</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.mainImageUrl ? (
                            <img
                              src={product.mainImageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">{product.title}</div>
                          <div className="text-sm text-warm-tan-dark line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${product.price}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          product.condition === 'Excellent' 
                            ? 'bg-green-100 text-green-800'
                            : product.condition === 'Very Good'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {product.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          product.authenticated 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {product.authenticated ? 'Authenticated' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.createdAt 
                        ? new Date(product.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}