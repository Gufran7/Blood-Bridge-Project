import { BLOOD_GROUPS, type BloodGroup } from '@/lib/bloodGroups';

type BloodGroupPickerProps = {
  value: BloodGroup | null;
  onChange: (group: BloodGroup | null) => void;
  allowAny?: boolean;
  label: string;
};

export function BloodGroupPicker({ value, onChange, allowAny = false, label }: BloodGroupPickerProps) {
  const options: (BloodGroup | null)[] = allowAny ? [null, ...BLOOD_GROUPS] : [...BLOOD_GROUPS];

  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {options.map((group) => {
        const selected = group === value;
        return (
          <button
            key={group ?? 'any'}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(group)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-400 ${
              selected
                ? 'border-ruby-500 bg-ruby-500 text-white shadow-[0_0_20px_rgba(224,49,63,0.35)]'
                : 'border-white/10 bg-white/[0.03] text-ink-300 hover:border-white/25 hover:text-ink-100'
            }`}
          >
            {group ?? 'Any'}
          </button>
        );
      })}
    </div>
  );
}
