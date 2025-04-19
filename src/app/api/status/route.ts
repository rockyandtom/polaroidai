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
    
    console.log('Checking status for task:', taskId);
    
    // 请求数据
    const requestData = {
      apiKey: API_KEY,
      taskId
    };
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/status`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Status response:', JSON.stringify(response.data, null, 2));
    
    let status = 'UNKNOWN';
    let progress = 0;
    
    // 处理状态信息
    if (response.data.code === 0) {
      if (typeof response.data.data === 'string') {
        if (response.data.data === 'SUCCESS' || response.data.data === 'COMPLETED') {
          status = 'COMPLETED';
          progress = 100;
        } else if (response.data.data === 'RUNNING' || response.data.data === 'PENDING') {
          status = 'RUNNING';
          progress = 50;
        } else if (response.data.data === 'FAILED' || response.data.data === 'ERROR') {
          status = 'ERROR';
        } else {
          status = response.data.data;
        }
      } else if (response.data.data && typeof response.data.data === 'object') {
        status = response.data.data.status || 'UNKNOWN';
        progress = response.data.data.progress || 0;
      }
    } else {
      return NextResponse.json(
        { error: response.data.msg || 'Failed to get status' },
        { status: 500 }
      );
    }
    
    console.log('Processed status:', status, 'Progress:', progress);
    
    // 返回处理后的状态
    return NextResponse.json({ status, progress });
  } catch (error: any) {
    console.error('Error checking status:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 