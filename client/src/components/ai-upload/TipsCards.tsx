import { Sun, Search, Images, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TipsCards() {
  return (
    <div className="space-y-6">
      {/* Upload Tips */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-semibold text-charcoal mb-4">Photography Tips</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <Sun className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Good Lighting</h4>
                <p className="text-sm text-warm-tan-dark">Use natural light or bright indoor lighting for best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Clear Details</h4>
                <p className="text-sm text-warm-tan-dark">Capture hallmarks, stamps, and unique features clearly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <Images className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Multiple Angles</h4>
                <p className="text-sm text-warm-tan-dark">Include front, back, side views and any inscriptions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Process Info */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-charcoal mb-2">AI Authentication Process</h4>
              <p className="text-warm-tan-dark text-sm mb-3">Our advanced AI analyzes your jewelry photos to:</p>
              <ul className="text-sm text-warm-tan-dark space-y-1">
                <li>• Identify materials and gemstones</li>
                <li>• Detect hallmarks and maker's marks</li>
                <li>• Estimate age and style period</li>
                <li>• Assess condition and authenticity</li>
                <li>• Provide preliminary valuation range</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}