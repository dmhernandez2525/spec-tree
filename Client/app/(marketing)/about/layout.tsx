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
        url: 'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
    images: [
      'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
