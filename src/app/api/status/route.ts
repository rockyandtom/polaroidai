import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';
import { withApiMonitoring, logEnvironmentVariables } from '@/lib/api-middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

/**
 * 处理状态请求的核心逻辑
 */
async function handleStatus(request: NextRequest) {
  try {
    // 检查API配置
    if (!API_KEY) {
      logger.error('状态API：未配置API密钥');
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量' },
        { status: 500 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { taskId } = body;
    
    if (!taskId) {
      logger.warn('状态API：请求中没有任务ID');
      return NextResponse.json(
        { error: 'No task ID provided' },
        { status: 400 }
      );
    }
    
    logger.info('检查任务状态', { taskId });
    
    // 构建请求数据
    const requestData = {
      apiKey: API_KEY,
      taskId
    };
    
    // 记录API请求信息
    logger.debug('状态API：请求配置', {
      url: `${API_BASE_URL}/task/openapi/status`,
      taskId
    });
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/status`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    logger.debug('状态API：原始响应', response.data);
    
    let status = 'UNKNOWN';
    let progress = 0;
    let errorMsg = null;
    
    // 处理状态信息
    if (response.data.code === 0) {
      logger.info('状态API：响应成功', response.data);
      
      if (typeof response.data.data === 'string') {
        if (response.data.data === 'SUCCESS' || response.data.data === 'COMPLETED') {
          status = 'COMPLETED';
          progress = 100;
        } else if (response.data.data === 'RUNNING' || response.data.data === 'PENDING') {
          status = 'RUNNING';
          progress = 50;
        } else if (response.data.data === 'FAILED' || response.data.data === 'ERROR') {
          status = 'ERROR';
          errorMsg = 'Task processing failed on server side';
          logger.error('状态API：任务处理失败', { taskId, serverStatus: response.data.data });
        } else {
          status = response.data.data;
        }
      } else if (response.data.data && typeof response.data.data === 'object') {
        status = response.data.data.status || 'UNKNOWN';
        progress = response.data.data.progress || 0;
        
        // 检查错误状态和详细信息
        if (status === 'ERROR' || status === 'FAILED') {
          errorMsg = response.data.data.message || response.data.data.error || 'Task processing failed';
          logger.error('状态API：任务处理失败（对象形式）', { 
            taskId, 
            serverStatus: status,
            errorDetails: response.data.data
          });
        }
      }
    } else {
      logger.error('状态API：响应错误', response.data);
      return NextResponse.json(
        { 
          error: response.data.msg || 'Failed to get status',
          details: response.data
        },
        { status: 500 }
      );
    }
    
    logger.info('状态API：处理后状态', { status, progress, errorMsg });
    
    // 返回处理后的状态
    const responseData = { status, progress };
    
    // 如果是错误状态，添加额外信息
    if (status === 'ERROR') {
      return NextResponse.json({
        ...responseData,
        error: errorMsg || 'Unknown error occurred during processing'
      });
    }
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    // 详细记录错误
    logger.error('状态API：处理失败', error);
    
    if (error.response) {
      logger.error('状态API：服务器响应错误', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // 返回错误响应
    return NextResponse.json(
      { 
        error: 'Failed to check status', 
        details: error.message,
        response: error.response?.data || null 
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * 状态API处理函数
 */
export async function POST(request: NextRequest) {
  logger.info('收到状态请求');
  return withApiMonitoring(request, handleStatus, '状态API');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 