import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileUploadArea from '@/components/ai-upload/FileUploadArea';
import AnalysisForm from '@/components/ai-upload/AnalysisForm';
import AnalysisStatusCard from '@/components/ai-upload/AnalysisStatusCard';
import TipsCards from '@/components/ai-upload/TipsCards';
import RecentAnalysesList from '@/components/ai-upload/RecentAnalysesList';

export default function AIUpload() {
  const [jewelryType, setJewelryType] = useState('');
  const [estimatedEra, setEstimatedEra] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const { files, uploadProgress, handleFileSelect, removeFile, resetFiles } = useFileUpload();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's AI analyses
  const { data: analyses = [] } = useQuery({
    queryKey: ['/api/ai-analysis'],
    enabled: isAuthenticated,
  });

  // Poll for analysis updates
  const { data: currentAnalysis } = useQuery({
    queryKey: ['/api/ai-analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) return null;
      const response = await fetch(`/api/ai-analysis/${analysisId}`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      return response.json();
    },
    enabled: !!analysisId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const submitAnalysisMutation = useMutation({
    mutationFn: async (analysisData: any) => {
      const response = await apiRequest('POST', '/api/ai-analysis', analysisData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-analysis'] });
      setAnalysisId(data.id);
      toast({
        title: "Analysis submitted",
        description: "Your jewelry is being analyzed. Results will be available shortly.",
      });
      // Reset form
      resetFiles();
      setJewelryType('');
      setEstimatedEra('');
      setAdditionalInfo('');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one image of your jewelry.",
        variant: "destructive",
      });
      return;
    }

    if (!jewelryType) {
      toast({
        title: "Missing information",
        description: "Please select the jewelry type.",
        variant: "destructive",
      });
      return;
    }

    // Convert files to base64 or URLs for API submission
    const imageUrls = files.map(f => f.preview);

    const analysisData = {
      jewelryType,
      estimatedEra: estimatedEra || null,
      additionalInfo: additionalInfo || null,
      imageUrls,
    };

    submitAnalysisMutation.mutate(analysisData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pearl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-4">AI Jewelry Authentication</h2>
          <p className="text-lg text-warm-tan-dark">Upload photos of your jewelry for instant authentication and valuation</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FileUploadArea
                  files={files}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={removeFile}
                  uploadProgress={uploadProgress}
                />

                <AnalysisForm
                  jewelryType={jewelryType}
                  estimatedEra={estimatedEra}
                  additionalInfo={additionalInfo}
                  onJewelryTypeChange={setJewelryType}
                  onEstimatedEraChange={setEstimatedEra}
                  onAdditionalInfoChange={setAdditionalInfo}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitAnalysisMutation.isPending || files.length === 0}
                  className="w-full bg-deep-red text-white hover:bg-deep-red/90 py-4 text-lg font-semibold"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  {submitAnalysisMutation.isPending ? 'Submitting...' : 'Analyze with AI'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <TipsCards />
            <AnalysisStatusCard analysis={currentAnalysis} />
          </div>
        </div>

        <RecentAnalysesList analyses={analyses} />
      </div>

      <Footer />
    </div>
  );
}
