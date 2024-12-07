'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { CustomizationPanel } from '@/components/CustomizationPanel/CustomizationPanel';
import { Button } from '@/components/ui/button';
import { useFonts } from '@/components/FontManager';
import Section from '@/components/layout/Section';

// TODO: create a separate Layout component to keep the page component clean
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Section className=" mx-auto px-4 py-8">{children}</Section>
    </div>
  );
};

const ComponentLibraryPage = () => {
  const handleThemeChange = (theme: any) => {
    console.log('Theme changed:', theme);
  };

  const { getCurrentFonts } = useFonts();
  const fonts = getCurrentFonts();
  const PreviewSection = () => (
    <div className="space-y-4">
      <label className="text-sm font-medium">Typography Preview</label>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="space-y-2">
          <h3 className={`text-xl ${fonts.heading}`}>Heading Font</h3>
          <p className={`text-sm text-muted-foreground ${fonts.heading}`}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
        <div className="space-y-2">
          <h3 className={`text-xl ${fonts.body}`}>Body Font</h3>
          <p className={`text-sm text-muted-foreground ${fonts.body}`}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Layout>
        <div className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Component Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a component from the sidebar to view it.
            </p>
          </header>
          {/* Preview section showing themed components */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="grid gap-4 p-6 rounded-lg border bg-card">
              {/*  component previews here */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Buttons</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Colors</h3>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary" />
                    <div className="w-6 h-6 rounded-full bg-secondary" />
                    <div className="w-6 h-6 rounded-full bg-accent" />
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <div className="w-6 h-6 rounded-full bg-destructive" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Cards</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border bg-card text-card-foreground">
                      <h4 className="font-semibold">Card Title</h4>
                      <p className="text-sm text-muted-foreground">
                        This is a card component using the theme variables.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <h4 className="font-semibold">Muted Card</h4>
                      <p className="text-sm text-muted-foreground">
                        A muted variant of the card component.
                      </p>
                    </div>
                  </div>
                </div>
                <PreviewSection />
              </div>
            </div>
          </section>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Theme Customization</h2>
            <CustomizationPanel onThemeChange={handleThemeChange} />
          </div>
        </div>
      </Layout>
    </ThemeProvider>
  );
};

export default ComponentLibraryPage;
