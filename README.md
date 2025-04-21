# Polaroid-Style AI Generator

A web application that transforms user-uploaded images into Polaroid-style artworks using AI technology. This project uses Next.js 14 with App Router and integrates with RunningHub API for AI image processing.

## 🌟 Features

- **Image Upload**: Users can upload their own images to be transformed
- **AI Processing**: Utilizes RunningHub's AI model to convert images to Polaroid style
- **Gallery**: Showcases user-generated images with download functionality
- **Reviews**: Allows users to leave feedback on their experience
- **Direct Download**: Images can be directly downloaded to local device with one click
- **Auto-Save**: Generated images are automatically saved to gallery for future viewing
- **Gallery Management**: Gallery displays up to 30 most recent generated images

## 🚀 Live Demo

Visit the live demo: [Polaroid-Style AI Generator](#) (Coming Soon)

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **API Integration**: RunningHub API
- **Image Processing**: Server-side image compression and handling
- **State Management**: React Hooks and Context
- **Deployment**: Vercel

## 📝 API Integration

This application integrates with RunningHub API for AI image processing:
- Upload images to RunningHub
- Process images with AI models
- Retrieve processed images
- Real-time progress updates via polling

## 🏗️ Project Structure

```
/
├── src/
│   ├── app/                    # App Router
│   │   ├── api/                # API Route Handlers
│   │   │   ├── upload/         # Image upload API
│   │   │   ├── generate/       # AI processing API
│   │   │   ├── status/         # Status checking API
│   │   │   ├── result/         # Results retrieval API
│   │   │   └── reviews/        # User reviews API
│   │   ├── page.tsx            # Home Page
│   │   └── layout.tsx          # Root Layout
│   ├── components/             # React Components
│   │   ├── Header.tsx          # Title section
│   │   ├── ImageProcessor.tsx  # Image upload, processing, and preview
│   │   ├── Gallery.tsx         # Demo showcase area
│   │   └── Reviews.tsx         # User reviews section
│   ├── lib/                    # Utility functions
│   │   ├── api.ts              # API client for RunningHub
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Shared types
├── public/                     # Static assets
│   └── demo/                   # Demo images
└── README.md                   # Project documentation
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your API keys (see below)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) to view the application

## ⚙️ Environment Variables

Create a `.env.local` file with the following variables:
```
RUNNINGHUB_API_KEY=your_api_key
RUNNINGHUB_WEBAPP_ID=1912088541617422337
RUNNINGHUB_NODE_ID=226
NEXT_PUBLIC_API_BASE_URL=https://www.runninghub.cn
```

## 🔄 How It Works

1. User uploads an image through the interface
2. The image is compressed client-side for performance
3. The image is uploaded to RunningHub API
4. An AI task is initiated to transform the image
5. The application polls for status updates
6. When processing is complete, the transformed image is displayed
7. The image is automatically saved to the gallery (up to 30 most recent images)
8. User can download the result directly to their device

## 🧩 Core Components

- **Header**: Displays the title and main navigation
- **ImageProcessor**: Handles image uploads and transformations
- **Gallery**: Displays generated images with selection and download options
- **Reviews**: Shows user reviews and allows submission of new reviews

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔍 常见问题排查

### 任务处理失败 (Task processing failed)

如果遇到图片处理失败，状态返回"ERROR"，可能的原因和解决方案：

1. **服务器处理失败**:
   - 检查图片大小和格式是否合适，建议使用JPG/JPEG/PNG格式，大小控制在5MB以内
   - 尝试使用不同的图片
   - 稍后再试，服务器可能暂时负载过高

2. **超时问题**:
   - 上传更小的图片
   - 检查网络连接
   - 服务器处理时间可能较长，增加轮询超时时间

3. **API配置问题**:
   - 确保环境变量正确设置
   - 检查API密钥是否有效
   - 验证WEBAPP_ID和NODE_ID是否匹配

### 其他常见问题

- **图片上传失败**: 确保图片格式支持且大小合适，网络连接稳定
- **无法启动生成流程**: 可能是API密钥问题或服务器端接口变更，检查环境变量配置
- **轮询状态失败**: 增加重试机制，检查网络连接，确保API有效

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 最近更新

### 图片存储功能升级

- **多环境存储方案**:
  - 开发环境下使用文件系统存储图片URL
  - 生产环境下使用数据库存储图片URL（持久化）
  - 通过环境变量`STORAGE_TYPE`控制存储类型

- **双重存储机制**:
  - 服务器存储确保图片在不同设备和浏览器会话间持久保存
  - 本地存储(localStorage)作为备份机制，提高可用性
  - 自动同步服务器和本地存储数据

- **抽象存储层**:
  - 创建了统一的存储服务接口
  - 支持灵活切换不同的存储后端
  - 为未来添加其他存储方式（如云存储）做好准备
  
### 图片功能增强

- **直接下载功能**: 点击"Download"按钮时，图片现在会直接下载到本地设备，无需额外点击保存
- **自动保存到Gallery**: 每次生成的图片会自动保存到Gallery中，无需手动添加
- **Gallery优化管理**: 
  - Gallery最多显示30张最新生成的图片
  - 新图片总是显示在最前面
  - 实时更新显示，无需刷新页面
- **服务器持久化存储**:
  - 生成的图片URL会同时保存到服务器和本地浏览器
  - 即使清除浏览器缓存或使用新设备，之前生成的图片仍可在Gallery中查看
  - 确保图片在不同设备和浏览器会话间保持一致

### 使用提示

- Gallery区域会自动显示您生成的所有图片（最多30张）
- 您可以选择单张或多张图片进行批量下载
- 下载功能现在支持直接保存到您的设备，无需右键另存为 