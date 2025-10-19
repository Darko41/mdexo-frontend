import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaTimes, FaGripLines, FaCheck, FaExclamationTriangle, FaCloudUploadAlt, FaRedo } from 'react-icons/fa';

const ImageUpload = ({ onImagesChange, existingImages = [] }) => {
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});

  const MAX_IMAGES = 10;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

  // Initialize with existing images
  useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageObjects = existingImages.map(url => ({
        url,
        preview: url,
        id: Math.random().toString(36).substr(2, 9),
        status: 'uploaded',
        name: 'Existing Image',
        size: 0
      }));
      setImages(existingImageObjects);
    }
  }, [existingImages]);

  const onDrop = useCallback((acceptedFiles) => {
    // Validation
    if (images.length + acceptedFiles.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const oversized = acceptedFiles.find(f => f.size > MAX_SIZE);
    if (oversized) {
      alert('Images must be under 5MB each');
      return;
    }

    const totalSize = [...images, ...acceptedFiles].reduce((sum, f) => sum + (f.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert('Total size must be under 50MB');
      return;
    }

    // Create preview URLs and add to images
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, uploading, uploaded, error
      name: file.name,
      size: file.size
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: MAX_SIZE
  });

  const removeImage = (id) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      updateParent(newImages);
      return newImages;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });

    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const retryUpload = async (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.file) return;

    await uploadSingleImage(image);
  };

  const moveImage = (fromIndex, toIndex) => {
    setImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      updateParent(newImages);
      return newImages;
    });
  };

  const updateParent = (imageList) => {
    if (onImagesChange) {
      const uploadedUrls = imageList
        .filter(img => img.status === 'uploaded' && img.url)
        .map(img => img.url);
      onImagesChange(uploadedUrls);
    }
  };

  const uploadSingleImage = async (image) => {
    try {
      // Update status to uploading
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'uploading' } : img
      ));

      setUploadErrors(prev => ({ ...prev, [image.id]: null }));

      const formData = new FormData();
      formData.append('image', image.file);

      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({
            ...prev,
            [image.id]: progress
          }));
        },
      });

      // Update status to uploaded
      setImages(prev => prev.map(img => 
        img.id === image.id ? { 
          ...img, 
          status: 'uploaded', 
          url: response.data.url 
        } : img
      ));

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[image.id];
        return newProgress;
      });

      return response.data.url;

    } catch (error) {
      console.error('Upload failed:', error);
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'error' } : img
      ));
      
      setUploadErrors(prev => ({
        ...prev,
        [image.id]: error.response?.data?.message || 'Upload failed'
      }));

      throw error;
    }
  };

  const uploadImages = async () => {
    setIsUploading(true);
    setUploadErrors({});

    const uploadedUrls = [];
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');

    // Upload images SEQUENTIALLY to avoid overwhelming the server
    for (let i = 0; i < pendingImages.length; i++) {
      const image = pendingImages[i];
      
      try {
        const imageUrl = await uploadSingleImage(image);
        uploadedUrls.push(imageUrl);
        
        // Small delay between uploads to prevent memory issues
        if (i < pendingImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`Failed to upload ${image.name}:`, error);
        // Continue with next image even if one fails
      }
    }

    setIsUploading(false);
    
    // Update parent with all successfully uploaded URLs
    const allUploadedUrls = images
      .filter(img => img.status === 'uploaded' && img.url)
      .map(img => img.url);
    
    if (onImagesChange) {
      onImagesChange(allUploadedUrls);
    }
  };

  const ImageThumbnail = ({ image, index }) => (
    <div className="relative group bg-white rounded-lg border-2 border-gray-200 p-2 transition-all hover:shadow-md">
      <div className="relative">
        <img
          src={image.preview || image.url}
          alt={`Preview ${index + 1}`}
          className="w-full h-24 object-cover rounded-md"
          onError={(e) => {
            e.target.src = '/api/placeholder/150/150'; // Fallback image
          }}
        />
        
        {/* Progress bar */}
        {image.status === 'uploading' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 rounded-b-md">
            <div 
              className="bg-blue-500 h-1 rounded-b-md transition-all duration-300"
              style={{ width: `${uploadProgress[image.id] || 0}%` }}
            />
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute top-1 right-1 flex flex-col space-y-1">
          {image.status === 'uploaded' && (
            <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              <FaCheck />
            </div>
          )}
          
          {image.status === 'error' && (
            <button
              onClick={() => retryUpload(image.id)}
              className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-yellow-600 transition-colors"
              title="Retry upload"
            >
              <FaRedo />
            </button>
          )}
        </div>

        {/* Drag handle */}
        <div className="absolute top-1 left-1 bg-gray-800 bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-move">
          <FaGripLines />
        </div>

        {/* Remove button */}
        <button
          onClick={() => removeImage(image.id)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove image"
        >
          <FaTimes />
        </button>
      </div>

      {/* Image info */}
      <div className="mt-2 text-xs text-gray-600">
        <div className="font-medium truncate" title={image.name}>
          {image.name}
        </div>
        <div className="text-gray-500 flex justify-between">
          <span>
            {image.size > 0 ? `${(image.size / 1024 / 1024).toFixed(1)} MB` : 'Existing'}
          </span>
          <span className={`capitalize ${
            image.status === 'uploaded' ? 'text-green-600' :
            image.status === 'error' ? 'text-red-600' :
            image.status === 'uploading' ? 'text-blue-600' :
            'text-gray-500'
          }`}>
            {image.status}
          </span>
        </div>
        
        {/* Error message */}
        {uploadErrors[image.id] && (
          <div className="text-red-500 text-xs mt-1 truncate" title={uploadErrors[image.id]}>
            {uploadErrors[image.id]}
          </div>
        )}
      </div>
    </div>
  );

  const uploadedCount = images.filter(img => img.status === 'uploaded').length;
  const errorCount = images.filter(img => img.status === 'error').length;
  const totalCount = images.length;
  const canUpload = totalCount > 0 && uploadedCount !== totalCount;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400" />
          <div className="text-gray-700">
            <strong>Drag & drop images here</strong>
          </div>
          <div className="text-sm text-gray-500">
            or click to select files
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Maximum {MAX_IMAGES} images, 5MB each, 50MB total</div>
            <div>Images will be automatically optimized to Full HD + compressed</div>
            <div className="text-green-600">✓ Auto-resize to 1920x1080 ✓ Convert to WebP/JPEG ✓ 80% quality</div>
          </div>
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">
              Images ({totalCount}/{MAX_IMAGES})
              {uploadedCount > 0 && <span className="text-green-600 ml-2">• {uploadedCount} uploaded</span>}
              {errorCount > 0 && <span className="text-red-600 ml-2">• {errorCount} failed</span>}
            </h3>
            <div className="text-sm text-gray-500">
              Drag to reorder • First image = cover photo
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="cursor-move transition-transform hover:scale-105"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  moveImage(fromIndex, index);
                }}
              >
                <ImageThumbnail image={image} index={index} />
              </div>
            ))}
          </div>

          {/* Upload status and button */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              {uploadedCount === totalCount ? (
                <span className="text-green-600 flex items-center">
                  <FaCheck className="mr-1" /> All images uploaded and optimized
                </span>
              ) : (
                <span>
                  {uploadedCount} of {totalCount} images uploaded
                  {errorCount > 0 && <span className="text-red-600 ml-2">({errorCount} need attention)</span>}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              {totalCount > 0 && (
                <button
                  onClick={() => {
                    setImages([]);
                    setUploadProgress({});
                    setUploadErrors({});
                    if (onImagesChange) onImagesChange([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              
              <button
                onClick={uploadImages}
                disabled={isUploading || !canUpload}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : uploadedCount === totalCount ? (
                  <span>All Uploaded ✓</span>
                ) : (
                  <span>Upload {totalCount - uploadedCount} Images</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;