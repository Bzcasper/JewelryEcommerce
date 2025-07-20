import { Link } from 'wouter';
import { Home, Search, ArrowLeft, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error404() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <Card className="text-center">
          <CardContent className="p-8">
            {/* Large 404 with jewelry icon */}
            <div className="mb-8">
              <div className="text-6xl font-bold text-deep-red mb-4">404</div>
              <Gem className="w-16 h-16 mx-auto text-warm-tan-dark" />
            </div>
            
            {/* Error Message */}
            <h1 className="text-2xl font-bold text-charcoal mb-2">
              Page Not Found
            </h1>
            <p className="text-warm-tan-dark mb-8">
              The jewelry piece you're looking for seems to have been misplaced. 
              Let's help you find your way back to our collection.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-deep-red hover:bg-deep-red/90 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
              
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Collection
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full text-warm-tan-dark hover:text-charcoal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-warm-tan/20">
              <p className="text-sm text-warm-tan-dark">
                Need help? Contact our support team at{' '}
                <Link href="/contact" className="text-deep-red hover:underline">
                  support@luxuryjewelry.com
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}