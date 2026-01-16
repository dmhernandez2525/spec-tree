# Spec Tree - Quick Wins

**Generated:** January 16, 2026

These are tasks that can be completed in under 1 hour each and provide immediate visible improvement.

## Immediate (< 15 minutes each)

### 1. Update browserslist database
```bash
cd Client
npx update-browserslist-db@latest
```
**Impact:** Removes console warning during build

### 2. Run npm audit fix
```bash
cd Client
npm audit fix
```
**Impact:** Reduces vulnerability count

### 3. Add favicon variants
Create these files in `Client/public/`:
- `favicon.ico` (16x16, 32x32)
- `apple-touch-icon.png` (180x180)
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

**Impact:** Professional polish, PWA-ready

### 4. Add robots.txt
Create `Client/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://spectree.dev/sitemap.xml
```
**Impact:** SEO foundation

### 5. Remove achievement console.log output
The build shows achievement definitions being logged. Find and remove in tutorial system.
**Impact:** Clean console output

## Short (15-30 minutes each)

### 6. Replace 2 <img> tags with next/Image
**Files:**
- `components/dashboard/announcement/FeatureAnnouncementModal.tsx:105`
- `components/layout/MainNav.tsx:289`

```tsx
// Before
<img src="/path/to/image.png" alt="description" />

// After
import Image from 'next/image';
<Image src="/path/to/image.png" alt="description" width={100} height={100} />
```
**Impact:** Fixes 2 ESLint warnings, better performance

### 7. Add OpenGraph meta tags
Update `Client/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Spec Tree',
  description: 'AI-powered project management and work item generation',
  openGraph: {
    title: 'Spec Tree',
    description: 'Transform ideas into actionable project plans with AI',
    url: 'https://spectree.dev',
    siteName: 'Spec Tree',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spec Tree',
    description: 'AI-powered project management',
    images: ['/og-image.png'],
  },
};
```
**Impact:** Social sharing looks professional

### 8. Update package.json metadata
```json
{
  "name": "spec-tree-client",
  "description": "AI-powered project management application",
  "author": "Daniel Hernandez",
  "repository": {
    "type": "git",
    "url": "https://github.com/danielh/spec-tree"
  },
  "keywords": ["nextjs", "ai", "project-management", "openai"]
}
```
**Impact:** Professional package metadata

## Medium (30-60 minutes each)

### 9. Fix 11 ESLint useEffect warnings
Add missing dependencies to useEffect arrays:
```tsx
// Before
useEffect(() => {
  dispatch(someAction());
}, []); // Missing 'dispatch'

// After
useEffect(() => {
  dispatch(someAction());
}, [dispatch]);
```

Or wrap in useCallback if needed:
```tsx
const stableCallback = useCallback(() => {
  onThemeChange(theme);
}, [onThemeChange, theme]);

useEffect(() => {
  stableCallback();
}, [stableCallback]);
```
**Impact:** Clean build, no warnings

### 10. Add basic sitemap.xml
Create `Client/app/sitemap.ts`:
```tsx
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spectree.dev';

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];
}
```
**Impact:** SEO improvement

### 11. Add error boundary
Create `Client/components/error-boundary.tsx`:
```tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```
**Impact:** Better error handling UX

### 12. Remove "Coming soon" placeholder text
In `components/dashboard/settings/ThemeConfigurator/ThemeConfigurator.tsx:543`:
Either implement color picker or remove the text entirely.
**Impact:** No placeholder text visible to users

## Checklist

- [ ] Update browserslist
- [ ] Run npm audit fix
- [ ] Add favicon variants
- [ ] Add robots.txt
- [ ] Remove achievement console.log
- [ ] Replace img tags with Image
- [ ] Add OpenGraph meta tags
- [ ] Update package.json metadata
- [ ] Fix ESLint warnings
- [ ] Add sitemap.xml
- [ ] Add error boundary
- [ ] Remove "Coming soon" text
