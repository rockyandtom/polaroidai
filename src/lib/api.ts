import axios from 'axios';
import { 
  ApiResponse, 
  UploadResponse, 
  TaskResponse, 
  TaskStatusResponse,
  TaskResultItem
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.runninghub.cn';

// 文件上传
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post<ApiResponse<UploadResponse>>(
      `${API_BASE_URL}/task/openapi/upload`, 
      formData,
      {
        params: { apiKey: process.env.RUNNINGHUB_API_KEY },
        headers: { 'Host': 'www.runninghub.cn' }
      }
    );
    
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'Upload failed');
    }
    
    return response.data.data.fileName;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// 发起 AI 任务
export async function generateImage(imageId: string): Promise<TaskResponse> {
  try {
    const response = await axios.post<ApiResponse<TaskResponse>>(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      {
        webappId: process.env.RUNNINGHUB_WEBAPP_ID || '1912088541617422337',
        apiKey: process.env.RUNNINGHUB_API_KEY,
        nodeInfoList: [{
          nodeId: process.env.RUNNINGHUB_NODE_ID || '226',
          fieldName: "image",
          fieldValue: imageId
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn'
        }
      }
    );
    
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'Task creation failed');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// 获取任务状态
export async function checkTaskStatus(taskId: string): Promise<{ status: string; progress: number }> {
  try {
    const response = await axios.post<ApiResponse<TaskStatusResponse>>(
      `${API_BASE_URL}/task/openapi/status`,
      {
        apiKey: process.env.RUNNINGHUB_API_KEY,
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
      throw new Error(response.data.msg || 'Failed to get status');
    }
    
    // 解析状态
    let status = 'UNKNOWN';
    let progress = 0;
    
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
      status = (response.data.data as any).status || 'UNKNOWN';
      progress = (response.data.data as any).progress || 0;
    }
    
    return { status, progress };
  } catch (error) {
    console.error('Error checking task status:', error);
    throw error;
  }
}

// 获取任务结果
export async function getTaskResult(taskId: string): Promise<string[]> {
  try {
    const response = await axios.post<ApiResponse<TaskResultItem[]>>(
      `${API_BASE_URL}/task/openapi/outputs`,
      {
        apiKey: process.env.RUNNINGHUB_API_KEY,
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
      throw new Error(response.data.msg || 'Failed to get results');
    }
    
    // 提取图像 URL
    return response.data.data
      .filter(item => 
        item.fileUrl && (
          !item.fileType ||
          item.fileType.toLowerCase().includes('png') || 
          item.fileType.toLowerCase().includes('jpg') || 
          item.fileType.toLowerCase().includes('jpeg')
        )
      )
      .map(item => item.fileUrl);
  } catch (error) {
    console.error('Error getting task result:', error);
    throw error;
  }
} 