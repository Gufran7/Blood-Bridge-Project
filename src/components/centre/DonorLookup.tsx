import { useState, type FormEvent } from 'react';
import { Search, UserRound } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import type { Donor } from '@/lib/bloodApi';
import { findDonorsByPhone } from '@/lib/passportApi';
import { getIndianMobileError } from '@/lib/validation';

type DonorLookupProps = {
  onSelect: (donor: Donor) => void;
};

export function DonorLookup({ onSelect }: DonorLookupProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [results, setResults] = useState<Donor[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = getIndianMobileError(phone);
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError(null);
    setSearchError(null);
    setSearching(true);
    try {
      setResults(await findDonorsByPhone(phone));
    } catch (error) {
      setResults(null);
      setSearchError(error instanceof Error ? error.message : 'Donors could not be searched right now.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Field label="Donor mobile number (10 digits)" htmlFor="centre-donor-phone" error={phoneError ?? undefined}>
            <input
              id="centre-donor-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, ''));
                setPhoneError(null);
              }}
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              className={`input ${phoneError ? 'input-invalid' : ''}`}
            />
          </Field>
        </div>
        <button type="submit" disabled={searching} className="btn-primary sm:mt-[1.875rem]">
          <Search className="h-4 w-4" aria-hidden />
          {searching ? 'Searching...' : 'Find donor'}
        </button>
      </form>

      {searchError && (
        <p role="alert" className="rounded-xl border border-danger-500/30 bg-danger-900/40 px-4 py-3 text-sm text-danger-300">
          {searchError}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
          No donor is registered with that number. Ask the donor to register on the Blood Bridge site first.
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="space-y-3">
          {results.map((donor) => (
            <li
              key={donor.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-900/60 text-ruby-300">
                  <UserRound className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-ink-100">{donor.full_name}</p>
                  <p className="text-sm text-ink-400">
                    {donor.blood_group} · {donor.city}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => onSelect(donor)} className="btn-ghost">
                Start screening
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
