import { useState } from 'react';

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const resetFiles = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setUploadProgress(0);
  };

  return {
    files,
    uploadProgress,
    handleFileSelect,
    removeFile,
    resetFiles
  };
}