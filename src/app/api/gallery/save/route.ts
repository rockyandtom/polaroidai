import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import logger from '@/lib/logger';

// 图片存储文件路径
const GALLERY_FILE_PATH = path.join(process.cwd(), 'data', 'gallery.json');

// 确保目录存在
function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// 从文件加载图片数据
function loadGalleryData(): string[] {
  try {
    ensureDirectoryExists(GALLERY_FILE_PATH);
    
    if (!fs.existsSync(GALLERY_FILE_PATH)) {
      fs.writeFileSync(GALLERY_FILE_PATH, JSON.stringify([]));
      return [];
    }
    
    const data = fs.readFileSync(GALLERY_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('加载图片数据失败', error);
    return [];
  }
}

// 保存图片数据到文件
function saveGalleryData(images: string[]) {
  try {
    ensureDirectoryExists(GALLERY_FILE_PATH);
    fs.writeFileSync(GALLERY_FILE_PATH, JSON.stringify(images));
    return true;
  } catch (error) {
    logger.error('保存图片数据失败', error);
    return false;
  }
}

/**
 * 保存图片URL到服务器
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: '未提供图片URL' },
        { status: 400 }
      );
    }
    
    // 加载现有图片
    const images = loadGalleryData();
    
    // 将新图片添加到列表开头
    images.unshift(imageUrl);
    
    // 限制图片数量
    if (images.length > 30) {
      images.splice(30);
    }
    
    // 保存更新后的图片列表
    const success = saveGalleryData(images);
    
    if (!success) {
      return NextResponse.json(
        { error: '保存图片失败' },
        { status: 500 }
      );
    }
    
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