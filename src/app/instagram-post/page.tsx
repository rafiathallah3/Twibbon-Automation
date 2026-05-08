'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Settings, ImageIcon, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function InstagramPost() {
  const [username, setUsername] = useState('rafi._athallah');
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 50));
  const [caption, setCaption] = useState('Put your caption here');
  const [postDate, setPostDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const [likes, setLikes] = useState('0');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const proxyImg = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/api/proxy-image') || url.startsWith('blob:')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPostImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `instagram-post-${username}.png`;
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
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
            Fake Instagram Post
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
            Dashboard
          </Link>
          <Link href="/instagram-profile" className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full">
            Fake IG Profile
          </Link>
          <Link href="/instagram-story" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full">
            Fake IG Story
          </Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-4 lg:p-6 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Controls Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Post Settings
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Profile Picture URL</label>
                <input type="text" value={profilePic} onChange={e => setProfilePic(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Caption</label>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date Posted</label>
                  <input type="text" value={postDate} onChange={e => setPostDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Likes</label>
                  <input type="text" value={likes} onChange={e => setLikes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              Post Image
            </h2>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload post image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {postImage && (
              <button onClick={() => setPostImage(null)} className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium">Remove image</button>
            )}
          </div>

          <button onClick={handleCapture} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Capture Screenshot
          </button>
        </div>

        {/* Post Preview */}
        <div className="xl:col-span-8 flex justify-center items-center">
          <div className="w-[468px] shadow-2xl rounded-sm overflow-hidden">
            <div
              ref={captureRef}
              className="w-full bg-white text-[#262626]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5] p-[2px]">
                    <div className="w-full h-full rounded-full bg-white p-[1px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={proxyImg(profilePic)} alt="Profile" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{username}</span>
                  </div>
                </div>
                {/* Three dots */}
                <svg className="w-6 h-6 text-[#262626] cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
                </svg>
              </div>

              {/* Post Image */}
              <div className="w-full aspect-square bg-gray-100 relative">
                {postImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={postImage} alt="Post" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <p className="text-gray-400 text-sm">Upload an image</p>
                  </div>
                )}
              </div>

              {/* Action Icons */}
              <div className="px-3 pt-3 pb-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    {/* Heart */}
                    <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Comment */}
                    <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Share */}
                    <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {/* Bookmark */}
                  <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Likes */}
                <div className="text-sm font-semibold mb-1">{likes} likes</div>

                {/* Caption */}
                <div className="text-sm mb-1">
                  <span className="font-semibold mr-1">{username}</span>
                  <span className="whitespace-pre-wrap">{caption}</span>
                </div>

                {/* Date */}
                <div className="text-[10px] text-[#8e8e8e] uppercase tracking-wide mt-2 pb-3">{postDate}</div>
              </div>

              {/* Comment Input */}
              <div className="flex items-center px-3 py-3 border-t border-[#efefef]">
                {/* Emoji face icon */}
                <svg className="w-6 h-6 text-[#262626] mr-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth="2" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth="2" />
                </svg>
                <span className="text-sm text-[#8e8e8e] flex-1">Add a comment...</span>
                <span className="text-sm font-semibold text-[#0095f6]/40">Post</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
