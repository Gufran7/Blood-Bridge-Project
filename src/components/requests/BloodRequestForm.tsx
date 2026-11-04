import { useState, type FormEvent } from 'react';
import { CheckCircle2, Siren } from 'lucide-react';
import { BloodGroupPicker } from '@/components/ui/BloodGroupPicker';
import { Field } from '@/components/ui/Field';
import { countCompatibleDonors, createBloodRequest, type NewBloodRequestInput, type UrgencyLevel } from '@/lib/bloodApi';
import type { BloodGroup } from '@/lib/bloodGroups';
import { getIndianMobileError, isWithinLength } from '@/lib/validation';

type RequestFormValues = {
  patientName: string;
  bloodGroup: BloodGroup | null;
  unitsNeeded: string;
  urgency: UrgencyLevel;
  hospital: string;
  city: string;
  contactName: string;
  contactPhone: string;
  notes: string;
};

type RequestFormErrors = Partial<Record<keyof RequestFormValues, string>>;

const EMPTY_VALUES: RequestFormValues = {
  patientName: '',
  bloodGroup: null,
  unitsNeeded: '1',
  urgency: 'urgent',
  hospital: '',
  city: '',
  contactName: '',
  contactPhone: '',
  notes: '',
};

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; hint: string }[] = [
  { value: 'critical', label: 'Critical', hint: 'Within hours' },
  { value: 'urgent', label: 'Urgent', hint: 'Within 1-2 days' },
  { value: 'planned', label: 'Planned', hint: 'Scheduled surgery' },
];

const UNIT_OPTIONS = Array.from({ length: 20 }, (_, index) => String(index + 1));

function validate(values: RequestFormValues): RequestFormErrors {
  const errors: RequestFormErrors = {};
  if (!isWithinLength(values.patientName, 2, 80)) errors.patientName = 'Enter the patient name (2 to 80 characters).';
  if (!values.bloodGroup) errors.bloodGroup = 'Choose the blood group needed.';
  if (!isWithinLength(values.hospital, 2, 120)) errors.hospital = 'Enter the hospital or clinic.';
  if (!isWithinLength(values.city, 2, 60)) errors.city = 'Enter the city.';
  if (!isWithinLength(values.contactName, 2, 80)) errors.contactName = 'Enter your name so donors know who to contact.';
  const phoneError = getIndianMobileError(values.contactPhone);
  if (phoneError) errors.contactPhone = phoneError;
  if (values.notes.trim().length > 500) errors.notes = 'Keep notes under 500 characters.';
  return errors;
}

type SubmittedRequest = {
  bloodGroup: BloodGroup;
  city: string;
  matchingDonors: number | null;
};

type BloodRequestFormProps = {
  onDone: () => void;
};

export function BloodRequestForm({ onDone }: BloodRequestFormProps) {
  const [values, setValues] = useState<RequestFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RequestFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null);

  const update = <K extends keyof RequestFormValues>(key: K, value: RequestFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0 || !values.bloodGroup) return;

    const payload: NewBloodRequestInput = {
      patient_name: values.patientName.trim(),
      blood_group: values.bloodGroup,
      units_needed: Number(values.unitsNeeded),
      hospital: values.hospital.trim(),
      city: values.city.trim(),
      contact_name: values.contactName.trim(),
      contact_phone: values.contactPhone.trim(),
      urgency: values.urgency,
      notes: values.notes.trim() || null,
    };

    setSaving(true);
    try {
      await createBloodRequest(payload);
      const matchingDonors = await countCompatibleDonors(payload.blood_group, payload.city).catch(() => null);
      setSubmitted({ bloodGroup: payload.blood_group, city: payload.city, matchingDonors });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-900/70 ring-1 ring-success-500/40">
          <CheckCircle2 className="h-8 w-8 text-success-400" aria-hidden />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-ink-100">Your request is live</h3>
          {submitted.matchingDonors === null ? (
            <p className="max-w-md text-sm leading-[1.5] text-ink-400">
              Your request is listed for donors to see. We could not check matching donors right now.
            </p>
          ) : (
            <p className="max-w-md text-sm leading-[1.5] text-ink-400">
              We found{' '}
              <span className="font-semibold text-ink-100">
                {submitted.matchingDonors} available {submitted.matchingDonors === 1 ? 'donor' : 'donors'}
              </span>{' '}
              who can give {submitted.bloodGroup} blood in {submitted.city}. Donors can see your request in the list below.
            </p>
          )}
        </div>
        <button type="button" onClick={onDone} className="btn-primary px-6 py-3">
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Patient name" htmlFor="request-patient" error={errors.patientName}>
          <input
            id="request-patient"
            value={values.patientName}
            onChange={(event) => update('patientName', event.target.value)}
            className={`input ${errors.patientName ? 'input-invalid' : ''}`}
          />
        </Field>
        <Field label="Units needed" htmlFor="request-units">
          <select
            id="request-units"
            value={values.unitsNeeded}
            onChange={(event) => update('unitsNeeded', event.target.value)}
            className="input"
          >
            {UNIT_OPTIONS.map((units) => (
              <option key={units} value={units} className="bg-ink-900">
                {units} {units === '1' ? 'unit' : 'units'}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Blood group needed</p>
        <BloodGroupPicker
          label="Blood group needed"
          value={values.bloodGroup}
          onChange={(group) => update('bloodGroup', group)}
        />
        {errors.bloodGroup && (
          <p role="alert" className="text-xs text-danger-400">
            {errors.bloodGroup}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Urgency</p>
        <div role="radiogroup" aria-label="Urgency" className="grid gap-2 sm:grid-cols-3">
          {URGENCY_OPTIONS.map((option) => {
            const selected = values.urgency === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update('urgency', option.value)}
                className={`flex flex-col rounded-xl border px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-400 ${
                  selected
                    ? 'border-ruby-500 bg-ruby-500/15 text-ink-100'
                    : 'border-white/10 bg-white/[0.03] text-ink-300 hover:border-white/25'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Siren className={`h-4 w-4 ${selected ? 'text-ruby-300' : 'text-ink-500'}`} aria-hidden />
                  {option.label}
                </span>
                <span className="mt-1 text-xs text-ink-500">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Hospital or clinic" htmlFor="request-hospital" error={errors.hospital}>
          <input
            id="request-hospital"
            value={values.hospital}
            onChange={(event) => update('hospital', event.target.value)}
            className={`input ${errors.hospital ? 'input-invalid' : ''}`}
          />
        </Field>
        <Field label="City" htmlFor="request-city" error={errors.city}>
          <input
            id="request-city"
            value={values.city}
            onChange={(event) => update('city', event.target.value)}
            className={`input ${errors.city ? 'input-invalid' : ''}`}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="request-contact-name" error={errors.contactName}>
          <input
            id="request-contact-name"
            value={values.contactName}
            onChange={(event) => update('contactName', event.target.value)}
            autoComplete="name"
            className={`input ${errors.contactName ? 'input-invalid' : ''}`}
          />
        </Field>
        <Field
          label="Contact mobile (10 digits)"
          htmlFor="request-contact-phone"
          error={errors.contactPhone}
          hint="Indian mobile (10 digits starting with 6-9)."
        >
          <input
            id="request-contact-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={values.contactPhone}
            onChange={(event) => update('contactPhone', event.target.value.replace(/\D/g, ''))}
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            className={`input ${errors.contactPhone ? 'input-invalid' : ''}`}
          />
        </Field>
      </div>

      <Field label="Notes (optional)" htmlFor="request-notes" error={errors.notes} hint="Ward, case details or anything donors should know.">
        <textarea
          id="request-notes"
          rows={3}
          value={values.notes}
          onChange={(event) => update('notes', event.target.value)}
          className={`input min-h-[96px] resize-y ${errors.notes ? 'input-invalid' : ''}`}
        />
      </Field>

      {submitError && (
        <p role="alert" className="rounded-xl border border-danger-500/30 bg-danger-900/40 px-4 py-3 text-sm text-danger-300">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
        {saving ? 'Posting your request...' : 'Post blood request'}
      </button>
    </form>
  );
}
