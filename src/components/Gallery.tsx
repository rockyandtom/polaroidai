'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { downloadImagesAsZip } from '@/lib/utils';

// Mock data
const DEMO_IMAGES = [
  '/demo/polaroid1.jpg',
  '/demo/polaroid2.jpg',
  '/demo/polaroid3.jpg',
  '/demo/polaroid4.jpg',
  '/demo/polaroid5.jpg',
  '/demo/polaroid6.jpg',
];

interface GalleryProps {
  demoMode?: boolean;
}

export default function Gallery({ demoMode = true }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Monitor local storage changes
  const handleStorageChange = () => {
    if (demoMode) return; // No need to monitor changes in demo mode
    
    try {
      // 获取服务器保存的图片
      fetchGalleryImages();
    } catch (err) {
      console.error('Error handling storage change:', err);
    }
  };
  
  // 从服务器获取Gallery图片
  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images);
          
          // 同时更新本地存储，保持两者同步
          localStorage.setItem('polaroidGallery', JSON.stringify(data.images));
        }
      } else {
        // 如果服务器获取失败，回退到本地存储
        const storedImages = localStorage.getItem('polaroidGallery');
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        }
      }
    } catch (err) {
      console.error('Error fetching gallery images from server:', err);
      // 发生错误时回退到本地存储
      const storedImages = localStorage.getItem('polaroidGallery');
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    }
  };
  
  // Load images
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      try {
        if (demoMode) {
          // Use demo images
          setImages(DEMO_IMAGES);
        } else {
          // 优先从服务器获取图片
          await fetchGalleryImages();
        }
      } catch (err) {
        console.error('Error loading gallery images:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImages();
    
    // Add storage event listener
    if (!demoMode && typeof window !== 'undefined') {
      // Create custom event to detect localStorage changes in client environment
      const intervalId = setInterval(() => {
        handleStorageChange();
      }, 2000); // Check every 2 seconds
      
      // Cleanup function
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [demoMode]);
  
  // Toggle image selection
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  // Download selected images
  const downloadSelected = async () => {
    if (selectedImages.length === 0) return;
    
    try {
      await downloadImagesAsZip(
        selectedImages, 
        `polaroid-collection-${new Date().getTime()}.zip`
      );
    } catch (err) {
      console.error('Error downloading images:', err);
    }
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedImages([]);
  };
  
  // Select all
  const selectAll = () => {
    setSelectedImages([...images]);
  };
  
  return (
    <section id="gallery" className="section bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Gallery
        </h2>
        
        <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          {demoMode 
            ? 'Check out these amazing Polaroid-style images created with our AI generator.' 
            : 'Your Polaroid creations will appear here. Select and download your favorites!'}
        </p>
        
        {/* Selection controls */}
        {images.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center mb-6">
            <div className="text-sm text-gray-600 mb-4 w-full sm:w-auto text-center sm:text-left">
              {selectedImages.length} of {images.length} selected
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                onClick={selectAll}
                className="btn btn-secondary text-sm px-3 py-1.5"
                disabled={selectedImages.length === images.length}
              >
                Select All
              </button>
              
              <button 
                onClick={clearSelection}
                className="btn btn-secondary text-sm px-3 py-1.5"
                disabled={selectedImages.length === 0}
              >
                Clear
              </button>
              
              <button 
                onClick={downloadSelected}
                className="btn btn-primary text-sm px-3 py-1.5"
                disabled={selectedImages.length === 0}
              >
                Download Selected
              </button>
            </div>
          </div>
        )}
        
        {/* Image grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {images.map((imageUrl, index) => (
              <div 
                key={`${imageUrl}-${index}`}
                className={`relative cursor-pointer transform transition-transform duration-300 hover:scale-105 ${
                  selectedImages.includes(imageUrl) ? 'ring-4 ring-polaroid-blue' : ''
                }`}
                onClick={() => toggleImageSelection(imageUrl)}
              >
                <div className="polaroid-frame p-2 sm:p-3 pb-8 sm:pb-10 bg-white shadow-md">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={imageUrl}
                      alt={`Polaroid image ${index + 1}`}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  </div>
                  <p className="absolute bottom-2 sm:bottom-3 left-0 right-0 text-center text-xs sm:text-sm text-gray-700">
                    {demoMode ? `Demo ${index + 1}` : `Creation ${index + 1}`}
                  </p>
                </div>
                
                {/* Selection indicator */}
                {selectedImages.includes(imageUrl) && (
                  <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-polaroid-blue rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">No images in gallery yet</p>
            <p className="text-gray-500 mt-2">
              {demoMode
                ? 'Demo images will appear here'
                : 'Generated images will appear here'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 