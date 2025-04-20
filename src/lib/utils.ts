import JSZip from 'jszip';

// 从图像 URL 创建可下载链接
export function createDownloadLink(url: string, filename: string): void {
  // 创建一个新的 XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  
  xhr.onload = function() {
    if (this.status === 200) {
      // 创建一个新的URL对象
      const blobUrl = URL.createObjectURL(this.response);
      
      // 创建一个链接元素并触发下载
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  };
  
  xhr.send();
}

// 创建并下载多个图像的 ZIP 文件
export async function downloadImagesAsZip(urls: string[], zipName: string = 'polaroid-images.zip'): Promise<void> {
  const zip = new JSZip();
  
  // 添加图像到 ZIP
  const imagePromises = urls.map(async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = getFileExtension(url);
      zip.file(`polaroid-image-${index + 1}.${extension}`, blob);
    } catch (error) {
      console.error(`Error adding image to ZIP: ${url}`, error);
    }
  });
  
  // 等待所有图像添加完成
  await Promise.all(imagePromises);
  
  // 生成 ZIP 文件并下载
  const zipContent = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipContent);
  
  createDownloadLink(zipUrl, zipName);
  
  // 清理
  setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
}

// 从 URL 获取文件扩展名
export function getFileExtension(url: string): string {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  const fileParts = filename.split('.');
  return fileParts.length > 1 ? fileParts[fileParts.length - 1] : 'png';
}

// 压缩图像
export function compressImage(file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // 计算新尺寸，保持原始宽高比
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob error'));
              return;
            }
            
            // 创建新的 File 对象
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: 'image/jpeg',
                lastModified: Date.now()
              }
            );
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Image loading error'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('File reading error'));
    };
  });
} 