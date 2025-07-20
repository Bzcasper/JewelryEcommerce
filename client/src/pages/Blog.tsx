import { useState } from 'react';
import { Link } from 'wouter';
import { Calendar, User, Clock, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    id: 1,
    title: "The Art of Vintage Jewelry Authentication",
    excerpt: "Learn how AI technology is revolutionizing the authentication process for vintage and antique jewelry pieces.",
    author: "Sarah Mitchell",
    date: "2025-01-15",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "Authentication",
    tags: ["AI", "Vintage", "Technology"]
  },
  {
    id: 2,
    title: "Investment Guide: Luxury Watches Worth Collecting",
    excerpt: "Discover which luxury watch brands and models are likely to appreciate in value over time.",
    author: "Michael Chen",
    date: "2025-01-12",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "Investment",
    tags: ["Watches", "Investment", "Luxury"]
  },
  {
    id: 3,
    title: "Caring for Your Precious Gemstones",
    excerpt: "Essential tips for maintaining the beauty and value of your gemstone jewelry collection.",
    author: "Emma Rodriguez",
    date: "2025-01-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "Care",
    tags: ["Gemstones", "Maintenance", "Care"]
  },
  {
    id: 4,
    title: "The History of Art Deco Jewelry Design",
    excerpt: "Explore the fascinating world of Art Deco jewelry and its influence on modern design.",
    author: "David Laurent",
    date: "2025-01-08",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "History",
    tags: ["Art Deco", "Design", "History"]
  },
  {
    id: 5,
    title: "Sustainable Jewelry: The Future of Luxury",
    excerpt: "How the luxury jewelry industry is embracing sustainability without compromising on quality.",
    author: "Lisa Thompson",
    date: "2025-01-05",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "Sustainability",
    tags: ["Sustainability", "Ethics", "Future"]
  },
  {
    id: 6,
    title: "Understanding Diamond Grading and Certification",
    excerpt: "A comprehensive guide to diamond quality factors and what to look for in certification.",
    author: "Robert Adams",
    date: "2025-01-03",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    category: "Education",
    tags: ["Diamonds", "Grading", "Certification"]
  }
];

const categories = ["All", "Authentication", "Investment", "Care", "History", "Sustainability", "Education"];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Jewelry Insights</h1>
          <p className="text-lg text-warm-tan-dark max-w-2xl mx-auto">
            Discover expert insights, care tips, and fascinating stories from the world of luxury jewelry.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-tan-dark w-4 h-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-deep-red hover:bg-deep-red/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {selectedCategory === 'All' && !searchTerm && (
          <Card className="mb-12 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <Badge className="mb-4 bg-deep-red text-white">Featured</Badge>
                <h2 className="text-2xl font-bold text-charcoal mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-warm-tan-dark mb-4 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-warm-tan-dark">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-warm-tan-dark">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-warm-tan-dark">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.id}`}>
                  <Button className="bg-deep-red hover:bg-deep-red/90 text-white">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Article Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(selectedCategory === 'All' && !searchTerm ? 1 : 0).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-charcoal">
                    {post.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-charcoal mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-warm-tan-dark mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-warm-tan-dark">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="ghost" size="sm" className="text-deep-red hover:text-deep-red/80">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-warm-tan-dark text-lg">
              No articles found matching your search criteria.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="mt-16 bg-gradient-to-r from-deep-red to-deep-red/80 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 opacity-90">
              Get the latest jewelry insights, care tips, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white text-charcoal"
              />
              <Button variant="secondary" className="bg-white text-deep-red hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}