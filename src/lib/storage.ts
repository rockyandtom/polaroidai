import fs from 'fs';
import path from 'path';
import logger from './logger';

// 存储类型
export type StorageType = 'file' | 'database';

// 存储接口
export interface StorageService {
  getGalleryImages(): Promise<string[]>;
  saveGalleryImage(imageUrl: string): Promise<boolean>;
  deleteGalleryImage(imageUrl: string): Promise<boolean>;
}

// 基础配置
const MAX_GALLERY_IMAGES = 30;

/**
 * 文件存储实现
 */
class FileStorageService implements StorageService {
  private readonly galleryFilePath: string;

  constructor() {
    // 使用绝对路径
    this.galleryFilePath = path.resolve(process.cwd(), 'data', 'gallery.json');
    logger.info(`文件存储服务初始化: ${this.galleryFilePath}`);
    this.ensureDirectoryExists();
  }

  /**
   * 确保存储目录存在
   */
  private ensureDirectoryExists(): void {
    const dirname = path.dirname(this.galleryFilePath);
    if (!fs.existsSync(dirname)) {
      logger.info(`创建目录: ${dirname}`);
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  /**
   * 从文件加载图片数据
   */
  async getGalleryImages(): Promise<string[]> {
    try {
      this.ensureDirectoryExists();
      
      if (!fs.existsSync(this.galleryFilePath)) {
        logger.info(`创建画廊文件: ${this.galleryFilePath}`);
        fs.writeFileSync(this.galleryFilePath, JSON.stringify([]), { flag: 'w', encoding: 'utf8' });
        return [];
      }
      
      logger.info(`读取画廊文件: ${this.galleryFilePath}`);
      const data = fs.readFileSync(this.galleryFilePath, 'utf8');
      try {
        const parsedData = JSON.parse(data || '[]');
        logger.info(`当前画廊中有 ${parsedData.length} 张图片`);
        return parsedData;
      } catch (parseError) {
        logger.error(`JSON解析错误: ${data}`, parseError);
        // 如果解析错误，返回空数组并重新创建文件
        fs.writeFileSync(this.galleryFilePath, JSON.stringify([]), { flag: 'w', encoding: 'utf8' });
        return [];
      }
    } catch (error) {
      logger.error(`加载图片数据失败: ${this.galleryFilePath}`, error);
      return [];
    }
  }

  /**
   * 保存图片到文件
   */
  async saveGalleryImage(imageUrl: string): Promise<boolean> {
    try {
      // 加载现有图片
      const images = await this.getGalleryImages();
      
      // 将新图片添加到列表开头
      images.unshift(imageUrl);
      logger.info(`添加新图片后，共有 ${images.length} 张图片`);
      
      // 限制图片数量
      if (images.length > MAX_GALLERY_IMAGES) {
        logger.info(`图片数量超过${MAX_GALLERY_IMAGES}张，裁剪至${MAX_GALLERY_IMAGES}张`);
        images.splice(MAX_GALLERY_IMAGES);
      }
      
      // 保存更新后的图片列表
      return this.saveGalleryData(images);
    } catch (error) {
      logger.error('保存图片失败', error);
      return false;
    }
  }

  /**
   * 删除图片
   */
  async deleteGalleryImage(imageUrl: string): Promise<boolean> {
    try {
      // 加载现有图片
      const images = await this.getGalleryImages();
      
      // 过滤掉要删除的图片
      const filteredImages = images.filter(url => url !== imageUrl);
      
      if (filteredImages.length === images.length) {
        logger.info(`找不到要删除的图片: ${imageUrl}`);
        return false;
      }
      
      // 保存更新后的图片列表
      return this.saveGalleryData(filteredImages);
    } catch (error) {
      logger.error('删除图片失败', error);
      return false;
    }
  }

  /**
   * 保存图片数据到文件
   */
  private saveGalleryData(images: string[]): boolean {
    try {
      this.ensureDirectoryExists();
      logger.info(`保存 ${images.length} 张图片到: ${this.galleryFilePath}`);
      
      // 检查文件权限
      try {
        fs.accessSync(path.dirname(this.galleryFilePath), fs.constants.W_OK);
        logger.info('目录可写');
      } catch (err) {
        logger.error('目录权限错误，无法写入', err);
        return false;
      }
      
      // 写入JSON数据
      const jsonData = JSON.stringify(images);
      fs.writeFileSync(this.galleryFilePath, jsonData, { flag: 'w', encoding: 'utf8' });
      
      // 验证写入是否成功
      if (fs.existsSync(this.galleryFilePath)) {
        const content = fs.readFileSync(this.galleryFilePath, 'utf8');
        const parsedContent = JSON.parse(content || '[]');
        logger.info(`验证保存: 文件包含 ${parsedContent.length} 张图片`);
        logger.info(`文件大小: ${content.length} 字节`);
      }
      
      return true;
    } catch (error) {
      logger.error(`保存图片数据失败: ${this.galleryFilePath}`, error);
      return false;
    }
  }
}

/**
 * 数据库存储实现 - 生产环境使用
 * 这里使用了模拟实现，真实环境需要连接数据库
 */
class DatabaseStorageService implements StorageService {
  // 内存中模拟存储，在真实实现中，会连接到数据库
  private cachedImages: string[] = [];
  private initialized: boolean = false;

  constructor() {
    logger.info('数据库存储服务初始化');
  }

  /**
   * 初始化连接
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      logger.info('连接到数据库...');
      // 在真实实现中，这里会连接数据库
      // 例如: await connectToDatabase();
      
      // 从数据库加载缓存
      // 例如: this.cachedImages = await fetchFromDatabase();
      
      this.initialized = true;
      logger.info('数据库连接成功');
    } catch (error) {
      logger.error('数据库连接失败', error);
      // 失败时使用空数组
      this.cachedImages = [];
    }
  }

  /**
   * 从数据库获取图片
   */
  async getGalleryImages(): Promise<string[]> {
    await this.initialize();
    
    try {
      logger.info('从数据库获取图片列表');
      // 在真实实现中，会从数据库读取
      // 例如: return await dbClient.query('SELECT url FROM gallery ORDER BY created_at DESC LIMIT ?', [MAX_GALLERY_IMAGES]);
      
      return this.cachedImages;
    } catch (error) {
      logger.error('获取数据库图片失败', error);
      return [];
    }
  }

  /**
   * 保存图片到数据库
   */
  async saveGalleryImage(imageUrl: string): Promise<boolean> {
    await this.initialize();
    
    try {
      logger.info(`保存图片到数据库: ${imageUrl.substring(0, 50)}...`);
      
      // 在真实实现中，会写入数据库
      // 例如: await dbClient.query('INSERT INTO gallery (url, created_at) VALUES (?, ?)', [imageUrl, new Date()]);
      
      // 更新缓存
      this.cachedImages.unshift(imageUrl);
      
      // 限制缓存大小
      if (this.cachedImages.length > MAX_GALLERY_IMAGES) {
        this.cachedImages = this.cachedImages.slice(0, MAX_GALLERY_IMAGES);
      }
      
      return true;
    } catch (error) {
      logger.error('保存图片到数据库失败', error);
      return false;
    }
  }

  /**
   * 从数据库删除图片
   */
  async deleteGalleryImage(imageUrl: string): Promise<boolean> {
    await this.initialize();
    
    try {
      logger.info(`从数据库删除图片: ${imageUrl.substring(0, 50)}...`);
      
      // 在真实实现中，会从数据库删除
      // 例如: await dbClient.query('DELETE FROM gallery WHERE url = ?', [imageUrl]);
      
      // 更新缓存
      const originalLength = this.cachedImages.length;
      this.cachedImages = this.cachedImages.filter(url => url !== imageUrl);
      
      return this.cachedImages.length !== originalLength;
    } catch (error) {
      logger.error('从数据库删除图片失败', error);
      return false;
    }
  }
}

/**
 * 获取存储服务实例
 */
export function getStorageService(): StorageService {
  // 读取环境变量确定存储类型
  const storageType = process.env.STORAGE_TYPE as StorageType || 'file';
  
  logger.info(`使用存储类型: ${storageType}`);
  
  switch (storageType) {
    case 'database':
      return new DatabaseStorageService();
    case 'file':
    default:
      return new FileStorageService();
  }
}

// 导出单例实例
export const storageService = getStorageService(); 