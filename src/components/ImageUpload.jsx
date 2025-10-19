import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaTimes, FaGripLines, FaCheck, FaExclamationTriangle, FaCloudUploadAlt, FaRedo, FaStar } from 'react-icons/fa';

const ImageUpload = ({ onImagesChange, existingImages = [] }) => {
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const [dragIndex, setDragIndex] = useState(null);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const MAX_IMAGES = 10;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

  const onDrop = useCallback((acceptedFiles) => {
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

    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      name: file.name,
      size: file.size,
      isCover: images.length === 0 && acceptedFiles[0] === file // First image is cover
    }));

    setImages(prev => {
      const updated = [...prev, ...newImages];
      // Ensure only one cover image
      const hasCover = updated.some(img => img.isCover);
      if (!hasCover && updated.length > 0) {
        updated[0].isCover = true;
      }
      return updated;
    });
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
      const coverRemoved = prev.find(img => img.id === id)?.isCover;
      
      if (coverRemoved && newImages.length > 0) {
        newImages[0].isCover = true;
      }
      
      updateParent(newImages);
      return newImages;
    });
  };

  const setCoverImage = (id) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  // Enhanced drag and drop with visual feedback
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.parentNode);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
    
    // Visual feedback - slightly scale the item being dragged over
    const elements = document.querySelectorAll('.drag-item');
    elements.forEach(el => el.classList.remove('drag-over'));
    if (e.target.closest('.drag-item')) {
      e.target.closest('.drag-item').classList.add('drag-over');
    }
  };

  const handleDragEnd = (e) => {
    setDragIndex(null);
    const elements = document.querySelectorAll('.drag-item');
    elements.forEach(el => el.classList.remove('drag-over'));
  };

  const handleDropReorder = (e, index) => {
    e.preventDefault();
    handleDragEnd(e);
    
    if (dragItem.current !== null && dragItem.current !== index) {
      setImages(prev => {
        const newImages = [...prev];
        const [moved] = newImages.splice(dragItem.current, 1);
        newImages.splice(index, 0, moved);
        updateParent(newImages);
        return newImages;
      });
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const updateParent = (imageList) => {
    if (onImagesChange) {
      const imageFiles = imageList.map(img => img.file);
      onImagesChange(imageFiles);
    }
  };

  const ImageThumbnail = ({ image, index }) => (
    <div 
      className={`relative group bg-white rounded-lg border-2 p-2 transition-all duration-200 drag-item
        ${image.isCover ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}
        ${dragIndex === index ? 'scale-105 shadow-lg z-10' : 'hover:shadow-md'}
        ${dragIndex !== null && dragIndex !== index ? 'opacity-75' : ''}`}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDragEnd={handleDragEnd}
      onDrop={(e) => handleDropReorder(e, index)}
    >
      <div className="relative">
        <img
          src={image.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-24 object-cover rounded-md"
        />
        
        {/* Cover image badge */}
        {image.isCover && (
          <div className="absolute top-1 left-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <FaStar className="text-xs" />
            <span>Cover</span>
          </div>
        )}

        {/* Drag handle */}
        <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-grab active:cursor-grabbing">
          <FaGripLines />
        </div>

        {/* Remove button */}
        <button
          onClick={() => removeImage(image.id)}
          className="absolute top-1 right-8 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove image"
        >
          <FaTimes />
        </button>

        {/* Set as cover button */}
        {!image.isCover && (
          <button
            onClick={() => setCoverImage(image.id)}
            className="absolute bottom-1 left-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Set as cover"
          >
            <FaStar />
          </button>
        )}
      </div>

      {/* Image info */}
      <div className="mt-2 text-xs text-gray-600">
        <div className="font-medium truncate" title={image.name}>
          {image.name}
        </div>
        <div className="text-gray-500">
          {(image.size / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>
    </div>
  );

  const uploadedCount = images.length;
  const coverImage = images.find(img => img.isCover);

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
            <div>First image will be the cover photo - drag to reorder</div>
            <div className="text-green-600">✓ Auto-resize to 1920x1080 ✓ Convert to WebP/JPEG ✓ 80% quality</div>
          </div>
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium text-gray-800">
                Images ({uploadedCount}/{MAX_IMAGES})
              </h3>
              {coverImage && (
                <p className="text-sm text-yellow-600 flex items-center space-x-1">
                  <FaStar className="text-xs" />
                  <span>Cover: {coverImage.name}</span>
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Drag to reorder • Click ★ to set cover
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <ImageThumbnail key={image.id} image={image} index={index} />
            ))}
          </div>

          {/* Upload status */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {images.length} image(s) ready for upload
              {coverImage && (
                <span className="text-yellow-600 ml-2">• Cover photo set</span>
              )}
            </div>
            
            <button
              onClick={() => {
                setImages([]);
                if (onImagesChange) onImagesChange([]);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* CSS for drag and drop effects */}
      <style jsx>{`
        .drag-item {
          transition: all 0.2s ease;
        }
        .drag-item.drag-over {
          transform: scale(1.05);
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .drag-item:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;