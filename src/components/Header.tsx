'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <header className="relative bg-gradient-to-r from-blue-100 to-pink-100 py-16 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center">
          <div className="inline-block mb-6">
            <div className="polaroid-frame bg-white px-4 pt-4 pb-12 shadow-lg">
              <div className="relative w-32 h-32 md:w-48 md:h-48 overflow-hidden">
                <Image 
                  src="/logo-placeholder.jpg" 
                  alt="Polaroid Logo" 
                  width={200} 
                  height={200}
                  className="object-cover"
                  priority
                />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center font-handwriting text-lg">
                Instant Memories
              </p>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500">
            Polaroid-Style AI Generator
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Transform your favorite photos into nostalgic Polaroid-style images with our AI-powered tool.
            Upload, transform, download – it's that simple!
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#upload" className="btn btn-primary">
              Transform Your Photo
            </a>
            <a href="#gallery" className="btn btn-secondary">
              View Gallery
            </a>
          </div>
        </div>
      </div>
      
      {mounted && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
          <div className="w-full max-w-screen-lg h-12 bg-white rounded-t-3xl shadow-lg"></div>
        </div>
      )}
    </header>
  );
}