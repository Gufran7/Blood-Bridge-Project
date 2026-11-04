import { Check, Minus } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BLOOD_GROUPS, CAN_DONATE_TO } from '@/lib/bloodGroups';

export function CompatibilityChart() {
  return (
    <section id="compatibility" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeading
        eyebrow="Compatibility"
        title="Which blood types can give to whom"
        description="Read across a row to see who a donor can help. Matching blood groups are the safest choice, and the chart shows every compatible pairing."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-10">
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-center text-sm">
              <caption className="sr-only">Blood donation compatibility between donor and patient blood groups</caption>
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-ink-400">
                  <th scope="col" className="px-4 py-4 text-left font-semibold">
                    Donor &rarr; Patient
                  </th>
                  {BLOOD_GROUPS.map((group) => (
                    <th key={group} scope="col" className="px-2 py-4 font-extrabold tracking-normal text-ink-200">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map((donor) => (
                  <tr key={donor} className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]">
                    <th scope="row" className="px-4 py-3.5 text-left font-extrabold text-ruby-300">
                      {donor}
                    </th>
                    {BLOOD_GROUPS.map((recipient) => {
                      const compatible = CAN_DONATE_TO[donor].includes(recipient);
                      return (
                        <td key={recipient} className="px-2 py-3.5">
                          {compatible ? (
                            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-success-900/70 ring-1 ring-success-500/40">
                              <Check className="h-4 w-4 text-success-300" aria-label={`${donor} can give to ${recipient}`} />
                            </span>
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-ink-600" aria-label={`${donor} cannot give to ${recipient}`} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <div className="glass p-6">
            <p className="eyebrow">Universal donor</p>
            <p className="mt-3 text-4xl font-extrabold text-ink-100">O-</p>
            <p className="mt-3 text-sm leading-[1.5] text-ink-400">
              Can give to every blood group. Often used in emergencies when the patient's type is not yet known.
            </p>
          </div>
          <div className="glass p-6">
            <p className="eyebrow text-steel-300">Universal recipient</p>
            <p className="mt-3 text-4xl font-extrabold text-ink-100">AB+</p>
            <p className="mt-3 text-sm leading-[1.5] text-ink-400">
              Can receive blood from all eight groups. Donors with other types can still help AB+ patients.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
