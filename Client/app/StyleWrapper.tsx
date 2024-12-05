'use client';
import { useFonts } from '@/components/FontManager';

function StyleWrapper({ children }: { children: React.ReactNode }) {
  const { getCurrentFonts } = useFonts();
  const fonts = getCurrentFonts();

  return (
    <div className={`${fonts.body} flex min-h-screen w-full`}>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default StyleWrapper;
