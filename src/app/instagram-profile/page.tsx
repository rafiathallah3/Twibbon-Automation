'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, SearchCode, Moon, Sun, Smartphone, Monitor, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';

type ProfileData = {
  username: string;
  name: string;
  followers: string;
  following: string;
  posts: string;
  profilePic: string;
  bio: string;
};

export default function InstagramProfile() {
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [profileData, setProfileData] = useState<ProfileData>({
    username: 'rafi._athallah',
    name: 'Rafi',
    followers: '0',
    following: '0',
    posts: '0',
    profilePic: 'https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 50),
    bio: 'Put your caption here',
  });

  const captureRef = useRef<HTMLDivElement>(null);

  // Proxy external image URLs through our API to avoid CORS issues
  const proxyImg = (url: string) => {
    if (!url) return '';
    // Don't proxy data URIs or already-proxied URLs
    if (url.startsWith('data:') || url.startsWith('/api/proxy-image')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const fetchProfile = async () => {
    if (!usernameInput) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/instagram?username=${encodeURIComponent(usernameInput)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setProfileData({
        username: data.username,
        name: data.name,
        followers: data.followers || '0',
        following: data.following || '0',
        posts: data.posts || '0',
        profilePic: data.profilePic || 'https://i.pravatar.cc/300?img=68',
        bio: data.bio || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? '#000000' : '#ffffff'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `instagram-${profileData.username}-${isMobileView ? 'mobile' : 'desktop'}-${isDarkMode ? 'dark' : 'light'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      alert('Failed to capture screenshot. Make sure external images have CORS enabled, or try uploading local images instead.');
    }
  };

  // Verified badge SVG
  const VerifiedBadge = ({ size = 18 }: { size?: number }) => (
    <svg aria-label="Verified" className="text-[#0095f6] inline-block ml-1" fill="currentColor" height={size} role="img" viewBox="0 0 40 40" width={size}>
      <title>Verified</title>
      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd" />
    </svg>
  );

  if (!mounted) return null;

  const dark = isDarkMode;
  const bg = dark ? 'bg-black' : 'bg-white';
  const text = dark ? 'text-[#f5f5f5]' : 'text-[#262626]';
  const textSecondary = dark ? 'text-[#a8a8a8]' : 'text-[#8e8e8e]';
  const border = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const btnBg = dark ? 'bg-[#363636]' : 'bg-[#efefef]';
  const btnHover = dark ? 'hover:bg-[#262626]' : 'hover:bg-[#dbdbdb]';
  const btnText = dark ? 'text-[#f5f5f5]' : 'text-[#262626]';

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-20">
      {/* App Top Nav */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            Fake Instagram Generator
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
            Dashboard
          </Link>
          <Link href="/instagram-post" className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full">
            Fake IG Post
          </Link>
          <Link href="/instagram-story" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full">
            Fake IG Story
          </Link>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={() => setIsMobileView(!isMobileView)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium border border-gray-200"
          >
            {isMobileView ? <Monitor className="w-5 h-5 text-gray-700" /> : <Smartphone className="w-5 h-5 text-gray-700" />}
            {isMobileView ? 'Switch to Desktop' : 'Switch to Mobile'}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium border border-gray-200"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Controls Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-gray-500" />
              Fetch Profile
            </h2>
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProfile()}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <button
                onClick={fetchProfile}
                disabled={loading || !usernameInput}
                className="w-full py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Edit Profile Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Bio</label>
                <textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Posts</label>
                  <input type="text" value={profileData.posts} onChange={e => setProfileData({ ...profileData, posts: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Followers</label>
                  <input type="text" value={profileData.followers} onChange={e => setProfileData({ ...profileData, followers: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Following</label>
                  <input type="text" value={profileData.following} onChange={e => setProfileData({ ...profileData, following: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Profile Picture URL</label>
                <input type="text" value={profileData.profilePic} onChange={e => setProfileData({ ...profileData, profilePic: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" />
              </div>
            </div>
          </div>

          <button
            onClick={handleCapture}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Capture Screenshot
          </button>
        </div>

        {/* Instagram UI Preview Area */}
        <div className="xl:col-span-9 flex justify-center items-start xl:items-center xl:min-h-[500px]">
          <div className={`shadow-2xl overflow-hidden relative transition-all duration-300 ${isMobileView ? 'w-[375px] rounded-[2rem]' : 'w-full max-w-[935px] rounded-sm'}`}>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-sm font-medium animate-pulse">Fetching profile...</span>
                </div>
              </div>
            )}

            <div
              ref={captureRef}
              className={`w-full flex flex-col transition-colors duration-200 ${bg} ${text}`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            >

              {isMobileView ? (
                /* ===================== MOBILE LAYOUT ===================== */
                <>
                  {/* Mobile Top Bar */}
                  <div className={`flex items-center justify-between px-4 h-[44px] border-b ${border}`}>
                    {/* Lock + Username + Chevron */}
                    <div className="flex items-center gap-1">
                      <svg aria-label="Options" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24" className={text}>
                        <path d="M3.5 6.5h17a1.5 1.5 0 0 0 0-3h-17a1.5 1.5 0 0 0 0 3Zm17 4h-17a1.5 1.5 0 0 0 0 3h17a1.5 1.5 0 0 0 0-3Zm0 7h-17a1.5 1.5 0 0 0 0 3h17a1.5 1.5 0 0 0 0-3Z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="font-bold text-sm">{profileData.username}</span>
                      <VerifiedBadge size={12} />
                      <svg height="12" width="12" viewBox="0 0 24 24" fill="currentColor" className={textSecondary}><path d="M7 10l5 5 5-5z" /></svg>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Threads icon */}
                      <svg height="24" width="24" viewBox="0 0 192 192" fill="currentColor" className={text}>
                        <path d="M141.5 88.2c-.8-.4-1.6-.7-2.4-1-2.1-14.2-8.8-25.8-19.5-33.5-10.5-7.6-23.6-10.9-37.9-9.7-14.3 1.3-26.4 7.1-34.9 16.8-8.4 9.6-12.4 22-11.3 36 1.3 14.3 7.1 26.4 16.8 34.9 9.6 8.4 22 12.4 36 11.3 11.4-1 21.3-5.2 29.1-12.2 1.6 1.4 3.3 2.6 5.1 3.7-9.4 8.5-21.3 13.5-34.7 14.8-16 1.4-30.4-3.1-41.6-13-11.1-9.8-17.7-23.7-19.2-40.1-1.4-16 3.1-30.4 13-41.6 9.8-11.1 23.7-17.7 40.1-19.2 16.4-1.4 31.3 3.2 43 13.5 9.7 8.5 15.9 20 18 33.3z" />
                      </svg>
                      {/* Add/create icon */}
                      <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={text}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    </div>
                  </div>

                  {/* Mobile Profile Section */}
                  <div className="px-4 pt-4 pb-2">
                    {/* Row: Avatar + Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      {/* Avatar */}
                      <div className="w-[77px] h-[77px] rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5] p-[3px] shrink-0">
                        <div className={`w-full h-full rounded-full p-[2px] ${bg}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={proxyImg(profileData.profilePic)} alt="Profile" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="flex flex-1 justify-around text-center">
                        <div>
                          <div className="font-semibold text-base leading-tight">{profileData.posts}</div>
                          <div className={`text-xs ${textSecondary}`}>posts</div>
                        </div>
                        <div>
                          <div className="font-semibold text-base leading-tight">{profileData.followers}</div>
                          <div className={`text-xs ${textSecondary}`}>followers</div>
                        </div>
                        <div>
                          <div className="font-semibold text-base leading-tight">{profileData.following}</div>
                          <div className={`text-xs ${textSecondary}`}>following</div>
                        </div>
                      </div>
                    </div>

                    {/* Name + Bio */}
                    <div className="mb-3">
                      <div className="font-semibold text-sm leading-[18px]">{profileData.name}</div>
                      <div className={`text-sm leading-[18px] mt-0.5 whitespace-pre-wrap ${textSecondary}`}>{profileData.bio}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 mb-2">
                      <button className={`flex-1 text-sm font-semibold py-[7px] rounded-lg ${btnBg} ${btnText}`}>
                        Following
                      </button>
                      <button className={`flex-1 text-sm font-semibold py-[7px] rounded-lg ${btnBg} ${btnText}`}>
                        Message
                      </button>
                      <button className={`px-3 py-[7px] rounded-lg ${btnBg} ${btnText}`}>
                        <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14a1 1 0 0 0-1 1v3h-3a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2h-3v-3a1 1 0 0 0-1-1z" /><path d="M12 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" /><circle cx="12" cy="9" r="3" /><path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" /></svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* ===================== DESKTOP LAYOUT ===================== */
                <>
                  {/* Desktop Top Nav Bar */}
                  <div className={`h-[60px] border-b flex items-center justify-between px-5 ${border} ${bg}`}>
                    <div className="flex-1">
                      <span className={`text-2xl ${text}`} style={{ fontFamily: 'Instagram Sans, cursive, sans-serif', fontWeight: 400, letterSpacing: '.02em' }}>Instagram</span>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className={`flex items-center gap-2 px-4 py-[7px] rounded-lg w-[268px] ${dark ? 'bg-[#262626]' : 'bg-[#efefef]'}`}>
                        <svg className={`w-4 h-4 ${textSecondary}`} fill="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="16.5" y1="16.5" x2="21" y2="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        <span className={`text-sm ${textSecondary}`}>Search</span>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-6">
                      {/* Home */}
                      <svg className={`w-6 h-6 ${text}`} fill="currentColor" viewBox="0 0 24 24"><path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z" /></svg>
                      {/* Messenger */}
                      <svg className={`w-6 h-6 ${text}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12.003 2.001a9.705 9.705 0 1 1 0 19.41 10.3 10.3 0 0 1-2.92-.429l-3.712 1.01 1.01-3.712A9.7 9.7 0 0 1 12.003 2Z" /><path d="m7.5 13.5 3-3 2 2 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {/* Create */}
                      <svg className={`w-6 h-6 ${text}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" /><line x1="12" y1="7" x2="12" y2="17" /><line x1="7" y1="12" x2="17" y2="12" /></svg>
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full overflow-hidden ring-2 ${dark ? 'ring-white' : 'ring-[#262626]'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proxyImg(profileData.profilePic)} alt="User" crossOrigin="anonymous" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Profile Area */}
                  <div className="max-w-[935px] w-full mx-auto px-5 pt-[30px] pb-[20px]">
                    <div className="flex gap-[30px]">
                      {/* Profile Picture */}
                      <div className="w-[290px] flex justify-center shrink-0">
                        <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5] p-[4px]">
                          <div className={`w-full h-full rounded-full p-[3px] ${bg}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={proxyImg(profileData.profilePic)} alt="Profile" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
                          </div>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 pt-1">
                        {/* Username Row */}
                        <div className="flex items-center gap-4 mb-5">
                          <span className="text-xl font-normal">{profileData.username}</span>
                          <VerifiedBadge size={18} />
                          <button className={`text-sm font-semibold px-5 py-[7px] rounded-lg ${btnBg} ${btnHover} ${btnText} transition-colors`}>
                            Following
                          </button>
                          <button className={`text-sm font-semibold px-5 py-[7px] rounded-lg ${btnBg} ${btnHover} ${btnText} transition-colors`}>
                            Message
                          </button>
                          <button className={`p-[7px] rounded-lg ${btnBg} ${btnHover} ${btnText} transition-colors`}>
                            <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14a1 1 0 0 0-1 1v3h-3a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2h-3v-3a1 1 0 0 0-1-1z" /><path d="M12 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" /><circle cx="12" cy="9" r="3" /><path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" /></svg>
                          </button>
                          {/* Three dots */}
                          <svg className={`w-6 h-6 cursor-pointer ${text}`} fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-10 mb-5 text-base">
                          <div><span className="font-semibold">{profileData.posts}</span> posts</div>
                          <div><span className="font-semibold">{profileData.followers}</span> followers</div>
                          <div><span className="font-semibold">{profileData.following}</span> following</div>
                        </div>

                        {/* Name & Bio */}
                        <div>
                          <div className="font-semibold text-sm">{profileData.name}</div>
                          <div className={`text-sm whitespace-pre-wrap mt-1 ${textSecondary}`}>{profileData.bio}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
