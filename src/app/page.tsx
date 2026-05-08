'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Image as ImageIcon, Download, Settings, Move, ZoomIn } from 'lucide-react';

export default function Home() {
  const [twibbonSrc, setTwibbonSrc] = useState<string | null>(null);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [photoScale, setPhotoScale] = useState<number>(1);
  const [photoX, setPhotoX] = useState<number>(0);
  const [photoY, setPhotoY] = useState<number>(0);

  const [twibbonImg, setTwibbonImg] = useState<HTMLImageElement | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);

  // Handle file uploads
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'twibbon' | 'photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (type === 'twibbon') {
          setTwibbonSrc(src);
          setTwibbonImg(img);
        } else {
          setPhotoSrc(src);
          setPhotoImg(img);
          // Reset positioning when new photo is uploaded
          setPhotoScale(1);
          setPhotoX(0);
          setPhotoY(0);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Draw on canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Default canvas size, will be updated to twibbon size if available
    let canvasWidth = 800;
    let canvasHeight = 800;

    if (twibbonImg) {
      canvasWidth = twibbonImg.width;
      canvasHeight = twibbonImg.height;
    } else if (photoImg) {
      canvasWidth = photoImg.width;
      canvasHeight = photoImg.height;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw user photo FIRST (in the background)
    if (photoImg) {
      const scaledWidth = photoImg.width * photoScale;
      const scaledHeight = photoImg.height * photoScale;

      // Center the photo initially, then apply X and Y offsets
      const startX = (canvasWidth - scaledWidth) / 2 + photoX;
      const startY = (canvasHeight - scaledHeight) / 2 + photoY;

      ctx.drawImage(photoImg, startX, startY, scaledWidth, scaledHeight);
    }

    // Draw Twibbon SECOND (on top)
    if (twibbonImg) {
      ctx.drawImage(twibbonImg, 0, 0, canvasWidth, canvasHeight);
    }

  }, [twibbonImg, photoImg, photoScale, photoX, photoY]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'twibbon-result.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-pink-600" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            Twibbon Automator
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/instagram-post"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-2 bg-violet-50 px-4 py-2 rounded-full"
          >
            Fake IG Post
          </Link>
          <Link
            href="/instagram-story"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full"
          >
            Fake IG Story
          </Link>
          <Link
            href="/instagram-profile"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full"
          >
            Fake IG Profile
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

        {/* Controls Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              1. Upload Images
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twibbon Frame (PNG)</label>
                <input
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleUpload(e, 'twibbon')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'photo')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              2. Adjust Photo
            </h2>

            <div className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><ZoomIn className="w-4 h-4" /> Scale</span>
                  <span>{photoScale.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0.1" max="3" step="0.05"
                  value={photoScale}
                  onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><Move className="w-4 h-4" /> Horizontal Position</span>
                  <span>{photoX}px</span>
                </label>
                <input
                  type="range"
                  min="-1000" max="1000" step="10"
                  value={photoX}
                  onChange={(e) => setPhotoX(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><Move className="w-4 h-4" /> Vertical Position</span>
                  <span>{photoY}px</span>
                </label>
                <input
                  type="range"
                  min="-1000" max="1000" step="10"
                  value={photoY}
                  onChange={(e) => setPhotoY(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!twibbonImg && !photoImg}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Download Result
          </button>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex items-center justify-center flex-col">
            {(!twibbonSrc && !photoSrc) ? (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload a Twibbon and a Photo to see the preview here</p>
              </div>
            ) : (
              <div className="w-full max-w-[600px] mx-auto border-4 border-dashed border-gray-100 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center aspect-square relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBgEGHADxihgQoGoGAAI7i00cQAeZNRc4YBA4Ohb4iMgAETjBocIEMAADuXAg2HkM31AAAAAElFTkSuQmCC")',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Instagram Tools Section */}
        <div className="lg:col-span-12 mt-4">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500">
            Instagram Mock-up Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Fake IG Post */}
            <Link href="/instagram-post" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <circle cx="7" cy="6" r="1" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Fake IG Post</h3>
                <p className="text-sm text-gray-500">Create a realistic Instagram post with custom image, caption, likes, and date.</p>
              </div>
            </Link>

            {/* Fake IG Story */}
            <Link href="/instagram-story" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500" />
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="6" y="2" width="12" height="20" rx="3" />
                    <line x1="6" y1="18" x2="18" y2="18" />
                    <circle cx="12" cy="20" r="0.5" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Fake IG Story</h3>
                <p className="text-sm text-gray-500">Design a phone-sized Instagram story with profile info, image, and message bar.</p>
              </div>
            </Link>

            {/* Fake IG Profile */}
            <Link href="/instagram-profile" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-violet-500" />
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Fake IG Profile</h3>
                <p className="text-sm text-gray-500">Generate a full Instagram profile preview with bio, stats, and fetched data.</p>
              </div>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}
