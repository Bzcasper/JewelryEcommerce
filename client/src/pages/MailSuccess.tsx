import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Mail, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MailSuccess() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <Card className="text-center">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="relative">
                <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
                <Mail className="w-8 h-8 absolute -bottom-1 -right-1 text-deep-red bg-white rounded-full p-1" />
              </div>
            </div>
            
            {/* Success Message */}
            <h1 className="text-2xl font-bold text-charcoal mb-2">
              Message Sent Successfully!
            </h1>
            <p className="text-warm-tan-dark mb-6">
              Thank you for contacting us. We've received your message and will get back to you 
              within 24 hours during business days.
            </p>
            
            {/* What's Next */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-charcoal mb-2">What happens next?</h3>
              <ul className="text-sm text-warm-tan-dark space-y-1">
                <li>• Our team will review your inquiry</li>
                <li>• You'll receive a confirmation email shortly</li>
                <li>• We'll respond within 24 hours</li>
                <li>• For urgent matters, call us at (555) 123-4567</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <Link href="/" className="block">
                <Button className="w-full bg-deep-red hover:bg-deep-red/90 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
              
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  Browse Jewelry Collection
                </Button>
              </Link>
              
              <Link href="/contact" className="block">
                <Button variant="ghost" className="w-full text-warm-tan-dark hover:text-charcoal">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Another Message
                </Button>
              </Link>
            </div>
            
            {/* Auto Redirect Info */}
            <div className="text-xs text-warm-tan-dark">
              Automatically redirecting to homepage in {countdown} seconds
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}