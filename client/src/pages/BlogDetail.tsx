import { useRoute } from 'wouter';
import { Link } from 'wouter';
import { Calendar, User, Clock, Share2, Heart, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock blog data (in a real app, this would come from an API)
const blogPosts = {
  1: {
    id: 1,
    title: "The Art of Vintage Jewelry Authentication",
    content: `
      <p>In the world of luxury jewelry, authenticity is paramount. With the rise of sophisticated replicas and the increasing value of vintage pieces, the need for reliable authentication methods has never been greater. Enter artificial intelligence – a game-changing technology that's revolutionizing how we verify the authenticity of precious jewelry.</p>

      <h2>The Challenge of Traditional Authentication</h2>
      <p>Traditional jewelry authentication has long relied on the trained eye of experts, examining factors such as craftsmanship, materials, hallmarks, and provenance. While effective, this method has limitations:</p>
      <ul>
        <li>Subjectivity in human assessment</li>
        <li>Limited availability of experts</li>
        <li>Time-consuming processes</li>
        <li>Potential for human error</li>
      </ul>

      <h2>AI-Powered Authentication: A New Era</h2>
      <p>Modern AI systems can analyze thousands of data points in seconds, comparing patterns, materials, and craftsmanship against vast databases of authentic pieces. This technology offers several advantages:</p>

      <h3>Precision and Consistency</h3>
      <p>AI systems don't have off days or subjective biases. They analyze each piece with the same level of precision, ensuring consistent results across all evaluations.</p>

      <h3>Comprehensive Analysis</h3>
      <p>From microscopic engravings to metal composition, AI can detect details that might escape even the most trained human eye. This includes:</p>
      <ul>
        <li>Surface texture analysis</li>
        <li>Weight distribution patterns</li>
        <li>Gemstone characteristics</li>
        <li>Manufacturing technique identification</li>
      </ul>

      <h2>The Future of Jewelry Authentication</h2>
      <p>As AI technology continues to evolve, we can expect even more sophisticated authentication methods. Machine learning algorithms will become better at detecting new types of replicas, while blockchain technology may provide immutable records of a piece's authenticity and provenance.</p>

      <p>For collectors and enthusiasts, this means greater confidence in purchases and a more transparent marketplace. The days of uncertainty about a piece's authenticity are numbered, thanks to the power of artificial intelligence.</p>
    `,
    author: "Sarah Mitchell",
    date: "2025-01-15",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
    category: "Authentication",
    tags: ["AI", "Vintage", "Technology", "Authentication"]
  }
};

const relatedPosts = [
  {
    id: 2,
    title: "Investment Guide: Luxury Watches Worth Collecting",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Investment"
  },
  {
    id: 3,
    title: "Caring for Your Precious Gemstones",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "Care"
  },
  {
    id: 4,
    title: "The History of Art Deco Jewelry Design",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    category: "History"
  }
];

export default function BlogDetail() {
  const [, params] = useRoute('/blog/:id');
  const postId = parseInt(params?.id || '1');
  const post = blogPosts[postId] || blogPosts[1];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-deep-red text-white">
                {post.category}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-6 text-warm-tan-dark">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Social Share */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none text-charcoal"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                lineHeight: '1.7',
              }}
            />
          </CardContent>
        </Card>

        {/* Author Bio */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-deep-red to-warm-tan rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-charcoal mb-1">
                  {post.author}
                </h3>
                <p className="text-warm-tan-dark text-sm">
                  Jewelry authentication expert with over 15 years of experience in vintage and luxury pieces. 
                  Specializes in AI-powered authentication technologies and gemstone analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Related Articles */}
        <div>
          <h2 className="text-2xl font-bold text-charcoal mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-charcoal">
                      {relatedPost.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-charcoal mb-3 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <Link href={`/blog/${relatedPost.id}`}>
                    <Button variant="ghost" size="sm" className="text-deep-red hover:text-deep-red/80 p-0">
                      Read More →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-deep-red to-deep-red/80 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Never Miss an Update</h2>
            <p className="mb-6 opacity-90">
              Subscribe to our newsletter for the latest jewelry insights and expert tips.
            </p>
            <Link href="/blog">
              <Button variant="secondary" className="bg-white text-deep-red hover:bg-gray-100">
                Subscribe Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}