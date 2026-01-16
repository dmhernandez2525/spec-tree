import type { Metadata } from 'next';
import './globals.css';
import { FontProvider } from '@/components/FontManager';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';
import StoreProvider from './StoreProvider';
import BaseLayout from '@/components/layout/BaseLayout';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'Spec Tree - AI-Powered Project Specifications',
    template: '%s | Spec Tree',
  },
  description:
    'Transform project ideas into structured, actionable specifications with AI. From idea to implementation, organized.',
  keywords: [
    'project management',
    'AI',
    'specifications',
    'agile',
    'software planning',
    'work items',
    'epics',
    'user stories',
    'tasks',
    'GPT',
    'OpenAI',
  ],
  authors: [{ name: 'Daniel Hernandez' }],
  creator: 'Daniel Hernandez',
  publisher: 'Spec Tree',
  metadataBase: new URL('https://spectree.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://spectree.dev',
    title: 'Spec Tree - AI-Powered Project Specifications',
    description:
      'Transform project ideas into structured, actionable specifications with AI. From idea to implementation, organized.',
    siteName: 'Spec Tree',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spec Tree - From idea to implementation, structured',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spec Tree - AI-Powered Project Specifications',
    description:
      'Transform project ideas into structured, actionable specifications with AI.',
    images: ['/og-image.png'],
    creator: '@spectreedev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <FontProvider>
          <StoreProvider>
            <SidebarProvider>
              <BaseLayout>
                <AuthLayout>
                  <MainNav />
                  <main className="mt-20 min-h-screen w-full bg-background">
                    {children}
                  </main>
                  <Footer />
                </AuthLayout>
              </BaseLayout>
              <Toaster />
            </SidebarProvider>
          </StoreProvider>
        </FontProvider>
      </body>
    </html>
  );
}
