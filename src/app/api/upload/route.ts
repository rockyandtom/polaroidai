import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';
import { withApiMonitoring, logEnvironmentVariables } from '@/lib/api-middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

/**
 * 处理上传请求的核心逻辑
 */
async function handleUpload(request: NextRequest) {
  if (!request.body) {
    logger.warn('上传API：无请求体');
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  try {
    // 检查API配置
    if (!API_KEY) {
      logger.error('上传API：未配置API密钥');
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量' },
        { status: 500 }
      );
    }

    // 从请求中获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      logger.warn('上传API：请求中没有文件');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    logger.info('上传文件', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 转换为 FormData 发送到 RunningHub API
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    
    // 记录API请求信息
    logger.debug('上传API：准备发送请求', {
      url: `${API_BASE_URL}/task/openapi/upload?apiKey=${API_KEY}`,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/upload?apiKey=${API_KEY}`,
      apiFormData,
      {
        headers: {
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    logger.info('上传API：接收到响应', response.data);
    
    // 返回响应
    return NextResponse.json(response.data);
  } catch (error: any) {
    // 详细记录错误
    logger.error('上传API：处理失败', error);
    
    if (error.response) {
      logger.error('上传API：服务器响应错误', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message,
        response: error.response?.data || null
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * 上传API处理函数
 */
export async function POST(request: NextRequest) {
  logger.info('收到上传请求');
  return withApiMonitoring(request, handleUpload, '上传API');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 