import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { logEnvironmentVariables } from '@/lib/api-middleware';

export async function GET() {
  try {
    logger.info('健康检查API被调用');
    
    // 检查环境变量
    const envVars = logEnvironmentVariables();
    
    // 系统状态信息
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiConfigured: !!envVars.RUNNINGHUB_API_KEY || !!envVars.NEXT_PUBLIC_RUNNINGHUB_API_KEY,
      apiBaseUrl: envVars.API_BASE_URL
    };
    
    logger.info('健康检查结果', status);
    
    return NextResponse.json(status);
  } catch (error) {
    logger.error('健康检查API错误', error);
    
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