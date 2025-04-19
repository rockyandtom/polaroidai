import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/types';

// 模拟数据存储路径
const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'reviews.json');

// 确保 reviews.json 文件存在
function ensureReviewsFile() {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE_PATH))) {
      fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
    }
    
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([]), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring reviews file:', error);
  }
}

// 获取所有评论
function getReviews(): Review[] {
  ensureReviewsFile();
  try {
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reviews file:', error);
    return [];
  }
}

// 保存评论
function saveReview(review: Review): void {
  ensureReviewsFile();
  try {
    const reviews = getReviews();
    reviews.push(review);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(reviews), 'utf-8');
  } catch (error) {
    console.error('Error saving review:', error);
  }
}

// GET 方法获取所有评论
export async function GET() {
  try {
    const reviews = getReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error getting reviews:', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

// POST 方法添加新评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, comment, rating } = body;
    
    // 验证字段
    if (!name || !comment || typeof rating !== 'number') {
      return NextResponse.json(
        { error: 'Invalid review data' },
        { status: 400 }
      );
    }
    
    // 创建新评论
    const newReview: Review = {
      id: Date.now().toString(),
      name,
      comment,
      rating,
      date: new Date().toISOString()
    };
    
    // 保存评论
    saveReview(newReview);
    
    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 