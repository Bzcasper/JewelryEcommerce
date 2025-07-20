import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-pearl py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h4 className="font-semibold mb-4">About Drugga</h4>
            <ul className="space-y-2 text-sm text-warm-tan">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/authentication" className="hover:text-white transition-colors">Authentication</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-warm-tan">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/care" className="hover:text-white transition-colors">Care Instructions</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
            </ul>
          </div>

          {/* Sell With Us */}
          <div>
            <h4 className="font-semibold mb-4">Sell With Us</h4>
            <ul className="space-y-2 text-sm text-warm-tan">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/accepted-items" className="hover:text-white transition-colors">Accepted Items</Link></li>
              <li><Link href="/seller-faq" className="hover:text-white transition-colors">Seller FAQ</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-warm-tan">
              <li><a href="https://instagram.com" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://facebook.com" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://pinterest.com" className="hover:text-white transition-colors">Pinterest</a></li>
              <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-warm-tan">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-tan/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="hexagon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M6 3h12l4 6-4 6H6l-4-6z"/>
                <circle cx="12" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-white">Luxury Jewelry</h5>
              <p className="text-xs text-warm-tan">Premium Collection</p>
            </div>
          </div>
          <p className="text-sm text-warm-tan">© 2024 Luxury Jewelry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
