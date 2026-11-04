import { ArrowRight, BadgeCheck, QrCode, ScanLine, Stethoscope } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Donor passport',
    description:
      'Your first donation at a Blood Bridge centre creates a passport with a unique QR code and your full donation history.',
    action: 'Open my passport',
    href: '#/passport',
  },
  {
    icon: QrCode,
    title: 'Digital certificate',
    description:
      'After every donation you receive a certificate with a QR code, showing your screening results and eligibility.',
    action: 'Find a certificate',
    href: '#/passport',
  },
  {
    icon: ScanLine,
    title: 'Scan to check',
    description:
      'Scan your passport QR code to see your donation history and the date you can next donate.',
    action: 'Look up a passport',
    href: '#/passport',
  },
  {
    icon: Stethoscope,
    title: 'Donation centre',
    description:
      'Donation centres record each donation, check screening values and confirm eligibility before anyone donates.',
    action: 'Open donation centre',
    href: '#/centre',
  },
];

export function PassportHighlight() {
  return (
    <section id="passport" className="relative scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Donor passport"
          title="Every donation, recorded and easy to verify"
          description="Your passport keeps your donation history in one place. Each donation gets a certificate you can show, and a QR code that anyone at a centre can scan to check your next eligible date."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 80}>
                <a
                  href={feature.href}
                  className="glass group flex h-full flex-col gap-6 p-7 transition duration-300 hover:-translate-y-1 hover:border-ruby-500/40"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ruby-500/15 ring-1 ring-ruby-500/30 transition group-hover:bg-ruby-500/25">
                    <Icon className="h-6 w-6 text-ruby-300" aria-hidden />
                  </span>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold tracking-tight text-ink-100">{feature.title}</h3>
                    <p className="text-sm leading-[1.5] text-ink-300">{feature.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-ruby-300">
                    {feature.action}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
