import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';
const API_KEY = process.env.RUNNINGHUB_API_KEY || process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;
const WEBAPP_ID = process.env.RUNNINGHUB_WEBAPP_ID || process.env.NEXT_PUBLIC_RUNNINGHUB_WEBAPP_ID || '1912088541617422337';
const NODE_ID = process.env.RUNNINGHUB_NODE_ID || process.env.NEXT_PUBLIC_RUNNINGHUB_NODE_ID || '226';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId } = body;
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'No image ID provided' },
        { status: 400 }
      );
    }
    
    console.log('Generating image with ID:', imageId);
    console.log('Using API key:', API_KEY ? '(present)' : '(missing)');
    console.log('Using webapp ID:', WEBAPP_ID);
    console.log('Using node ID:', NODE_ID);
    
    // 请求数据
    const requestData = {
      webappId: WEBAPP_ID,
      apiKey: API_KEY,
      nodeInfoList: [{
        nodeId: NODE_ID,
        fieldName: "image",
        fieldValue: imageId
      }]
    };
    
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    // 发送请求到 RunningHub
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Generate response:', response.data);
    
    // 返回响应
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error generating image:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 