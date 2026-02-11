# YouTube Subtitle Extractor

Extract subtitles from YouTube videos. Download as text or SRT format.

**Live:** https://youtube-text.pages.dev

## Features

- Extract subtitles from any YouTube video
- Download as plain text (.txt) or SRT format (.srt)
- Copy to clipboard
- Multi-language support (EN, JA, ES, PT, KO, ZH)
- SEO optimized with structured data

## Development

```sh
npm install
npm run dev
```

## Deployment

Deployed to Cloudflare Pages. Push to `main` branch to deploy.

```sh
npm run build
```

## SEO Setup Guide

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://youtube-text.pages.dev`
3. Verify ownership via HTML tag (recommended for pages.dev)
   - Set `PUBLIC_GSC_VERIFICATION` in Cloudflare Pages > Settings > Environment variables
   - Redeploy after setting the value
   - For HTML file verification, add the provided file to `static/`
4. Submit sitemap: `https://youtube-text.pages.dev/sitemap.xml`
5. Request indexing for main pages

### 2. Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Import from Google Search Console or add manually
3. Submit sitemap

### 3. Analytics (Optional)

#### Google Analytics 4 (GA4)

1. Go to Google Analytics and create/select a GA4 property
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
3. Set `PUBLIC_GA_MEASUREMENT_ID` in Cloudflare Pages > Settings > Environment variables
4. Redeploy after setting the value

If `PUBLIC_GA_MEASUREMENT_ID` is not set, GA4 script is not loaded.

#### Cloudflare Web Analytics (Alternative)

Cloudflare Web Analytics is privacy-friendly and can be used instead of GA4.

1. Go to Cloudflare Dashboard > Web Analytics
2. Add site and copy the beacon script
3. Add to `src/app.html` before `</body>`

## Tech Stack

- SvelteKit
- TypeScript
- Cloudflare Pages
- youtube-transcript library
