# AI Upload Service Documentation

## Overview

The DRUGGA Jewelry AI Upload Service provides comprehensive functionality for uploading jewelry images and performing AI-powered analysis. The service supports multiple upload methods, intelligent file validation, and advanced AI analysis capabilities.

## Features

- **Multiple Upload Methods**: File upload, drag-and-drop, base64 encoding
- **Intelligent Validation**: File type, size, and image quality validation
- **AI Analysis**: Authentication, valuation, material identification, condition assessment
- **Progress Tracking**: Real-time upload and analysis progress
- **Secure Storage**: Safe file handling with security checks
- **Result Export**: Download analysis results as JSON

## API Endpoints

### Upload and Analyze

#### POST `/upload/analyze`

Upload images for AI analysis.

**Request Methods:**

1. **Multipart Form Data** (for file uploads):

   ```
   Content-Type: multipart/form-data

   files: File[] (multiple files)
   data: JSON string (optional metadata)
   ```

2. **JSON** (for base64 images):
   ```json
   {
     "images": ["data:image/jpeg;base64,/9j/4AAQ...", "..."],
     "metadata": {
       "description": "User uploaded jewelry",
       "expectedCategory": "ring"
     },
     "priority": "normal"
   }
   ```

**Response:**

```json
{
  "job_id": "uuid-string",
  "task_id": "task-uuid",
  "status": "pending",
  "file_info": [
    {
      "file_id": "uuid",
      "filename": "processed_image.jpg",
      "original_name": "ring.jpg",
      "url": "/upload/files/images/processed_image.jpg",
      "processed_url": "/upload/files/processed/uuid_processed.jpg",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "format": "JPEG",
        "size_bytes": 245760
      }
    }
  ],
  "estimated_time_minutes": 5,
  "priority": "normal",
  "upload_successful": true
}
```

### Get Analysis Job Status

#### GET `/upload/jobs/{job_id}`

Retrieve the status and results of an analysis job.

**Response:**

```json
{
  "id": "job-uuid",
  "status": "completed",
  "priority": "normal",
  "progress_percentage": 100,
  "created_at": "2024-01-01T12:00:00Z",
  "completed_at": "2024-01-01T12:05:00Z",
  "estimated_time_minutes": 5,
  "results": {
    "authentication": {
      "confidence": 0.95,
      "status": "authentic",
      "details": "High authenticity probability based on craftsmanship analysis"
    },
    "valuation": {
      "estimated_value": 2500.0,
      "range": {
        "min": 2000.0,
        "max": 3000.0
      },
      "currency": "USD",
      "confidence": 0.85
    },
    "identification": {
      "materials": ["Gold", "Diamond"],
      "gemstones": ["Diamond"],
      "era": "1980s",
      "style": "Classic",
      "brand": "Unknown",
      "craftsmanship_quality": "High"
    },
    "condition": {
      "rating": "very_good",
      "details": ["Minor surface scratches", "Good structural integrity"],
      "restoration_needed": false
    },
    "image_analysis": [
      {
        "image_index": 0,
        "quality_score": 0.9,
        "detected_objects": ["ring", "gemstone"],
        "color_analysis": {
          "gold": 0.7,
          "clear": 0.3
        },
        "lighting_assessment": "good"
      }
    ]
  }
}
```

### Service Status

#### GET `/upload/status`

Get service configuration and status.

**Response:**

```json
{
  "service": "AI Upload Service",
  "status": "operational",
  "max_file_size_mb": 16,
  "max_files_per_request": 10,
  "allowed_extensions": ["jpg", "jpeg", "png", "gif", "webp", "tiff", "bmp"],
  "supported_analysis_types": [
    "authentication",
    "valuation",
    "material_identification",
    "gemstone_identification",
    "condition_assessment",
    "era_classification",
    "style_analysis"
  ]
}
```

### File Serving

#### GET `/upload/files/{path}`

Serve uploaded and processed files.

## TypeScript Client Usage

### Basic Setup

```typescript
import druggarAPI from "@/lib/api";

// Access the upload API
const uploadAPI = druggarAPI.upload;
```

### File Upload

```typescript
const handleFileUpload = async (files: FileList) => {
  try {
    // Validate files
    for (const file of Array.from(files)) {
      const validation = await uploadAPI.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // Upload files
    const response = await uploadAPI.uploadFiles(
      files,
      {
        description: "Jewelry analysis request",
        expectedCategory: "ring",
      },
      "normal",
    );

    console.log("Upload successful:", response.data);

    // Wait for analysis
    const result = await uploadAPI.waitForAnalysisCompletion(
      response.data.job_id,
    );

    console.log("Analysis complete:", result.data);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Base64 Upload

```typescript
const uploadBase64Image = async (base64Data: string) => {
  try {
    const response = await uploadAPI.uploadBase64Images(
      [base64Data],
      {
        description: "Base64 encoded image",
        notes: "Captured from camera",
      },
      "high",
    );

    return response.data;
  } catch (error) {
    console.error("Base64 upload failed:", error);
  }
};
```

### Progress Tracking

```typescript
const uploadWithProgress = async (files: FileList) => {
  const progressTracker = uploadAPI.createProgressTracker((progress) => {
    console.log(`Upload progress: ${progress}%`);
    // Update UI progress bar
  });

  const response = await uploadAPI.uploadFiles(
    files,
    { description: "Progress tracked upload" },
    "normal",
  );

  // Poll for completion with progress updates
  const result = await uploadAPI.waitForAnalysisCompletion(
    response.data.job_id,
    60, // max attempts
    5000, // 5 second intervals
  );

  return result.data;
};
```

## React Component Usage

### Basic Component

```tsx
import AIUploadComponent from "@/components/AIUploadComponent";

const MyPage = () => {
  const handleAnalysisComplete = (result) => {
    console.log("Analysis completed:", result);
    // Handle results
  };

  const handleError = (error) => {
    console.error("Upload error:", error);
    // Show error message
  };

  return (
    <AIUploadComponent
      onAnalysisComplete={handleAnalysisComplete}
      onError={handleError}
      maxFiles={5}
      className="my-upload-component"
    />
  );
};
```

### Custom Implementation

```tsx
import { useState, useCallback } from "react";
import druggarAPI from "@/lib/api";

const CustomUpload = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    try {
      setStatus("uploading");

      const response = await druggarAPI.upload.uploadFiles(files);

      setStatus("analyzing");

      const result = await druggarAPI.upload.waitForAnalysisCompletion(
        response.data.job_id,
      );

      setStatus("completed");
      console.log("Results:", result.data);
    } catch (error) {
      setStatus("error");
      console.error("Failed:", error);
    }
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="drop-zone"
    >
      {status === "idle" && "Drop jewelry images here"}
      {status === "uploading" && "Uploading..."}
      {status === "analyzing" && "Analyzing..."}
      {status === "completed" && "Analysis complete!"}
      {status === "error" && "Upload failed"}
    </div>
  );
};
```

## Configuration

### File Limits

- **Maximum file size**: 16MB per file
- **Maximum files per request**: 10 files
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP, TIFF, BMP

### Analysis Types

1. **Authentication**: Determines if jewelry is authentic or replica
2. **Valuation**: Estimates monetary value and range
3. **Material Identification**: Identifies metals and materials
4. **Gemstone Identification**: Identifies precious stones
5. **Condition Assessment**: Evaluates wear and condition
6. **Era Classification**: Determines historical period
7. **Style Analysis**: Identifies design style and characteristics

### Priority Levels

- **low**: Lower priority, longer processing time
- **normal**: Standard priority (default)
- **high**: Higher priority, faster processing

## Error Handling

### Common Errors

1. **File too large**: Reduce file size or compress image
2. **Invalid file type**: Use supported image formats
3. **Too many files**: Limit to 10 files per request
4. **Analysis timeout**: Job took too long to complete
5. **Invalid image**: File is corrupted or not a valid image

### Error Response Format

```json
{
  "error": "File size 20MB exceeds maximum allowed size 16MB"
}
```

## Security Considerations

1. **File validation**: All uploads are validated for type and content
2. **Path traversal protection**: File serving includes security checks
3. **Size limits**: Prevents large file DoS attacks
4. **Content verification**: Images are verified before processing
5. **Temporary storage**: Files are cleaned up after processing

## Performance Tips

1. **Image optimization**: Service automatically optimizes images for analysis
2. **Batch uploads**: Upload multiple images in single request
3. **Progress tracking**: Use progress callbacks for better UX
4. **Result caching**: Analysis results are cached for fast retrieval
5. **Async processing**: All analysis is performed asynchronously

## Testing

### Running the Service

```bash
# Start the upload service
cd /path/to/drugga-jewelry
python3 api/simple_upload_service.py
```

### Testing Endpoints

```bash
# Check service status
curl http://localhost:5000/upload/status

# Upload test image (requires multipart form data)
curl -X POST -F "files=@test_image.jpg" http://localhost:5000/upload/analyze

# Check job status
curl http://localhost:5000/upload/jobs/{job_id}
```

## Production Deployment

### Required Dependencies

```bash
pip install flask werkzeug pillow
```

### Environment Variables

```bash
export UPLOAD_FOLDER=/path/to/uploads
export MAX_FILE_SIZE=16777216  # 16MB
export MAX_FILES_PER_REQUEST=10
```

### WSGI Configuration

```python
from api.simple_upload_service import app

if __name__ == "__main__":
    app.run()
```

## Integration with Existing API

The upload service integrates seamlessly with the existing DRUGGA API:

```typescript
// All upload functionality is available through the main API
import druggarAPI from "@/lib/api";

// Use upload service
druggarAPI.upload.uploadFiles(files);

// Use other services
druggarAPI.products.getProducts();
druggarAPI.auth.login(credentials);
```
