import { Metadata } from 'next';
import Header from '@/components/Header';
import ImageProcessor from '@/components/ImageProcessor';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';

export const metadata: Metadata = {
  title: 'Instant Memories | 在线宝丽来风格照片生成器',
  description: '即刻创建复古宝丽来风格照片，完全免费，无需注册。上传照片，一键转换，自动保存并分享您的创意作品。',
}

export default function Home() {
  return (
    <>
      <Header />
      <div className="bg-white py-4">
        <div className="container-custom">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">瞬间定格，回忆永存</h2>
            <p className="text-gray-600 mt-2">上传照片，体验AI魔法，将普通照片转化为经典宝丽来风格</p>
          </div>
        </div>
      </div>
      <ImageProcessor />
      <Gallery demoMode={false} />
      <Reviews />
    </>
  );
} 