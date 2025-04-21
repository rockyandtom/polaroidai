import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { storageService } from '@/lib/storage';

/**
 * 保存图片URL到服务器
 */
export async function POST(request: NextRequest) {
  logger.info('收到保存图片请求');
  
  try {
    // 解析请求体
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      logger.warn('保存请求中未提供图片URL');
      return NextResponse.json(
        { error: '未提供图片URL' },
        { status: 400 }
      );
    }
    
    logger.info(`准备保存图片URL: ${imageUrl.substring(0, 50)}...`);
    
    // 使用存储服务保存图片URL
    const success = await storageService.saveGalleryImage(imageUrl);
    
    if (!success) {
      logger.error('保存图片失败');
      return NextResponse.json(
        { error: '保存图片失败' },
        { status: 500 }
      );
    }
    
    // 获取最新的图片数量
    const images = await storageService.getGalleryImages();
    
    logger.info('图片URL保存成功');
    return NextResponse.json({ success: true, count: images.length });
  } catch (error: any) {
    logger.error('保存图片API错误', error);
    
    return NextResponse.json(
      { error: '保存图片失败', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 