import { AlertTriangle, Search, UserPlus } from 'lucide-react';
import { BloodGroupPicker } from '@/components/ui/BloodGroupPicker';
import { DonorCard } from '@/components/donors/DonorCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchDonors, type DonorFilter } from '@/lib/bloodApi';

type DonorSearchProps = {
  filter: DonorFilter;
  onFilterChange: (next: Partial<DonorFilter>) => void;
  onRegister: () => void;
  version: number;
};

export function DonorSearch({ filter, onFilterChange, onRegister, version }: DonorSearchProps) {
  const debouncedFilter = useDebouncedValue(filter, 300);
  const { data, error, loading, reload } = useAsyncData(
    () => searchDonors(debouncedFilter),
    [debouncedFilter, version],
  );

  return (
    <section id="find-donors" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeading
        eyebrow="Donor search"
        title="Find donors by blood group and city"
        description="Filter the donor list to find people who match a patient's needs. Call a donor directly to arrange a donation."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-10">
        <aside className="glass h-fit space-y-7 p-6 lg:sticky lg:top-24">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Blood group</p>
            <BloodGroupPicker
              label="Filter by blood group"
              allowAny
              value={filter.bloodGroup}
              onChange={(group) => onFilterChange({ bloodGroup: group })}
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="donor-city" className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
              City
            </label>
            <div className="relative">
              <input
                id="donor-city"
                value={filter.city}
                onChange={(event) => onFilterChange({ city: event.target.value })}
                placeholder="Filter city (e.g. Solapur)"
                className="input pl-11"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
            <span className="text-sm font-semibold text-ink-200">Available now only</span>
            <button
              type="button"
              role="switch"
              aria-checked={filter.availableOnly}
              onClick={() => onFilterChange({ availableOnly: !filter.availableOnly })}
              className={`relative h-6 w-11 rounded-full transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-400 ${
                filter.availableOnly ? 'bg-ruby-500' : 'bg-ink-600'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition duration-300 ${
                  filter.availableOnly ? 'left-[22px]' : 'left-0.5'
                }`}
              />
              <span className="sr-only">Show only available donors</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading donors">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton h-56" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="glass flex flex-col items-center gap-4 p-10 text-center">
              <AlertTriangle className="h-8 w-8 text-danger-400" aria-hidden />
              <p className="text-sm text-ink-300">{error}</p>
              <button type="button" onClick={reload} className="btn-ghost px-4 py-2 text-sm">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && data && data.length === 0 && (
            <div className="glass flex flex-col items-center gap-5 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
                <Search className="h-6 w-6 text-ruby-300" aria-hidden />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-ink-100">No donors match this search yet</h3>
                <p className="max-w-md text-sm text-ink-400">
                  Try another blood group or city, or register as a donor so patients in your area can find you.
                </p>
              </div>
              <button type="button" onClick={onRegister} className="btn-primary px-5 py-2.5 text-sm">
                <UserPlus className="h-4 w-4" aria-hidden />
                Register as a donor
              </button>
            </div>
          )}

          {!loading && !error && data && data.length > 0 && (
            <>
              <p className="mb-5 text-sm text-ink-400">
                <span className="font-semibold text-ink-100">{data.length}</span>{' '}
                {data.length === 1 ? 'donor' : 'donors'} found
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
