import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Spec Tree - AI-Powered Project Planning',
  description:
    "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools and intelligent context gathering.",
  openGraph: {
    title: 'About Spec Tree - AI-Powered Project Planning',
    description:
      "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools and intelligent context gathering.",
    type: 'website',
    url: 'https://spectree.com/about',
    images: [
      {
        url: '/og/about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Spec Tree',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Spec Tree - AI-Powered Project Planning',
    description:
      "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools and intelligent context gathering.",
    images: ['/og/about.jpg'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
