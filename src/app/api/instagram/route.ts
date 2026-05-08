import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromium_sparticuz from '@sparticuz/chromium';

// In-memory cache to store responses and avoid rate limits
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Check cache first
  const cached = cache.get(username);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  }

  let browser;
  try {
    // Launch headless browser with environment-specific options
    let options = {};
    
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      options = {
        args: chromium_sparticuz.args,
        executablePath: await chromium_sparticuz.executablePath(),
        headless: true,
      };
    } else {
      // Local development fallback
      options = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      };
    }

    browser = await chromium.launch(options);

    // Create a context with a realistic user agent
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      javaScriptEnabled: true,
    });

    const page = await context.newPage();

    // Intercept network responses to capture Instagram's internal API data
    // This is the most reliable way to get bio since Instagram loads it via XHR
    let interceptedBio = '';
    let interceptedData: any = null;

    page.on('response', async (response) => {
      try {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        // Instagram fetches profile data via GraphQL or /api/v1/users/ endpoints
        if (contentType.includes('application/json') && 
            (url.includes('/graphql') || url.includes('/api/v1/users/') || url.includes('web_profile_info'))) {
          const json = await response.json();
          const jsonStr = JSON.stringify(json);
          // Look for biography in the response
          if (jsonStr.includes('"biography"')) {
            const bioMatch = jsonStr.match(/"biography"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (bioMatch && bioMatch[1]) {
              interceptedBio = bioMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
            }
            // Also try to extract the full user object
            const userMatch = jsonStr.match(/"user"\s*:\s*(\{[^}]*"biography"[^}]*\})/);
            if (userMatch) {
              try { interceptedData = JSON.parse(userMatch[1]); } catch (e) { /* ignore */ }
            }
          }
        }
      } catch (e) {
        // Ignore response parsing errors (e.g. non-JSON responses)
      }
    });

    // Navigate to the user's profile
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'domcontentloaded' });
    
    // Wait for the profile header to render (Instagram hydrates the page with JS)
    try {
      await page.waitForSelector('header section', { timeout: 8000 });
    } catch (e) {
      // Fallback: just wait a bit for any data to load
    }

    // Give extra time for XHR responses to arrive
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (e) {
      // ignore timeout
    }

    // Evaluate in the browser context to extract profile data
    const data = await page.evaluate((uname) => {
      const getMeta = (property: string) => {
        const el = document.querySelector(`meta[property="${property}"]`);
        return el ? el.getAttribute('content') || '' : '';
      };

      const titleMeta = getMeta('og:title');
      const descriptionMeta = getMeta('og:description');
      const imageMeta = getMeta('og:image');

      const descMatch = descriptionMeta.match(/([\d.,]+[KMBkmb]?)\s+Followers,\s+([\d.,]+[KMBkmb]?)\s+Following,\s+([\d.,]+[KMBkmb]?)\s+Posts/);
      const nameMatch = titleMeta.match(/^(.*?)\s+\(@/);

      let followers = descMatch ? descMatch[1] : '';
      let following = descMatch ? descMatch[2] : '';
      let posts = descMatch ? descMatch[3] : '';
      const name = nameMatch ? nameMatch[1] : uname;

      let bio = '';

      // Strategy 1: og:description — text after the dash
      if (descriptionMeta) {
        const dashIdx = descriptionMeta.indexOf(' - ');
        if (dashIdx !== -1) {
          const afterDash = descriptionMeta.substring(dashIdx + 3).trim();
          if (afterDash && !afterDash.startsWith('See Instagram')) {
            bio = afterDash;
          }
        }
      }

      // Strategy 2: Search ALL script tags for "biography" in JSON data
      if (!bio) {
        const allScripts = document.querySelectorAll('script');
        for (const script of allScripts) {
          const text = script.innerHTML || '';
          if (text.includes('"biography"')) {
            // Match biography field — handle escaped characters
            const bioMatch = text.match(/"biography"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (bioMatch && bioMatch[1]) {
              bio = bioMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              break;
            }
          }
        }
      }

      // Strategy 3: JSON-LD scripts
      if (!bio) {
        const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of ldScripts) {
          try {
            const json = JSON.parse(script.innerHTML || '{}');
            if (json.description) {
              bio = json.description;
              break;
            }
          } catch (e) { /* ignore */ }
        }
      }

      // Strategy 4: window._sharedData (legacy)
      if (!bio) {
        try {
          const sd = (window as any)._sharedData;
          if (sd?.entry_data?.ProfilePage?.[0]?.graphql?.user?.biography) {
            bio = sd.entry_data.ProfilePage[0].graphql.user.biography;
          }
        } catch (e) { /* ignore */ }
      }

      // Strategy 5: DOM — look for the bio text in the rendered header
      if (!bio) {
        const header = document.querySelector('header');
        if (header) {
          // The bio is typically in a <span> inside the header, below the name
          // Walk through all text nodes looking for multi-line/meaningful text
          const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT, null);
          const candidates: string[] = [];
          let node;
          while (node = walker.nextNode()) {
            const t = (node.textContent || '').trim();
            if (t.length > 3) candidates.push(t);
          }
          // Filter out known non-bio text
          const skipWords = ['posts', 'followers', 'following', 'Follow', 'Message', 'Edit profile', 'Share profile', 'Threads', uname];
          for (const c of candidates) {
            const isSkip = skipWords.some(w => c.toLowerCase() === w.toLowerCase()) || /^[\d.,]+[KMBkmb]?$/.test(c);
            if (!isSkip && c.length > 5) {
              bio = c;
              break;
            }
          }
        }
      }

      // Parse stats from DOM if meta tags were empty
      if (!followers || !following || !posts) {
        const listItems = Array.from(document.querySelectorAll('header ul li'));
        if (listItems.length >= 3) {
          const parseStat = (text: string) => {
            const match = text.match(/([\d.,]+[KMBkmb]?)/);
            return match ? match[1] : '0';
          };
          posts = posts || parseStat(listItems[0].textContent || '');
          followers = followers || parseStat(listItems[1].textContent || '');
          following = following || parseStat(listItems[2].textContent || '');
        } else {
          followers = followers || '0';
          following = following || '0';
          posts = posts || '0';
        }
      }

      return { username: uname, name, followers, following, posts, profilePic: imageMeta, bio };
    }, username);

    // Use intercepted bio from XHR as highest-priority source
    if (interceptedBio && !data.bio) {
      data.bio = interceptedBio;
    }

    // Save to cache
    cache.set(username, { data, timestamp: Date.now() });

    await browser.close();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });

  } catch (error: any) {
    if (browser) {
      await browser.close();
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
