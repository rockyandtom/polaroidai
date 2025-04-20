'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { compressImage, createDownloadLink } from '@/lib/utils';

// 调试信息类型定义
interface DebugInfo {
  uploadStarted?: string;
  uploadComplete?: string;
  uploadResponse?: any;
  uploadError?: {
    status?: number;
    statusText?: string;
    code?: number;
    message?: string;
    data?: any;
  };
  fileInfo?: {
    size: number;
    type: string;
  };
  generateStarted?: string;
  generateComplete?: string;
  generateResponse?: any;
  generateError?: {
    status?: number;
    statusText?: string;
    code?: number;
    message?: string;
    data?: any;
  };
  imageId?: string;
  taskId?: string;
  pollingStarted?: string;
  lastPolling?: string;
  statusResponse?: any;
  statusError?: {
    status?: number;
    statusText?: string;
    message?: string;
    data?: any;
  };
  currentStatus?: string;
  currentProgress?: number;
  completionTime?: string;
  resultComplete?: string;
  resultResponse?: any;
  resultError?: {
    status?: number;
    statusText?: string;
    message?: string;
    data?: any;
  };
  successImage?: string;
}

export default function ImageProcessor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
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
      setDebugInfo(null);
      
      // 上传图像
      const formData = new FormData();
      const response = await fetch(originalImage);
      const blob = await response.blob();
      formData.append('file', blob, 'image.jpg');
      
      // 记录调试信息
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        uploadStarted: new Date().toISOString(),
        fileInfo: {
          size: blob.size,
          type: blob.type
        }
      }));
      
      // 尝试上传，最多重试两次
      let uploadResponse: Response | undefined;
      let uploadAttempts = 0;
      const MAX_UPLOAD_ATTEMPTS = 3;
      
      while (uploadAttempts < MAX_UPLOAD_ATTEMPTS) {
        try {
          uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          // 如果成功，跳出循环
          if (uploadResponse.ok) break;
          
          // 否则等待一秒后重试
          uploadAttempts++;
          if (uploadAttempts < MAX_UPLOAD_ATTEMPTS) {
            console.warn(`上传失败，正在重试 (${uploadAttempts}/${MAX_UPLOAD_ATTEMPTS})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          uploadAttempts++;
          if (uploadAttempts < MAX_UPLOAD_ATTEMPTS) {
            console.warn(`上传异常，正在重试 (${uploadAttempts}/${MAX_UPLOAD_ATTEMPTS})...`, error);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      
      if (!uploadResponse || !uploadResponse.ok) {
        const errorData = await uploadResponse?.json().catch(() => null);
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          uploadError: {
            status: uploadResponse?.status,
            statusText: uploadResponse?.statusText,
            data: errorData
          }
        }));
        throw new Error('图片上传失败，请重试');
      }
      
      const uploadData = await uploadResponse.json();
      
      // 记录上传结果
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        uploadComplete: new Date().toISOString(),
        uploadResponse: uploadData
      }));
      
      if (uploadData.code !== 0) {
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          uploadError: {
            code: uploadData.code,
            message: uploadData.msg
          }
        }));
        throw new Error(uploadData.msg || '上传失败');
      }
      
      const imageId = uploadData.data.fileName;
      
      // 记录生成开始信息
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        generateStarted: new Date().toISOString(),
        imageId
      }));
      
      // 尝试发起AI任务，最多重试两次
      let generateResponse: Response | undefined;
      let generateAttempts = 0;
      const MAX_GENERATE_ATTEMPTS = 3;
      
      while (generateAttempts < MAX_GENERATE_ATTEMPTS) {
        try {
          generateResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageId })
          });
          
          // 如果成功，跳出循环
          if (generateResponse.ok) break;
          
          // 否则等待一秒后重试
          generateAttempts++;
          if (generateAttempts < MAX_GENERATE_ATTEMPTS) {
            console.warn(`生成请求失败，正在重试 (${generateAttempts}/${MAX_GENERATE_ATTEMPTS})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          generateAttempts++;
          if (generateAttempts < MAX_GENERATE_ATTEMPTS) {
            console.warn(`生成请求异常，正在重试 (${generateAttempts}/${MAX_GENERATE_ATTEMPTS})...`, error);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      
      if (!generateResponse || !generateResponse.ok) {
        const errorData = await generateResponse?.json().catch(() => null);
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          generateError: {
            status: generateResponse?.status,
            statusText: generateResponse?.statusText,
            data: errorData
          }
        }));
        throw new Error('无法启动图像生成流程，请重试');
      }
      
      const generateData = await generateResponse.json();
      
      // 记录生成响应
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        generateComplete: new Date().toISOString(),
        generateResponse: generateData
      }));
      
      if (generateData.code !== 0) {
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          generateError: {
            code: generateData.code,
            message: generateData.msg
          }
        }));
        throw new Error(generateData.msg || '生成失败');
      }
      
      const taskId = generateData.data.taskId;
      
      // 记录轮询开始
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        pollingStarted: new Date().toISOString(),
        taskId
      }));
      
      // 开始轮询结果
      startPolling(taskId);
    } catch (err) {
      console.error('Error generating Polaroid:', err);
      setIsProcessing(false);
      
      // 提供更友好的错误信息
      let errorMessage = '处理过程中出错';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };
  
  // 轮询任务状态
  const startPolling = useCallback((taskId: string) => {
    // 清除旧的轮询
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
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
        
        // 记录状态轮询结果
        const responseData = await statusResponse.json();
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          lastPolling: new Date().toISOString(),
          statusResponse: responseData
        }));
        
        if (!statusResponse.ok) {
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev,
            statusError: {
              status: statusResponse.status,
              statusText: statusResponse.statusText,
              data: responseData
            }
          }));
          
          // 重试逻辑
          retryCount++;
          if (retryCount <= MAX_RETRIES) {
            console.warn(`状态检查失败，正在重试 (${retryCount}/${MAX_RETRIES})...`);
            return; // 在下一个轮询周期重试
          }
          
          throw new Error('Failed to check status after multiple retries');
        }
        
        // 重置重试计数
        retryCount = 0;
        
        const statusData = responseData;
        setProgress(statusData.progress || 0);
        
        // 记录当前状态
        setDebugInfo((prev: DebugInfo | null) => ({
          ...prev,
          currentStatus: statusData.status,
          currentProgress: statusData.progress
        }));
        
        // 任务完成
        if (statusData.status === 'COMPLETED') {
          clearInterval(pollIntervalRef.current!);
          
          // 记录完成时间
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev,
            completionTime: new Date().toISOString()
          }));
          
          // 获取结果
          const resultResponse = await fetch('/api/result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId })
          });
          
          if (!resultResponse.ok) {
            const errorData = await resultResponse.json().catch(() => null);
            setDebugInfo((prev: DebugInfo | null) => ({
              ...prev,
              resultError: {
                status: resultResponse.status,
                statusText: resultResponse.statusText,
                data: errorData
              }
            }));
            throw new Error('Failed to get result');
          }
          
          const resultData = await resultResponse.json();
          
          // 记录结果
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev,
            resultComplete: new Date().toISOString(),
            resultResponse: resultData
          }));
          
          if (resultData.images && resultData.images.length > 0) {
            const imageUrl = resultData.images[0];
            setProcessedImage(imageUrl);
            setIsProcessing(false);
            
            // 记录成功图像URL
            setDebugInfo((prev: DebugInfo | null) => ({
              ...prev,
              successImage: imageUrl
            }));
            
            // 添加到 gallery
            saveToGallery(imageUrl);
          } else {
            setDebugInfo((prev: DebugInfo | null) => ({
              ...prev,
              resultError: {
                message: 'No images returned',
                data: resultData
              }
            }));
            throw new Error('No images returned');
          }
        } else if (statusData.status === 'ERROR') {
          clearInterval(pollIntervalRef.current!);
          
          // 提取详细错误信息
          const errorMessage = statusData.error || 'Task processing failed';
          
          setDebugInfo((prev: DebugInfo | null) => ({
            ...prev,
            statusError: {
              message: errorMessage,
              data: statusData
            }
          }));
          
          // 尝试显示更有用的错误信息给用户
          let userFriendlyError = '图像处理失败。';
          
          if (errorMessage.includes('server side')) {
            userFriendlyError += '服务器处理出现问题，请稍后再试。';
          } else if (errorMessage.includes('timeout')) {
            userFriendlyError += '处理超时，请尝试上传更小的图片或稍后再试。';
          } else if (errorMessage.includes('invalid')) {
            userFriendlyError += '您的图片可能不符合处理要求，请尝试使用不同的图片。';
          } else {
            userFriendlyError += '请尝试使用不同的图片或稍后再试。';
          }
          
          setIsProcessing(false);
          setError(userFriendlyError);
        }
      } catch (err) {
        console.error('Error in polling:', err);
        setIsProcessing(false);
        
        // 提供更友好的错误信息
        let errorMessage = '图像生成失败';
        if (err instanceof Error) {
          errorMessage += `: ${err.message}`;
        }
        
        setError(errorMessage);
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
      // 从本地存储中获取当前画廊图片
      const storedImages = localStorage.getItem('polaroidGallery');
      let galleryImages: string[] = storedImages ? JSON.parse(storedImages) : [];
      
      // 将新图片添加到开头，确保最新的图片在前面
      galleryImages.unshift(imageUrl);
      
      // 限制最多保存30张图片
      if (galleryImages.length > 30) {
        galleryImages = galleryImages.slice(0, 30);
      }
      
      // 保存到本地存储
      localStorage.setItem('polaroidGallery', JSON.stringify(galleryImages));
      console.log('Saved to gallery:', imageUrl);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* 原始图像区域 */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Original Photo</h3>
            
            <div className="w-full aspect-square max-w-md bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative">
              {isUploading ? (
                <div className="text-center p-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Uploading...</p>
                </div>
              ) : originalImage ? (
                <Image 
                  src={originalImage} 
                  alt="Original image" 
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 50vw"
                />
              ) : (
                <div className="text-center p-4 md:p-6">
                  <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm md:text-base">No image selected</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 md:mt-4">
              <button 
                onClick={triggerFileInput} 
                className="btn btn-primary text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                disabled={isUploading || isProcessing}
              >
                {originalImage ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              {originalImage && (
                <button 
                  onClick={resetAll} 
                  className="btn btn-secondary text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
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
          <div className="flex flex-col items-center mt-6 md:mt-0">
            <h3 className="text-xl font-semibold mb-4">Polaroid Result</h3>
            
            <div className="w-full aspect-square max-w-md bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative">
              {isProcessing ? (
                <div className="text-center p-4 md:p-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin mx-auto mb-2 md:mb-4"></div>
                  <p className="text-sm md:text-base">Generating Polaroid... {progress}%</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 md:mt-4">
                    <div 
                      className="h-full bg-polaroid-blue rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : processedImage ? (
                <div className="polaroid-frame w-full h-full flex items-center justify-center p-3 md:p-4">
                  <div className="relative w-full h-full">
                    <Image 
                      src={processedImage} 
                      alt="Polaroid image" 
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 90vw, 50vw"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 md:p-6">
                  <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m3-3V5a2 2 0 012-2h4a2 2 0 012 2v6m-5 3v6" />
                  </svg>
                  <p className="text-sm md:text-base">{originalImage ? 'Ready to transform' : 'Upload an image first'}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 md:mt-4">
              <button 
                onClick={generatePolaroid} 
                className="btn btn-primary text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                disabled={!originalImage || isProcessing || isUploading}
              >
                Generate Polaroid
              </button>
              
              {processedImage && (
                <button 
                  onClick={downloadImage} 
                  className="btn btn-secondary text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
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
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="ml-4 underline text-sm"
            >
              {debugMode ? '隐藏调试信息' : '显示调试信息'}
            </button>
          </div>
        )}
        
        {/* 调试信息 */}
        {debugMode && debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
            <h3 className="text-lg font-semibold mb-2">调试信息</h3>
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
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