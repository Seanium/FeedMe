import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { RssFeed } from '@/components/rss-feed';
import { SourceSwitcher } from '@/components/source-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { ScrollToTop } from '@/components/scroll-to-top';
import { defaultSource } from '@/config/rss-config';
import { I18nProvider, useI18n } from '@/i18n';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AppContent />
      </ThemeProvider>
    </I18nProvider>
  );
}

function AppContent() {
  const { t } = useI18n()

  return (
      <main className="min-h-screen bg-background">
        <div className="container py-10 mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <a href="./" className="text-4xl font-bold hover:text-primary transition-colors">
              😋FeedMe
            </a>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <a
                href="https://github.com/Seanium/feedme"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("app.github")}
              >
                <Button variant="outline" size="icon" className="relative">
                  <Github className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">{t("app.github")}</span>
                </Button>
              </a>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">{t("app.tagline")}</p>

          <div className="mb-8">
            <Suspense fallback={<div className="w-full md:w-[340px] h-10 bg-muted rounded-md animate-pulse" />}>
              <SourceSwitcher />
            </Suspense>
          </div>

          <Suspense fallback={<FeedSkeleton />}>
            <RssFeed defaultSource={defaultSource.url} />
          </Suspense>
        </div>

        <footer className="border-t border-border">
          <div className="container mx-auto max-w-4xl py-6">
            <p className="text-center text-sm text-muted-foreground">{t("app.footer")}</p>
          </div>
        </footer>
        <ScrollToTop />
      </main>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4 feed-card">
          <div className="h-7 bg-muted rounded-md animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
            <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
            <div className="h-4 bg-muted rounded-md animate-pulse w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
