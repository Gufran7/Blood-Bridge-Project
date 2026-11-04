import { useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, KeyRound, RotateCcw } from 'lucide-react';
import { PageShell } from '@/components/passport/PageShell';
import { DonorLookup } from '@/components/centre/DonorLookup';
import { ScreeningForm } from '@/components/centre/ScreeningForm';
import { Field } from '@/components/ui/Field';
import type { Donor } from '@/lib/bloodApi';
import { formatDate } from '@/lib/format';
import type { RecordedDonation } from '@/lib/passportApi';

export function DonationCentrePage() {
  const [staffCode, setStaffCode] = useState('');
  const [donor, setDonor] = useState<Donor | null>(null);
  const [recorded, setRecorded] = useState<RecordedDonation | null>(null);

  const reset = () => {
    setDonor(null);
    setRecorded(null);
  };

  return (
    <PageShell>
      <div className="space-y-10">
        <div className="max-w-2xl space-y-4">
          <p className="eyebrow">Donation centre</p>
          <h1 className="section-title">Record a donation</h1>
          <p className="text-base leading-[1.5] text-ink-300">
            Find the donor by phone number, record the screening values, and issue their donation certificate. The first donation also creates their donor passport.
          </p>
        </div>

        <section className="glass space-y-4 p-6 sm:p-8" aria-labelledby="staff-access-title">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-ruby-400" aria-hidden />
            <h2 id="staff-access-title" className="text-lg font-bold text-ink-100">
              Staff access
            </h2>
          </div>
          <Field label="Staff access code" htmlFor="staff-access-code" hint="Only staff at a registered donation centre can record donations.">
            <input
              id="staff-access-code"
              type="password"
              value={staffCode}
              onChange={(event) => setStaffCode(event.target.value)}
              autoComplete="off"
              className="input"
            />
          </Field>
        </section>

        <section className="glass p-6 sm:p-8" aria-live="polite">
          {recorded ? (
            <RecordedSummary donor={donor} recorded={recorded} onNext={reset} />
          ) : donor ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-ink-100">Screening</h2>
                  <p className="text-sm text-ink-400">Enter the values measured today. Donors who do not meet the criteria are not recorded.</p>
                </div>
              </div>
              <ScreeningForm
                key={donor.id}
                donor={donor}
                staffCode={staffCode}
                onRecorded={setRecorded}
                onCancel={reset}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-ink-100">Find the donor</h2>
                <p className="text-sm text-ink-400">Search by the phone number the donor registered with.</p>
              </div>
              <DonorLookup onSelect={setDonor} />
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function RecordedSummary({
  donor,
  recorded,
  onNext,
}: {
  donor: Donor | null;
  recorded: RecordedDonation;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-900/70 ring-1 ring-success-500/40">
        <CheckCircle2 className="h-8 w-8 text-success-400" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-ink-100">Donation recorded</h2>
        <p className="max-w-md text-sm leading-[1.5] text-ink-400">
          {donor ? `${donor.full_name}'s` : 'The'} certificate {recorded.certificateNumber} is ready. The next eligible donation date is{' '}
          {formatDate(recorded.nextEligibleOn)}.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={`#/certificate/${recorded.certificateCode}`} className="btn-primary">
          <FileText className="h-4 w-4" aria-hidden />
          Open certificate
        </a>
        <a href={`#/passport/${recorded.passportCode}`} className="btn-ghost">
          Open passport
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
        <button type="button" onClick={onNext} className="btn-ghost">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Record another donor
        </button>
      </div>
    </div>
  );
}
