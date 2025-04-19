import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'No task ID provided' },
        { status: 400 }
      );
    }
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/outputs`,
      {
        apiKey: API_KEY,
        taskId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn'
        }
      }
    );
    
    if (response.data.code !== 0) {
      return NextResponse.json(
        { error: response.data.msg || 'Failed to get results' },
        { status: 500 }
      );
    }
    
    // 提取图像 URL
    const images = response.data.data
      .filter((item: any) => 
        item.fileUrl && (
          !item.fileType ||
          item.fileType.toLowerCase().includes('png') || 
          item.fileType.toLowerCase().includes('jpg') || 
          item.fileType.toLowerCase().includes('jpeg')
        )
      )
      .map((item: any) => item.fileUrl);
    
    // 返回图像 URL 列表
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error getting results:', error);
    return NextResponse.json(
      { error: 'Failed to get results' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 