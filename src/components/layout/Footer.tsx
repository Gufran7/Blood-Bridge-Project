import { Phone, ShieldAlert } from 'lucide-react';
import { Wordmark } from '@/components/layout/Wordmark';

const FOOTER_LINKS = [
  { label: 'Find Donors', href: '#find-donors' },
  { label: 'Request Blood', href: '#request-blood' },
  { label: 'Hospitals & Blood Banks (Solapur)', href: '#blood-banks' },
  { label: 'Eligibility Checker', href: '#eligibility' },
  { label: 'Compatibility Matrix', href: '#compatibility' },
  { label: 'Donor Passport & Verification', href: '#/passport' },
  { label: 'Staff Donation Centre', href: '#/centre' },
  { label: 'Frequently Asked Questions', href: '#faq' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
        {/* Brand & Emergency note */}
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-sm text-xs leading-[1.6] text-ink-400">
            Blood Bridge is an open healthcare platform connecting voluntary blood donors with patients, certified blood centres, and hospitals in Solapur and across Maharashtra.
          </p>
          <div className="max-w-sm rounded-xl border border-ruby-500/20 bg-ruby-950/40 p-3.5 text-xs leading-relaxed text-ruby-200">
            <div className="flex items-center gap-1.5 font-bold text-ruby-300 mb-1">
              <ShieldAlert className="h-4 w-4" />
              Emergency Notice
            </div>
            In a critical life-threatening situation, immediately call the National Emergency Helpline <strong>112</strong> or <strong>108</strong>, or contact the nearest hospital casualty ward.
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300">Platform Navigation</h4>
          <nav aria-label="Footer Navigation" className="grid grid-cols-1 gap-2 text-xs">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-400 transition hover:text-ruby-300 hover:translate-x-1 duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Verified Solapur Emergency Numbers */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300">
            Solapur Verified Helplines
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
              <p className="font-semibold text-ink-200">Civil Hospital Solapur (Casualty)</p>
              <a href="tel:02172731900" className="flex items-center gap-1.5 text-ruby-400 font-mono font-bold hover:underline">
                <Phone className="h-3.5 w-3.5" /> 0217 2731900
              </a>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
              <p className="font-semibold text-ink-200">Smt. Gopabai Damani Blood Centre (24h)</p>
              <a href="tel:02172726858" className="flex items-center gap-1.5 text-ruby-400 font-mono font-bold hover:underline">
                <Phone className="h-3.5 w-3.5" /> 0217 2726858 / 2722106
              </a>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
              <p className="font-semibold text-ink-200">Dr. Hedgewar Blood Bank</p>
              <a href="tel:02172311281" className="flex items-center gap-1.5 text-ruby-400 font-mono font-bold hover:underline">
                <Phone className="h-3.5 w-3.5" /> 0217 2311281 / 2311215
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-5 py-6 text-xs text-ink-500 sm:px-8">
          <p>© {new Date().getFullYear()} Blood Bridge. Designed for humanitarian life-saving impact.</p>
          <p className="text-[11px] text-ink-600">
            Adheres to NBTC & NACO guidelines (Ministry of Health & Family Welfare, Govt. of India).
          </p>
        </div>
      </div>
    </footer>
  );
}
