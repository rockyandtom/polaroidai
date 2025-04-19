// API 响应类型
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 文件上传响应
export interface UploadResponse {
  fileName: string;
  fileType: string | null;
}

// AI 任务响应
export interface TaskResponse {
  taskId: string;
  clientId: string;
  netWssUrl: string;
  taskStatus: string;
  promptTips?: string;
}

// 任务状态响应
export type TaskStatusResponse = string;

// 任务结果响应
export interface TaskResultItem {
  fileUrl: string;
  fileType: string;
  taskCostTime: string;
  nodeId: string;
}

// 用户评论
export interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number;
  date: string;
}

// 应用状态
export interface AppState {
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
  originalImage: string | null;
  processedImage: string | null;
  error: string | null;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: string;
  data?: any;
  status?: string;
  progress?: number;
  error?: string;
  imageUrl?: string;
} 