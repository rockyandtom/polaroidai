import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';
import { logEnvironmentVariables } from '@/lib/api-middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

export async function POST(request: NextRequest) {
  try {
    logger.info('调试API被调用');
    
    // 检查环境变量
    const envVars = logEnvironmentVariables();
    
    // 如果没有配置API密钥，返回错误
    if (!API_KEY) {
      logger.error('调试API：未配置API密钥');
      return NextResponse.json(
        { 
          status: 'error',
          message: 'API密钥未配置，请检查环境变量',
          env: envVars
        },
        { status: 500 }
      );
    }
    
    // 测试RunningHub API连接
    logger.info('调试API：测试RunningHub API连接');
    
    try {
      // 发起一个简单的API请求
      const response = await axios.get(
        `${API_BASE_URL}/task/openapi/ping?apiKey=${API_KEY}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Host': 'www.runninghub.cn',
            'Accept': 'application/json'
          }
        }
      );
      
      logger.info('RunningHub API连接测试响应', response.data);
      
      return NextResponse.json({
        status: 'success',
        message: 'RunningHub API连接成功',
        timestamp: new Date().toISOString(),
        data: response.data,
        env: envVars
      });
    } catch (apiError: any) {
      // API请求失败
      logger.error('RunningHub API连接测试失败', apiError);
      
      return NextResponse.json({
        status: 'error',
        message: 'RunningHub API连接失败',
        timestamp: new Date().toISOString(),
        error: {
          message: apiError.message,
          response: apiError.response?.data || null,
          status: apiError.response?.status || null
        },
        env: envVars
      });
    }
  } catch (error) {
    logger.error('调试API错误', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 