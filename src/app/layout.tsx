import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Instant Memories | AI Polaroid Generator - Transform Photos into Vintage Polaroids',
  description: '将您的照片瞬间转变为复古宝丽来风格。免费在线工具，无需注册，一键生成、下载和分享您的创意照片作品。支持移动设备和电脑浏览器。',
  keywords: 'polaroid, ai generator, photo transformation, retro photos, vintage photos, polaroid style, ai photo tool, instant memories, 宝丽来, 照片转换, 人工智能, 生成艺术, 复古照片, 照片处理',
  authors: [{ name: 'Polaroid AI Generator Team' }],
  creator: 'rockyandtom',
  publisher: 'Instant Memories',
  metadataBase: new URL('https://polaroidai.com'),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://polaroidai.com',
  },
  openGraph: {
    title: 'Instant Memories | AI Polaroid Generator - Transform Photos into Vintage Polaroids',
    description: '将您的照片瞬间转变为复古宝丽来风格。免费在线工具，无需注册，一键生成、下载和分享您的创意照片作品。',
    url: 'https://polaroidai.com',
    siteName: 'Instant Memories - AI Polaroid Generator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Instant Memories - AI Polaroid Generator Preview',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant Memories | AI Polaroid Generator',
    description: '将您的照片瞬间转变为复古宝丽来风格。免费在线工具，一键生成、下载和分享。',
    images: ['/twitter-image.jpg'],
    creator: '@rockyandtom',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SB4ENTWG5P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SB4ENTWG5P');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white py-6 border-t">
          <div className="container-custom text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Instant Memories - AI Polaroid Generator. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Created with ❤️ using Next.js and RunningHub API
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
} 