import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}
