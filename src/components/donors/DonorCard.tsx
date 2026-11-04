import { MapPin, Phone } from 'lucide-react';
import { timeAgo } from '@/lib/format';
import type { Donor } from '@/lib/bloodApi';

type DonorCardProps = {
  donor: Donor;
};

export function DonorCard({ donor }: DonorCardProps) {
  const dialNumber = donor.phone.replace(/[^+\d]/g, '');

  return (
    <article className="glass flex flex-col gap-5 p-5 transition duration-300 hover:-translate-y-1 hover:border-ruby-500/30 hover:shadow-[0_16px_48px_rgba(224,49,63,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ruby-500/15 text-lg font-extrabold text-ruby-300 ring-1 ring-ruby-500/30">
          {donor.blood_group}
        </div>
        {donor.is_available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-900/60 px-3 py-1 text-xs font-semibold text-success-300">
            <span className="h-1.5 w-1.5 rounded-full bg-success-400" aria-hidden />
            Available
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-ink-400">Unavailable</span>
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-ink-100">{donor.full_name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-ink-400">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {donor.city}
        </p>
        <p className="text-xs text-ink-500">
          {donor.last_donated_on ? `Last donated ${timeAgo(donor.last_donated_on)}` : 'No donation on record'}
        </p>
      </div>

      <a
        href={`tel:${dialNumber}`}
        className="btn-ghost mt-auto w-full py-2.5 text-sm tabular-nums"
      >
        <Phone className="h-4 w-4" aria-hidden />
        {donor.phone}
      </a>
    </article>
  );
}
