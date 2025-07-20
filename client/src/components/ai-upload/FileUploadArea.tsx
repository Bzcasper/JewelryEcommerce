import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface FileUploadAreaProps {
  files: UploadedFile[];
  onFileSelect: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
  uploadProgress: number;
}

export default function FileUploadArea({ 
  files, 
  onFileSelect, 
  onRemoveFile, 
  uploadProgress 
}: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
    onFileSelect(droppedFiles);
  };

  return (
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
          onChange={(e) => e.target.files && onFileSelect(e.target.files)}
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
                onClick={() => onRemoveFile(file.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}