import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MoreVertical, Eye, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const orders = [
  {
    id: "ORD-2025-001",
    customer: "Emily Johnson",
    email: "emily.j@email.com",
    products: [
      { name: "Diamond Engagement Ring", quantity: 1, price: 2850 }
    ],
    total: 2850,
    status: "completed",
    date: "2025-01-18",
    shippingAddress: "123 Main St, New York, NY 10001"
  },
  {
    id: "ORD-2025-002",
    customer: "Michael Chen",
    email: "m.chen@email.com",
    products: [
      { name: "Vintage Rolex Submariner", quantity: 1, price: 8500 }
    ],
    total: 8500,
    status: "processing",
    date: "2025-01-18",
    shippingAddress: "456 Oak Ave, San Francisco, CA 94102"
  },
  {
    id: "ORD-2025-003",
    customer: "Sarah Davis",
    email: "sarah.davis@email.com",
    products: [
      { name: "Pearl Necklace Set", quantity: 1, price: 1200 }
    ],
    total: 1200,
    status: "shipped",
    date: "2025-01-17",
    shippingAddress: "789 Pine St, Seattle, WA 98101"
  },
  {
    id: "ORD-2025-004",
    customer: "Robert Wilson",
    email: "r.wilson@email.com",
    products: [
      { name: "Gold Tennis Bracelet", quantity: 1, price: 3400 }
    ],
    total: 3400,
    status: "pending",
    date: "2025-01-17",
    shippingAddress: "321 Elm St, Boston, MA 02101"
  },
  {
    id: "ORD-2025-005",
    customer: "Lisa Thompson",
    email: "lisa.t@email.com",
    products: [
      { name: "Vintage Diamond Earrings", quantity: 1, price: 1800 }
    ],
    total: 1800,
    status: "cancelled",
    date: "2025-01-16",
    shippingAddress: "654 Maple Dr, Austin, TX 73301"
  }
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'shipped': return Truck;
      case 'processing': return Eye;
      default: return Eye;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Order Management</h1>
          <p className="text-warm-tan-dark mt-2">
            Manage and track all customer orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <p className="text-sm text-warm-tan-dark">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {orders.filter(o => o.status === 'processing').length}
              </div>
              <p className="text-sm text-warm-tan-dark">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {orders.filter(o => o.status === 'shipped').length}
              </div>
              <p className="text-sm text-warm-tan-dark">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-charcoal">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <p className="text-sm text-warm-tan-dark">Completed</p>
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
                  placeholder="Search orders by ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-deep-red hover:bg-deep-red/90" : ""}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Orders ({filteredOrders.length})</span>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-warm-tan-dark">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.products.map((product, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-warm-tan-dark">Qty: {product.quantity}</div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="w-4 h-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}