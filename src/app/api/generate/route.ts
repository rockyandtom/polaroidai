import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';
import { withApiMonitoring, logEnvironmentVariables } from '@/lib/api-middleware';

// 硬编码密钥（临时解决方案）
const API_BASE_URL = 'https://www.runninghub.cn';
const API_KEY = 'fb88fac46b0349c1986c9cbb4f14d44e';
const WEBAPP_ID = '1912088541617422337';
const NODE_ID = '226';

/**
 * 处理生成请求的核心逻辑
 */
async function handleGenerate(request: NextRequest) {
  try {
    // 检查API配置 - 使用硬编码密钥，应该总是存在
    if (!API_KEY) {
      logger.error('生成API：未配置API密钥');
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量' },
        { status: 500 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { imageId } = body;
    
    if (!imageId) {
      logger.warn('生成API：请求中没有图片ID');
      return NextResponse.json(
        { error: 'No image ID provided' },
        { status: 400 }
      );
    }
    
    logger.info('生成图片', { imageId });
    
    // 构建请求数据
    const requestData = {
      webappId: WEBAPP_ID,
      apiKey: API_KEY,
      nodeInfoList: [{
        nodeId: NODE_ID,
        fieldName: "image",
        fieldValue: imageId
      }]
    };
    
    // 记录API请求信息
    logger.debug('生成API：请求配置', {
      url: `${API_BASE_URL}/task/openapi/ai-app/run`,
      webappId: WEBAPP_ID,
      nodeId: NODE_ID,
      imageId
    });
    
    // 发送请求到 RunningHub
    logger.debug('生成API：请求数据', requestData);
    
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    logger.info('生成API：接收到响应', response.data);
    
    // 返回响应
    return NextResponse.json(response.data);
  } catch (error: any) {
    // 详细记录错误
    logger.error('生成API：处理失败', error);
    
    if (error.response) {
      logger.error('生成API：服务器响应错误', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // 返回错误响应
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error.message,
        response: error.response?.data || null
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * 生成API处理函数
 */
export async function POST(request: NextRequest) {
  logger.info('收到生成请求');
  return withApiMonitoring(request, handleGenerate, '生成API');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 