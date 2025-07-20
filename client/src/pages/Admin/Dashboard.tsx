import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Package, 
  Star,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statsCards = [
  {
    title: "Total Revenue",
    value: "$47,832",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    icon: ShoppingBag,
    trend: "up"
  },
  {
    title: "Active Customers",
    value: "892",
    change: "+3.1%",
    icon: Users,
    trend: "up"
  },
  {
    title: "Products Sold",
    value: "2,156",
    change: "+15.3%",
    icon: Package,
    trend: "up"
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Emily Johnson",
    product: "Diamond Engagement Ring",
    amount: "$2,850",
    status: "completed",
    date: "2025-01-18"
  },
  {
    id: "ORD-002",
    customer: "Michael Chen",
    product: "Vintage Rolex Submariner",
    amount: "$8,500",
    status: "processing",
    date: "2025-01-18"
  },
  {
    id: "ORD-003",
    customer: "Sarah Davis",
    product: "Pearl Necklace Set",
    amount: "$1,200",
    status: "shipped",
    date: "2025-01-17"
  },
  {
    id: "ORD-004",
    customer: "Robert Wilson",
    product: "Gold Tennis Bracelet",
    amount: "$3,400",
    status: "pending",
    date: "2025-01-17"
  }
];

const topProducts = [
  {
    id: 1,
    name: "Diamond Engagement Rings",
    sales: 45,
    revenue: "$127,500",
    views: 2847
  },
  {
    id: 2,
    name: "Luxury Watches",
    sales: 23,
    revenue: "$195,400",
    views: 1923
  },
  {
    id: 3,
    name: "Pearl Jewelry",
    sales: 67,
    revenue: "$80,400",
    views: 3421
  },
  {
    id: 4,
    name: "Gold Bracelets",
    sales: 34,
    revenue: "$115,600",
    views: 1847
  }
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data queries (replace with actual API calls)
  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/analytics', timeRange],
    queryFn: () => Promise.resolve({ success: true })
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-warm-tan-dark mt-2">
            Welcome back! Here's what's happening with your jewelry store.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="24h">24 Hours</TabsTrigger>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warm-tan-dark mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                    <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last period
                    </p>
                  </div>
                  <div className="bg-deep-red/10 p-3 rounded-lg">
                    <stat.icon className="w-6 h-6 text-deep-red" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Orders</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-charcoal">{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-warm-tan-dark">{order.customer}</p>
                      <p className="text-sm text-warm-tan-dark">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">{order.amount}</p>
                      <p className="text-sm text-warm-tan-dark">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-deep-red/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-deep-red">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-charcoal">{product.name}</p>
                      <div className="flex items-center gap-4 text-sm text-warm-tan-dark">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {product.sales} sales
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {product.views} views
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col gap-2 bg-deep-red hover:bg-deep-red/90">
                <Package className="w-5 h-5" />
                Add Product
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ShoppingBag className="w-5 h-5" />
                View Orders
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-5 h-5" />
                Manage Users
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}