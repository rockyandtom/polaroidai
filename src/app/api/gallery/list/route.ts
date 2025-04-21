import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import logger from '@/lib/logger';

// 图片存储文件路径
const GALLERY_FILE_PATH = path.join(process.cwd(), 'data', 'gallery.json');

// 从文件加载图片数据
function loadGalleryData(): string[] {
  try {
    if (!fs.existsSync(GALLERY_FILE_PATH)) {
      return [];
    }
    
    const data = fs.readFileSync(GALLERY_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('加载图片数据失败', error);
    return [];
  }
}

/**
 * 获取所有保存的图片URL
 */
export async function GET(request: NextRequest) {
  try {
    // 加载图片数据
    const images = loadGalleryData();
    
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