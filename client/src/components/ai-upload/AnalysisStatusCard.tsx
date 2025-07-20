import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalysisStatusCardProps {
  analysis: any;
}

export default function AnalysisStatusCard({ analysis }: AnalysisStatusCardProps) {
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

  if (!analysis) return null;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {getStatusIcon(analysis.status)}
          <h4 className="font-semibold text-charcoal">Current Analysis</h4>
          <Badge className={getStatusColor(analysis.status)}>
            {analysis.status}
          </Badge>
        </div>
        
        {analysis.status === 'processing' && (
          <div className="space-y-2">
            <p className="text-sm text-warm-tan-dark">Analyzing your {analysis.jewelryType}...</p>
            <Progress value={75} className="h-2" />
          </div>
        )}

        {analysis.status === 'completed' && analysis.analysisResults && (
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Analysis Complete!</h5>
              <div className="space-y-2 text-sm">
                <p><strong>Materials:</strong> {analysis.analysisResults.materials?.join(', ')}</p>
                <p><strong>Authenticity:</strong> {analysis.analysisResults.authenticity}</p>
                <p><strong>Condition:</strong> {analysis.analysisResults.condition}</p>
                <p><strong>Estimated Value:</strong> ${analysis.analysisResults.estimatedValue?.min} - ${analysis.analysisResults.estimatedValue?.max}</p>
                <p><strong>Confidence:</strong> {Math.round((analysis.analysisResults.confidence || 0) * 100)}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}