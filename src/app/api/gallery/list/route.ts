import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { storageService } from '@/lib/storage';

/**
 * 获取所有保存的图片URL
 */
export async function GET(request: NextRequest) {
  logger.info('收到获取图片列表请求');
  
  try {
    // 使用存储服务获取图片列表
    const images = await storageService.getGalleryImages();
    logger.info(`返回 ${images.length} 张图片`);
    
    return NextResponse.json({ images });
  } catch (error: any) {
    logger.error('获取图片列表API错误', error);
    
    return NextResponse.json(
      { error: '获取图片列表失败', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 