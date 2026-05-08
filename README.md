# Twibbon & Instagram Automation Suite

A comprehensive toolset for creating Twibbons and realistic Instagram mock-ups. Built with Next.js, Tailwind CSS, Playwright, and html2canvas.

## 🚀 Features

### 🎨 Twibbon Generator
- **Merge Images**: Easily overlay your photo with any transparent PNG twibbon frame.
- **Precise Adjustments**: Scale and position your photo with real-time preview.
- **High-Quality Export**: Download your final twibbon as a high-resolution PNG.

### 📸 Instagram Mock-up Tools
- **Fake IG Profile**:
  - Fetch real-time data from Instagram (bio, stats, followers).
  - Toggle between **Mobile** and **Desktop** views.
  - Support for **Dark Mode** and **Light Mode**.
  - Capture clean screenshots of the profile UI.
- **Fake IG Post**:
  - Custom captions, likes, and dates.
  - High-fidelity recreation of the Instagram post layout.
- **Fake IG Story**:
  - Full 9:16 vertical mock-up.
  - Interactive "Send Message" bar and reaction icons.
  - Shared profile state (Sync username and picture across all tools).

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Scraping**: Playwright (for resilient Instagram data fetching)
- **Export**: html2canvas (for client-side screenshot generation)
- **Proxy**: Custom API Image Proxy for CORS-permissive rendering

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rafiathallah3/Twibbon-Automation.git
   cd Twibbon-Automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   For Vercel deployment, the project uses `playwright-core` and `@sparticuz/chromium` to stay within the serverless function size limits. No additional browser installation is needed on Vercel.

4. **Run the development server**:
   ```bash
   npm run dev
   ```