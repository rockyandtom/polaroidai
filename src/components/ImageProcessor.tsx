'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { compressImage, createDownloadLink } from '@/lib/utils';

export default function ImageProcessor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // 重置状态
      setError(null);
      setProcessedImage(null);
      setIsUploading(true);
      
      // 压缩图像
      const compressedFile = await compressImage(file);
      
      // 创建并显示本地预览
      const localUrl = URL.createObjectURL(compressedFile);
      setOriginalImage(localUrl);
      
      setIsUploading(false);
    } catch (err) {
      console.error('Error processing file:', err);
      setIsUploading(false);
      setError('Failed to process the selected image. Please try again.');
    }
  };
  
  // 生成 Polaroid 风格图像
  const generatePolaroid = async () => {
    if (!originalImage) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      setProgress(0);
      
      // 上传图像
      const formData = new FormData();
      const response = await fetch(originalImage);
      const blob = await response.blob();
      formData.append('file', blob, 'image.jpg');
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      if (uploadData.code !== 0) {
        throw new Error(uploadData.msg || 'Upload failed');
      }
      
      const imageId = uploadData.data.fileName;
      
      // 发起 AI 任务
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageId })
      });
      
      if (!generateResponse.ok) {
        throw new Error('Failed to start generation process');
      }
      
      const generateData = await generateResponse.json();
      if (generateData.code !== 0) {
        throw new Error(generateData.msg || 'Generation failed');
      }
      
      const taskId = generateData.data.taskId;
      
      // 开始轮询结果
      startPolling(taskId);
    } catch (err) {
      console.error('Error generating Polaroid:', err);
      setIsProcessing(false);
      setError('Failed to generate image. Please try again.');
    }
  };
  
  // 轮询任务状态
  const startPolling = useCallback((taskId: string) => {
    // 清除旧的轮询
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    const pollStatus = async () => {
      try {
        // 获取任务状态
        const statusResponse = await fetch('/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskId })
        });
        
        if (!statusResponse.ok) {
          throw new Error('Failed to check status');
        }
        
        const statusData = await statusResponse.json();
        setProgress(statusData.progress || 0);
        
        // 任务完成
        if (statusData.status === 'COMPLETED') {
          clearInterval(pollIntervalRef.current!);
          
          // 获取结果
          const resultResponse = await fetch('/api/result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId })
          });
          
          if (!resultResponse.ok) {
            throw new Error('Failed to get result');
          }
          
          const resultData = await resultResponse.json();
          
          if (resultData.images && resultData.images.length > 0) {
            setProcessedImage(resultData.images[0]);
            setIsProcessing(false);
            
            // 添加到 gallery 的逻辑可以在这里
            saveToGallery(resultData.images[0]);
          } else {
            throw new Error('No images returned');
          }
        } else if (statusData.status === 'ERROR') {
          throw new Error('Task processing failed');
        }
      } catch (err) {
        console.error('Error in polling:', err);
        setIsProcessing(false);
        setError('Failed to generate image. Please try again.');
        clearInterval(pollIntervalRef.current!);
      }
    };
    
    // 立即执行一次，然后每 3 秒轮询一次
    pollStatus();
    pollIntervalRef.current = setInterval(pollStatus, 3000);
  }, []);
  
  // 保存到画廊
  const saveToGallery = async (imageUrl: string) => {
    try {
      // 这里可以实现保存到画廊的逻辑
      // 例如发送请求到后端 API 或者存储在本地存储中
      console.log('Saving to gallery:', imageUrl);
    } catch (err) {
      console.error('Error saving to gallery:', err);
    }
  };
  
  // 下载图像
  const downloadImage = () => {
    if (processedImage) {
      createDownloadLink(processedImage, 'polaroid-image.jpg');
    }
  };
  
  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // 清理资源
  const resetAll = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    setOriginalImage(null);
    setProcessedImage(null);
    setIsUploading(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };
  
  return (
    <section id="upload" className="section bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Transform Your Photo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 原始图像区域 */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Original Photo</h3>
            
            <div className="w-full aspect-square max-w-md bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative">
              {isUploading ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Uploading...</p>
                </div>
              ) : originalImage ? (
                <Image 
                  src={originalImage} 
                  alt="Original image" 
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No image selected</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={triggerFileInput} 
                className="btn btn-primary"
                disabled={isUploading || isProcessing}
              >
                {originalImage ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              {originalImage && (
                <button 
                  onClick={resetAll} 
                  className="btn btn-secondary"
                  disabled={isUploading || isProcessing}
                >
                  Clear
                </button>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
          {/* 处理后图像区域 */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Polaroid Result</h3>
            
            <div className="w-full aspect-square max-w-md bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative">
              {isProcessing ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Generating Polaroid... {progress}%</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                    <div 
                      className="h-full bg-polaroid-blue rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : processedImage ? (
                <div className="polaroid-frame w-full h-full flex items-center justify-center p-4">
                  <div className="relative w-full h-full">
                    <Image 
                      src={processedImage} 
                      alt="Polaroid image" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m3-3V5a2 2 0 012-2h4a2 2 0 012 2v6m-5 3v6" />
                  </svg>
                  <p>{originalImage ? 'Ready to transform' : 'Upload an image first'}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={generatePolaroid} 
                className="btn btn-primary"
                disabled={!originalImage || isProcessing || isUploading}
              >
                Generate Polaroid
              </button>
              
              {processedImage && (
                <button 
                  onClick={downloadImage} 
                  className="btn btn-secondary"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {/* 使用说明 */}
        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload your photo using the button above</li>
            <li>Click the "Generate Polaroid" button to transform your image</li>
            <li>Wait a few moments while our AI works its magic</li>
            <li>Download your Polaroid-style image when it's ready</li>
            <li>Your image will automatically be added to the gallery below</li>
          </ol>
        </div>
      </div>
    </section>
  );
} 