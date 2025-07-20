import { CheckCircle, Clock, AlertCircle, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuickPreview } from '@/components/ui/quick-preview';

interface RecentAnalysesListProps {
  analyses: any[];
}

export default function RecentAnalysesList({ analyses }: RecentAnalysesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (analyses.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg mt-8">
      <CardContent className="p-6">
        <h3 className="font-semibold text-charcoal mb-4">Recent Analyses</h3>
        <div className="space-y-3">
          {analyses.slice(0, 5).map((analysis: any) => (
            <div key={analysis.id} className="flex items-center justify-between p-3 border border-warm-tan/20 rounded-lg hover:border-warm-tan/40 transition-colors">
              <div className="flex items-center gap-3">
                {/* Image thumbnail with quick preview */}
                {analysis.imageUrls && analysis.imageUrls.length > 0 ? (
                  <div className="relative w-12 h-12 rounded overflow-hidden group">
                    <img
                      src={analysis.imageUrls[0]}
                      alt="Jewelry thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <QuickPreview
                      src={analysis.imageUrls[0]}
                      alt={`${analysis.jewelryType} preview`}
                      triggerClassName="absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-warm-tan/10 rounded flex items-center justify-center">
                    <Image className="w-6 h-6 text-warm-tan-dark" />
                  </div>
                )}
                
                {getStatusIcon(analysis.status)}
                <div>
                  <p className="font-medium text-charcoal capitalize">{analysis.jewelryType}</p>
                  <p className="text-sm text-warm-tan-dark">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(analysis.status)}>
                {analysis.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}