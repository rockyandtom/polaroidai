import { NextRequest, NextResponse } from 'next/server';
import logger from './logger';

/**
 * 检查环境变量并记录配置
 */
export function logEnvironmentVariables() {
  const envVars = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL,
    RUNNINGHUB_API_KEY: process.env.RUNNINGHUB_API_KEY ? '已设置' : '未设置',
    NEXT_PUBLIC_RUNNINGHUB_API_KEY: process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY ? '已设置' : '未设置',
    RUNNINGHUB_WEBAPP_ID: process.env.RUNNINGHUB_WEBAPP_ID || process.env.NEXT_PUBLIC_RUNNINGHUB_WEBAPP_ID,
    RUNNINGHUB_NODE_ID: process.env.RUNNINGHUB_NODE_ID || process.env.NEXT_PUBLIC_RUNNINGHUB_NODE_ID,
    NODE_ENV: process.env.NODE_ENV
  };

  logger.info('应用环境变量配置', envVars);
  return envVars;
}

/**
 * 监控API请求
 */
export async function withApiMonitoring(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  apiName: string
) {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;
  
  // 记录请求
  logger.apiRequest(method, url);
  
  try {
    // 检查请求体
    let requestBody = null;
    if (method !== 'GET') {
      try {
        // 尝试获取JSON请求体
        if (req.headers.get('content-type')?.includes('application/json')) {
          const clonedReq = req.clone();
          requestBody = await clonedReq.json();
          logger.debug(`${apiName} 请求体`, requestBody);
        } else if (req.headers.get('content-type')?.includes('multipart/form-data')) {
          logger.debug(`${apiName} 请求包含文件上传`);
        }
      } catch (error) {
        logger.warn(`无法解析 ${apiName} 请求体`, error);
      }
    }
    
    // 记录环境变量
    logEnvironmentVariables();
    
    // 执行处理函数
    const response = await handler(req);
    
    // 记录响应
    const duration = Date.now() - startTime;
    let responseBody = null;
    
    try {
      // 克隆响应以避免流消耗
      const clonedResponse = response.clone();
      responseBody = await clonedResponse.json();
    } catch (error) {
      logger.warn(`无法解析 ${apiName} 响应体`, error);
    }
    
    logger.apiResponse(method, url, response.status, {
      body: responseBody,
      duration: `${duration}ms`
    });
    
    return response;
  } catch (error) {
    // 记录错误
    const duration = Date.now() - startTime;
    logger.error(`${apiName} 处理错误 (${duration}ms)`, error);
    
    // 返回错误响应
    return NextResponse.json(
      { 
        error: '请求处理失败', 
        message: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV !== 'production' 
          ? (error instanceof Error ? error.stack : null) 
          : null
      },
      { status: 500 }
    );
  }
} 