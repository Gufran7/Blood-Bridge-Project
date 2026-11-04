import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Wordmark } from '@/components/layout/Wordmark';

const NAV_LINKS = [
  { label: 'Find Donors', href: '#find-donors' },
  { label: 'Request Blood', href: '#request-blood' },
  { label: 'Hospitals & Banks', href: '#blood-banks' },
  { label: 'Eligibility', href: '#eligibility' },
  { label: 'Compatibility', href: '#compatibility' },
  { label: 'Passport Hub', href: '#/passport' },
  { label: 'FAQ', href: '#faq' },
];

type HeaderProps = {
  onRequestBlood: () => void;
  onBecomeDonor: () => void;
};

export function Header({ onRequestBlood, onBecomeDonor }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openFromMenu = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition duration-300 ${
        scrolled || menuOpen
          ? 'border-white/10 bg-ink-950/85 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" aria-label="Blood Bridge home" className="shrink-0">
          <Wordmark />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-300 transition hover:bg-white/5 hover:text-ink-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={onBecomeDonor} className="btn-ghost px-4 py-2.5 text-sm">
            Become a Donor
          </button>
          <button type="button" onClick={onRequestBlood} className="btn-primary px-4 py-2.5 text-sm">
            Request Blood
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-ink-200 transition hover:bg-white/10 xl:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-white/10 transition-[max-height,opacity] duration-300 ease-out xl:hidden ${
          menuOpen ? 'max-h-[560px] border-t opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-200 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => openFromMenu(onBecomeDonor)} className="btn-ghost text-sm">
              Become a Donor
            </button>
            <button type="button" onClick={() => openFromMenu(onRequestBlood)} className="btn-primary text-sm">
              Request Blood
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
