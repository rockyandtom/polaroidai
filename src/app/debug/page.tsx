'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 环境变量（仅限于NEXT_PUBLIC_前缀的）
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_RUNNINGHUB_API_KEY: process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY ? '已设置' : '未设置',
    NEXT_PUBLIC_RUNNINGHUB_WEBAPP_ID: process.env.NEXT_PUBLIC_RUNNINGHUB_WEBAPP_ID,
    NEXT_PUBLIC_RUNNINGHUB_NODE_ID: process.env.NEXT_PUBLIC_RUNNINGHUB_NODE_ID
  };
  
  // 浏览器信息
  const getBrowserInfo = () => {
    if (!isClient) return {};
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  };
  
  // 测试API连接
  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      console.error('API连接测试失败:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // 测试RunningHub API
  const testRunningHubApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      console.error('RunningHub API测试失败:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // 客户端渲染时设置isClient
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">系统调试页面</h1>
      
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline">
          返回首页
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 环境变量信息 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">环境变量</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
        
        {/* 浏览器信息 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">浏览器信息</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {isClient ? JSON.stringify(getBrowserInfo(), null, 2) : '加载中...'}
          </pre>
        </div>
        
        {/* API测试 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">API测试</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testApiConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              测试健康检查API
            </button>
            
            <button
              onClick={testRunningHubApi}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              测试RunningHub API
            </button>
          </div>
          
          {loading && (
            <div className="text-center p-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>请求中...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              <p className="font-semibold">错误</p>
              <p>{error}</p>
            </div>
          )}
          
          {apiResponse && (
            <div>
              <h3 className="font-semibold mb-2">响应结果</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* 网络诊断 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">网络诊断</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">网络状态:</p>
              <p>{isClient ? (navigator.onLine ? '在线' : '离线') : '加载中...'}</p>
            </div>
            
            <div>
              <p className="font-semibold">主机名:</p>
              <p>{isClient ? window.location.hostname : '加载中...'}</p>
            </div>
            
            <div>
              <p className="font-semibold">端口:</p>
              <p>{isClient ? window.location.port : '加载中...'}</p>
            </div>
            
            <div>
              <p className="font-semibold">协议:</p>
              <p>{isClient ? window.location.protocol : '加载中...'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        调试页面 | 版本 1.0.0 | 仅供开发使用
      </div>
    </div>
  );
} 