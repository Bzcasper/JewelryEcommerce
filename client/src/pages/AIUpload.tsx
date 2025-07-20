import { useState, useEffect } from 'react';
import { Camera, Upload, Sun, Search, Images, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

export default function AIUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [jewelryType, setJewelryType] = useState('');
  const [estimatedEra, setEstimatedEra] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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
      setFiles([]);
      setJewelryType('');
      setEstimatedEra('');
      setAdditionalInfo('');
      setUploadProgress(0);
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

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(selectedFiles).forEach((file) => {
      if (file.type.startsWith('image/') && files.length + newFiles.length < 10) {
        const id = Math.random().toString(36).substring(7);
        const preview = URL.createObjectURL(file);
        newFiles.push({ file, preview, id });
      }
    });

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

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
                {/* File Upload Area */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-charcoal">Upload Images</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragOver
                        ? 'border-deep-red bg-deep-red/5'
                        : 'border-warm-tan hover:border-deep-red'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Camera className="w-12 h-12 text-warm-tan-dark mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-charcoal mb-2">Upload Jewelry Photos</h3>
                    <p className="text-warm-tan-dark mb-4">Drag and drop images here, or click to browse</p>
                    <p className="text-sm text-warm-tan-dark">Supports JPG, PNG, HEIC (Max 10MB per file)</p>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    />
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-warm-tan-dark">Uploading...</span>
                        <span className="text-warm-tan-dark">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Preview Images */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {files.map((file) => (
                        <div key={file.id} className="relative">
                          <img
                            src={file.preview}
                            alt="Upload preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jewelryType" className="text-sm font-medium text-charcoal">
                      Jewelry Type *
                    </Label>
                    <Select value={jewelryType} onValueChange={setJewelryType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ring">Ring</SelectItem>
                        <SelectItem value="necklace">Necklace</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="bracelet">Bracelet</SelectItem>
                        <SelectItem value="watch">Watch</SelectItem>
                        <SelectItem value="brooch">Brooch</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estimatedEra" className="text-sm font-medium text-charcoal">
                      Estimated Era (Optional)
                    </Label>
                    <Select value={estimatedEra} onValueChange={setEstimatedEra}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Unknown" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unknown</SelectItem>
                        <SelectItem value="victorian">Victorian (1837-1901)</SelectItem>
                        <SelectItem value="edwardian">Edwardian (1901-1915)</SelectItem>
                        <SelectItem value="artdeco">Art Deco (1920s-1930s)</SelectItem>
                        <SelectItem value="midcentury">Mid-Century (1940s-1960s)</SelectItem>
                        <SelectItem value="modern">Modern (1970s+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-sm font-medium text-charcoal">
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any known history, brand markings, or special features..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

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

          {/* Tips & Info */}
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

            {/* Current Analysis Status */}
            {currentAnalysis && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(currentAnalysis.status)}
                    <h4 className="font-semibold text-charcoal">Current Analysis</h4>
                    <Badge className={getStatusColor(currentAnalysis.status)}>
                      {currentAnalysis.status}
                    </Badge>
                  </div>
                  
                  {currentAnalysis.status === 'processing' && (
                    <div className="space-y-2">
                      <p className="text-sm text-warm-tan-dark">Analyzing your {currentAnalysis.jewelryType}...</p>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}

                  {currentAnalysis.status === 'completed' && currentAnalysis.analysisResults && (
                    <div className="space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Analysis Complete!</h5>
                        <div className="space-y-2 text-sm">
                          <p><strong>Materials:</strong> {currentAnalysis.analysisResults.materials?.join(', ')}</p>
                          <p><strong>Authenticity:</strong> {currentAnalysis.analysisResults.authenticity}</p>
                          <p><strong>Condition:</strong> {currentAnalysis.analysisResults.condition}</p>
                          <p><strong>Estimated Value:</strong> ${currentAnalysis.analysisResults.estimatedValue?.min} - ${currentAnalysis.analysisResults.estimatedValue?.max}</p>
                          <p><strong>Confidence:</strong> {Math.round((currentAnalysis.analysisResults.confidence || 0) * 100)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card className="shadow-lg mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-charcoal mb-4">Recent Analyses</h3>
              <div className="space-y-3">
                {analyses.slice(0, 5).map((analysis: any) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border border-warm-tan/20 rounded-lg">
                    <div className="flex items-center gap-3">
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
        )}
      </div>

      <Footer />
    </div>
  );
}
