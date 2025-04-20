import Header from '@/components/Header';
import ImageProcessor from '@/components/ImageProcessor';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';

export default function Home() {
  return (
    <>
      <Header />
      <ImageProcessor />
      <Gallery demoMode={false} />
      <Reviews />
    </>
  );
} 