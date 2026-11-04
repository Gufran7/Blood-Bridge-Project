import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '@/components/layout/Wordmark';

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-950/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#/" aria-label="Blood Bridge home" className="transition hover:opacity-80">
            <Wordmark />
          </a>
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-ink-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">{children}</main>
    </div>
  );
}
