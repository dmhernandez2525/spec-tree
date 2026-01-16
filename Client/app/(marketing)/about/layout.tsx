import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Spec Tree - AI-Powered Project Specifications',
  description:
    "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools that transform ideas into structured specifications.",
  openGraph: {
    title: 'About Spec Tree - AI-Powered Project Specifications',
    description:
      "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools that transform ideas into structured specifications.",
    type: 'website',
    url: 'https://spectree.dev/about',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About Spec Tree',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Spec Tree - AI-Powered Project Specifications',
    description:
      "Learn about Spec Tree's mission to revolutionize project planning with AI-powered tools that transform ideas into structured specifications.",
    images: ['/og-image.png'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
