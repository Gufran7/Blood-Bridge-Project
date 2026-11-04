import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BloodGroupPicker } from '@/components/ui/BloodGroupPicker';
import { Field } from '@/components/ui/Field';
import { createDonor } from '@/lib/bloodApi';
import type { BloodGroup } from '@/lib/bloodGroups';
import { isValidEmail, isWithinLength, getIndianMobileError } from '@/lib/validation';

type DonorFormValues = {
  fullName: string;
  bloodGroup: BloodGroup | null;
  city: string;
  phone: string;
  email: string;
  lastDonatedOn: string;
  consent: boolean;
};

type DonorFormErrors = Partial<Record<keyof DonorFormValues, string>>;

const EMPTY_VALUES: DonorFormValues = {
  fullName: '',
  bloodGroup: null,
  city: '',
  phone: '',
  email: '',
  lastDonatedOn: '',
  consent: false,
};

function validate(values: DonorFormValues): DonorFormErrors {
  const errors: DonorFormErrors = {};
  if (!isWithinLength(values.fullName, 2, 80)) errors.fullName = 'Enter your full name (2 to 80 characters).';
  if (!values.bloodGroup) errors.bloodGroup = 'Choose your blood group.';
  if (!isWithinLength(values.city, 2, 60)) errors.city = 'Enter the city you live in.';
  const phoneError = getIndianMobileError(values.phone);
  if (phoneError) errors.phone = phoneError;
  if (values.email.trim() && !isValidEmail(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.lastDonatedOn && values.lastDonatedOn > new Date().toISOString().slice(0, 10)) {
    errors.lastDonatedOn = 'The last donation date cannot be in the future.';
  }
  if (!values.consent) errors.consent = 'Please confirm you agree to be contacted about blood requests.';
  return errors;
}

type DonorRegistrationFormProps = {
  onDone: () => void;
};

export function DonorRegistrationForm({ onDone }: DonorRegistrationFormProps) {
  const [values, setValues] = useState<DonorFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<DonorFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof DonorFormValues>(key: K, value: DonorFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0 || !values.bloodGroup) return;

    setSaving(true);
    try {
      await createDonor({
        full_name: values.fullName.trim(),
        blood_group: values.bloodGroup,
        city: values.city.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || null,
        last_donated_on: values.lastDonatedOn || null,
      });
      setSaved(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved && values.bloodGroup) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-900/70 ring-1 ring-success-500/40">
          <CheckCircle2 className="h-8 w-8 text-success-400" aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-ink-100">You are on the donor list</h3>
          <p className="max-w-md text-sm leading-[1.5] text-ink-400">
            Patients searching for {values.bloodGroup} donors in {values.city.trim()} can now find you. Thank you for being ready to help.
          </p>
        </div>
        <button type="button" onClick={onDone} className="btn-primary px-6 py-3">
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field label="Full name" htmlFor="donor-full-name" error={errors.fullName}>
        <input
          id="donor-full-name"
          value={values.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          autoComplete="name"
          className={`input ${errors.fullName ? 'input-invalid' : ''}`}
        />
      </Field>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Blood group</p>
        <BloodGroupPicker
          label="Your blood group"
          value={values.bloodGroup}
          onChange={(group) => update('bloodGroup', group)}
        />
        {errors.bloodGroup && (
          <p role="alert" className="text-xs text-danger-400">
            {errors.bloodGroup}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="City" htmlFor="donor-city-form" error={errors.city}>
          <input
            id="donor-city-form"
            value={values.city}
            onChange={(event) => update('city', event.target.value)}
            autoComplete="address-level2"
            className={`input ${errors.city ? 'input-invalid' : ''}`}
          />
        </Field>
        <Field
          label="Mobile number (10 digits)"
          htmlFor="donor-phone"
          error={errors.phone}
          hint="Exactly 10 digits starting with 6, 7, 8, or 9 (no special characters or +91)."
        >
          <input
            id="donor-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={values.phone}
            onChange={(event) => update('phone', event.target.value.replace(/\D/g, ''))}
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            className={`input ${errors.phone ? 'input-invalid' : ''}`}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email (optional)" htmlFor="donor-email" error={errors.email}>
          <input
            id="donor-email"
            type="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            className={`input ${errors.email ? 'input-invalid' : ''}`}
          />
        </Field>
        <Field
          label="Last donation (optional)"
          htmlFor="donor-last-donation"
          error={errors.lastDonatedOn}
          hint="Leave empty if you have never donated."
        >
          <input
            id="donor-last-donation"
            type="date"
            value={values.lastDonatedOn}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => update('lastDonatedOn', event.target.value)}
            className={`input ${errors.lastDonatedOn ? 'input-invalid' : ''}`}
          />
        </Field>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.5] text-ink-300">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(event) => update('consent', event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-ruby-500"
          />
          <span>I agree to be contacted by people or hospitals looking for blood that matches my blood group.</span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-xs text-danger-400">
            {errors.consent}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="rounded-xl border border-danger-500/30 bg-danger-900/40 px-4 py-3 text-sm text-danger-300">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
        {saving ? 'Saving your details...' : 'Join as a donor'}
      </button>
    </form>
  );
}
