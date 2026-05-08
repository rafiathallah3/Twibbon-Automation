'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Settings, ImageIcon, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function InstagramStory() {
  const [username, setUsername] = useState('rafi._athallah');
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 50));
  const [timeAgo, setTimeAgo] = useState('2h');
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [mounted, setMounted] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const proxyImg = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/api/proxy-image') || url.startsWith('blob:')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setStoryImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `instagram-story-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      alert('Failed to capture screenshot.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-20">
      {/* App Top Nav */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
            Fake Instagram Story
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
            Dashboard
          </Link>
          <Link href="/instagram-post" className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full">
            Fake IG Post
          </Link>
          <Link href="/instagram-profile" className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full">
            Fake IG Profile
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-4 lg:p-6 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Controls Sidebar */}
        <div className="xl:col-span-4 space-y-6">

          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Story Settings
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Profile Picture URL</label>
                <input
                  type="text"
                  value={profilePic}
                  onChange={e => setProfilePic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Time Ago (e.g. 2h, 30m, 1d)</label>
                <input
                  type="text"
                  value={timeAgo}
                  onChange={e => setTimeAgo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* Story Image Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              Story Image
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload story image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleStoryUpload}
              className="hidden"
            />
            {storyImage && (
              <button
                onClick={() => setStoryImage(null)}
                className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Remove image
              </button>
            )}
          </div>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Capture Screenshot
          </button>
        </div>

        {/* Story Preview */}
        <div className="xl:col-span-8 flex justify-center items-center">
          <div className="w-[375px] rounded-[2rem] shadow-2xl overflow-hidden">
            <div
              ref={captureRef}
              className="w-full bg-black text-white relative"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                aspectRatio: '9/16',
              }}
            >
              {/* Story Background */}
              {storyImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storyImage}
                  alt="Story"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" />
              )}

              {/* Top gradient overlay for readability */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent z-10" />

              {/* Progress Bar */}
              <div className="absolute top-2 left-3 right-3 z-20">
                <div className="h-[2px] bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              {/* Header: Profile Info */}
              <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  {/* Profile pic with gradient ring */}
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proxyImg(profilePic)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <span className="text-white text-sm font-semibold drop-shadow-md">{username}</span>
                  <span className="text-white/60 text-xs drop-shadow-md">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-4">
                  {/* More options (three dots) */}
                  <svg className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
                  </svg>
                  {/* Close X */}
                  <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </div>

              {/* No image placeholder text */}
              {!storyImage && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <p className="text-white/60 text-sm font-medium">Upload a story image</p>
                </div>
              )}

              {/* Bottom: Message Input */}
              <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center gap-2">
                <div className="flex-1 flex items-center border border-white/40 rounded-full px-4 py-2 bg-black/20 backdrop-blur-sm">
                  <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Send message"
                    className="bg-transparent text-white text-sm placeholder-white/50 outline-none w-full"
                  />
                </div>
                {/* Heart reaction */}
                <svg className="w-7 h-7 text-white drop-shadow-md shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Share/Send */}
                <svg className="w-7 h-7 text-white drop-shadow-md shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
