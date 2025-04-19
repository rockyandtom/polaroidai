import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';
import { withApiMonitoring, logEnvironmentVariables } from '@/lib/api-middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

/**
 * 处理结果请求的核心逻辑
 */
async function handleResult(request: NextRequest) {
  try {
    // 检查API配置
    if (!API_KEY) {
      logger.error('结果API：未配置API密钥');
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量' },
        { status: 500 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { taskId } = body;
    
    if (!taskId) {
      logger.warn('结果API：请求中没有任务ID');
      return NextResponse.json(
        { error: 'No task ID provided' },
        { status: 400 }
      );
    }
    
    logger.info('获取任务结果', { taskId });
    
    // 构建请求数据
    const requestData = {
      apiKey: API_KEY,
      taskId
    };
    
    // 记录API请求信息
    logger.debug('结果API：请求配置', {
      url: `${API_BASE_URL}/task/openapi/outputs`,
      taskId
    });
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/outputs`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    logger.debug('结果API：原始响应', response.data);
    
    if (response.data.code !== 0) {
      logger.error('结果API：响应错误', response.data);
      return NextResponse.json(
        { error: response.data.msg || 'Failed to get results' },
        { status: 500 }
      );
    }
    
    // 提取图像 URL
    const images = response.data.data
      .filter((item: any) => 
        item.fileUrl && (
          !item.fileType ||
          item.fileType.toLowerCase().includes('png') || 
          item.fileType.toLowerCase().includes('jpg') || 
          item.fileType.toLowerCase().includes('jpeg')
        )
      )
      .map((item: any) => item.fileUrl);
    
    logger.info('结果API：找到图像', { count: images.length, urls: images });
    
    // 返回图像 URL 列表
    return NextResponse.json({ images });
  } catch (error: any) {
    // 详细记录错误
    logger.error('结果API：处理失败', error);
    
    if (error.response) {
      logger.error('结果API：服务器响应错误', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // 返回错误响应
    return NextResponse.json(
      { 
        error: 'Failed to get results', 
        details: error.message,
        response: error.response?.data || null 
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * 结果API处理函数
 */
export async function POST(request: NextRequest) {
  logger.info('收到结果请求');
  return withApiMonitoring(request, handleResult, '结果API');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 