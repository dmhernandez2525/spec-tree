import type { Metadata } from 'next';
import './globals.css';
import { FontProvider } from '@/components/FontManager';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';
import StoreProvider from './StoreProvider';
import BaseLayout from '@/components/layout/BaseLayout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Spec Tree - AI-Powered Project Planning',
  description:
    'Transform how you plan and execute projects with Spec Tree',
  openGraph: {
    title: 'Spec Tree - AI-Powered Project Planning',
    description:
      'Transform how you plan and execute projects with Spec Tree',
    url: 'https://blueprintbuilder.com',
    siteName: 'Spec Tree',
    images: [
      {
        url: 'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        width: 1200,
        height: 630,
        alt: 'Spec Tree',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spec Tree - AI-Powered Project Planning',
    description:
      'Transform how you plan and execute projects with Spec Tree',
    images: [
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
  },
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
                <MainNav />
                <main className="mt-36 min-h-screen w-full bg-background">
                  {children}
                </main>
                <Footer />
              </BaseLayout>
              <Toaster />
            </SidebarProvider>
          </StoreProvider>
        </FontProvider>
      </body>
    </html>
  );
}
