import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, subtitle, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="glass relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none bg-ink-900/95 sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <h2 id="modal-title" className="text-xl font-extrabold tracking-tight text-ink-100">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-ink-400 transition hover:bg-white/10 hover:text-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-400"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
