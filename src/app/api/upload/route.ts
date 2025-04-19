import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY;

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 转换为 FormData 发送到 RunningHub API
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/upload?apiKey=${API_KEY}`,
      apiFormData,
      {
        headers: {
          'Host': 'www.runninghub.cn'
        }
      }
    );
    
    // 返回响应
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 