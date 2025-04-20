'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { downloadImagesAsZip } from '@/lib/utils';

// 模拟数据
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
  
  // 监听本地存储变化的函数
  const handleStorageChange = () => {
    if (demoMode) return; // 如果是演示模式，不需要监听变化
    
    try {
      const storedImages = localStorage.getItem('polaroidGallery');
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    } catch (err) {
      console.error('Error handling storage change:', err);
    }
  };
  
  // 加载图片
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      try {
        if (demoMode) {
          // 使用演示图片
          setImages(DEMO_IMAGES);
        } else {
          // 从浏览器存储中获取用户生成的图片
          const storedImages = localStorage.getItem('polaroidGallery');
          if (storedImages) {
            setImages(JSON.parse(storedImages));
          }
        }
      } catch (err) {
        console.error('Error loading gallery images:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImages();
    
    // 添加storage事件监听器
    if (!demoMode && typeof window !== 'undefined') {
      // 在客户端环境下创建自定义事件来检测localStorage的变化
      const intervalId = setInterval(() => {
        handleStorageChange();
      }, 2000); // 每2秒检查一次
      
      // 清理函数
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [demoMode]);
  
  // 切换图片选择
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  // 下载选中的图片
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
  
  // 清除选择
  const clearSelection = () => {
    setSelectedImages([]);
  };
  
  // 全选
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
        
        {/* 选择控制 */}
        {images.length > 0 && (
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              {selectedImages.length} of {images.length} selected
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={selectAll}
                className="btn btn-secondary text-sm"
                disabled={selectedImages.length === images.length}
              >
                Select All
              </button>
              
              <button 
                onClick={clearSelection}
                className="btn btn-secondary text-sm"
                disabled={selectedImages.length === 0}
              >
                Clear Selection
              </button>
              
              <button 
                onClick={downloadSelected}
                className="btn btn-primary text-sm"
                disabled={selectedImages.length === 0}
              >
                Download Selected
              </button>
            </div>
          </div>
        )}
        
        {/* 图片网格 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((imageUrl, index) => (
              <div 
                key={`${imageUrl}-${index}`}
                className={`relative cursor-pointer transform transition-transform duration-300 hover:scale-105 ${
                  selectedImages.includes(imageUrl) ? 'ring-4 ring-polaroid-blue' : ''
                }`}
                onClick={() => toggleImageSelection(imageUrl)}
              >
                <div className="polaroid-frame p-3 pb-10 bg-white shadow-md">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={imageUrl}
                      alt={`Polaroid image ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center text-sm text-gray-700">
                    {demoMode ? `Demo ${index + 1}` : `Creation ${index + 1}`}
                  </p>
                </div>
                
                {/* 选择指示器 */}
                {selectedImages.includes(imageUrl) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-polaroid-blue rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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