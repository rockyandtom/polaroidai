import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

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
    
    console.log('Getting results for task:', taskId);
    
    // 请求数据
    const requestData = {
      apiKey: API_KEY,
      taskId
    };
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/outputs`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Result response code:', response.data.code);
    
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
    
    console.log('Found images:', images.length);
    
    // 返回图像 URL 列表
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error getting results:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    return NextResponse.json(
      { error: 'Failed to get results', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 