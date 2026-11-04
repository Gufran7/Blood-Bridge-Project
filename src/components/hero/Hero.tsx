import { ArrowRight, HeartHandshake, HeartPulse } from 'lucide-react';
import { BloodDropIllustration } from '@/components/hero/BloodDropIllustration';
import { HeroSearchCard } from '@/components/hero/HeroSearchCard';
import type { DonorFilter } from '@/lib/bloodApi';

type HeroProps = {
  onRequestBlood: () => void;
  onBecomeDonor: () => void;
  onSearch: (filter: Pick<DonorFilter, 'bloodGroup' | 'city'>) => void;
};

export function Hero({ onRequestBlood, onBecomeDonor, onSearch }: HeroProps) {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="order-2 lg:order-1">
          <BloodDropIllustration className="mx-auto w-full max-w-md lg:max-w-lg" />
        </div>

        <div className="order-1 space-y-10 lg:order-2">
          <div className="space-y-6">
            <p className="eyebrow">Blood donation, matched in minutes</p>
            <h1 className="text-5xl font-extrabold uppercase leading-[1.02] tracking-tight text-ink-100 sm:text-6xl lg:text-7xl">
              Every drop
              <br />
              builds a <span className="text-ruby-500">bridge</span>
            </h1>
            <p className="max-w-xl text-base leading-[1.5] text-ink-300 sm:text-lg">
              Blood Bridge connects people who need blood with willing donors, blood banks and hospitals, so no patient has to search alone.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onRequestBlood} className="btn-primary px-6 py-3.5">
              <HeartPulse className="h-4 w-4" aria-hidden />
              I need blood
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={onBecomeDonor} className="btn-ghost px-6 py-3.5">
              <HeartHandshake className="h-4 w-4" aria-hidden />
              I want to donate
            </button>
          </div>

          <HeroSearchCard onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
