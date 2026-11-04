import { useState, type FormEvent } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import type { Donor } from '@/lib/bloodApi';
import { recordDonation, type RecordedDonation } from '@/lib/passportApi';

type ScreeningValues = {
  centreName: string;
  volumeMl: string;
  weightKg: string;
  haemoglobinGdl: string;
  systolic: string;
  diastolic: string;
  pulseBpm: string;
  temperatureC: string;
};

type ScreeningErrors = Partial<Record<keyof ScreeningValues, string>>;

const EMPTY_VALUES: ScreeningValues = {
  centreName: '',
  volumeMl: '450',
  weightKg: '',
  haemoglobinGdl: '',
  systolic: '',
  diastolic: '',
  pulseBpm: '',
  temperatureC: '',
};

const NUMERIC_FIELDS: { key: Exclude<keyof ScreeningValues, 'centreName'>; label: string; unit: string; step: string }[] = [
  { key: 'volumeMl', label: 'Volume donated', unit: 'ml', step: '1' },
  { key: 'weightKg', label: 'Weight', unit: 'kg', step: '0.1' },
  { key: 'haemoglobinGdl', label: 'Haemoglobin', unit: 'g/dL', step: '0.1' },
  { key: 'systolic', label: 'Systolic pressure', unit: 'mmHg', step: '1' },
  { key: 'diastolic', label: 'Diastolic pressure', unit: 'mmHg', step: '1' },
  { key: 'pulseBpm', label: 'Pulse', unit: 'bpm', step: '1' },
  { key: 'temperatureC', label: 'Temperature', unit: 'C', step: '0.1' },
];

function validate(values: ScreeningValues): ScreeningErrors {
  const errors: ScreeningErrors = {};
  if (values.centreName.trim().length < 2) errors.centreName = 'Enter the donation centre name.';
  for (const field of NUMERIC_FIELDS) {
    const raw = values[field.key].trim();
    if (raw === '' || !Number.isFinite(Number(raw))) errors[field.key] = 'Enter a number.';
  }
  return errors;
}

type ScreeningFormProps = {
  donor: Donor;
  staffCode: string;
  onRecorded: (donation: RecordedDonation) => void;
  onCancel: () => void;
};

export function ScreeningForm({ donor, staffCode, onRecorded, onCancel }: ScreeningFormProps) {
  const [values, setValues] = useState<ScreeningValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ScreeningErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);

  const update = <K extends keyof ScreeningValues>(key: K, value: ScreeningValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setReasons([]);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (staffCode.trim().length === 0) {
      setSubmitError('Enter the staff access code at the top of the page first.');
      return;
    }

    setSaving(true);
    const result = await recordDonation({
      staffCode: staffCode.trim(),
      donorId: donor.id,
      centreName: values.centreName.trim(),
      volumeMl: Number(values.volumeMl),
      weightKg: Number(values.weightKg),
      haemoglobinGdl: Number(values.haemoglobinGdl),
      systolic: Number(values.systolic),
      diastolic: Number(values.diastolic),
      pulseBpm: Number(values.pulseBpm),
      temperatureC: Number(values.temperatureC),
    });
    setSaving(false);

    if (result.ok) {
      onRecorded(result.donation);
      return;
    }
    setSubmitError(result.message);
    setReasons(result.reasons);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <p className="font-semibold text-ink-100">{donor.full_name}</p>
        <p className="text-sm text-ink-400">
          {donor.blood_group} · {donor.city} · {donor.phone}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Donation centre" htmlFor="screening-centre" error={errors.centreName}>
          <input
            id="screening-centre"
            value={values.centreName}
            onChange={(event) => update('centreName', event.target.value)}
            placeholder="e.g. City General Blood Bank"
            className={`input ${errors.centreName ? 'input-invalid' : ''}`}
          />
        </Field>
        {NUMERIC_FIELDS.map((field) => (
          <Field key={field.key} label={`${field.label} (${field.unit})`} htmlFor={`screening-${field.key}`} error={errors[field.key]}>
            <input
              id={`screening-${field.key}`}
              type="number"
              inputMode="decimal"
              step={field.step}
              value={values[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              className={`input ${errors[field.key] ? 'input-invalid' : ''}`}
            />
          </Field>
        ))}
      </div>

      {submitError && (
        <div role="alert" className="space-y-3 rounded-xl border border-danger-500/30 bg-danger-900/40 px-4 py-3 text-sm text-danger-300">
          <p className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {submitError}
          </p>
          {reasons.length > 0 && (
            <ul className="list-disc space-y-1 pl-9 text-danger-200">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-ghost" disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {saving ? 'Recording...' : 'Record donation and issue certificate'}
        </button>
      </div>
    </form>
  );
}
