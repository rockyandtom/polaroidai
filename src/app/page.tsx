import { Metadata } from 'next';
import Header from '@/components/Header';
import ImageProcessor from '@/components/ImageProcessor';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';

export const metadata: Metadata = {
  title: 'Instant Memories | Polaroid-Style Photo Generator',
  description: 'Create vintage Polaroid-style photos instantly. No registration required. Upload, transform, and share your creative photo art.',
}

export default function Home() {
  return (
    <>
      <Header />
      <div className="bg-white py-6 mt-6">
        <div className="container-custom">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Capture the Moment, Preserve the Memory</h2>
            <p className="text-gray-600 mt-2 px-4">Upload your photos, experience the AI magic, transform ordinary pictures into classic Polaroid style</p>
          </div>
        </div>
      </div>
      <ImageProcessor />
      <Gallery demoMode={false} />
      <Reviews />
    </>
  );
} 