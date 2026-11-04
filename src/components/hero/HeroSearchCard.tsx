import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { BloodGroupPicker } from '@/components/ui/BloodGroupPicker';
import { Field } from '@/components/ui/Field';
import type { BloodGroup } from '@/lib/bloodGroups';
import type { DonorFilter } from '@/lib/bloodApi';

type HeroSearchCardProps = {
  onSearch: (filter: Pick<DonorFilter, 'bloodGroup' | 'city'>) => void;
};

export function HeroSearchCard({ onSearch }: HeroSearchCardProps) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bloodGroup) {
      setError('Choose a blood group to search.');
      return;
    }
    setError(null);
    onSearch({ bloodGroup, city });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="glass relative space-y-6 p-6 sm:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Blood group</p>
        <BloodGroupPicker
          label="Blood group"
          value={bloodGroup}
          onChange={(group) => {
            setBloodGroup(group);
            setError(null);
          }}
        />
        {error && (
          <p role="alert" className="text-xs text-danger-400">
            {error}
          </p>
        )}
      </div>

      <Field label="City" htmlFor="hero-city">
        <div className="relative">
          <input
            id="hero-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter your city (e.g. Solapur)"
            autoComplete="address-level2"
            className="input pl-11"
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
        </div>
      </Field>

      <button type="submit" className="btn-primary w-full py-3.5 uppercase tracking-wide">
        Find donors now
      </button>
    </form>
  );
}
