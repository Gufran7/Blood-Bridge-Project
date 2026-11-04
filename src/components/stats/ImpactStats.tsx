import { useAsyncData } from '@/hooks/useAsyncData';
import { useCountUp } from '@/hooks/useCountUp';
import { fetchSiteStats } from '@/lib/bloodApi';

type ImpactStatsProps = {
  version: number;
};

export function ImpactStats({ version }: ImpactStatsProps) {
  const { data, error, loading, reload } = useAsyncData(fetchSiteStats, [version]);

  const stats = [
    { label: 'Donors registered', value: data?.donors ?? 0 },
    { label: 'Patient requests', value: data?.requests ?? 0 },
    { label: 'Active requests', value: data?.activeRequests ?? 0 },
    { label: 'Blood banks & hospitals', value: data?.centres ?? 0 },
  ];

  return (
    <section id="impact" className="relative border-y border-white/10 bg-gradient-to-b from-ruby-900/25 via-ink-900/70 to-ink-900/70">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        {error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-ink-300">{error}</p>
            <button type="button" onClick={reload} className="btn-ghost px-4 py-2 text-sm">
              Try again
            </button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCounter key={stat.label} label={stat.label} value={stat.value} animate={!loading} />
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

type StatCounterProps = {
  label: string;
  value: number;
  animate: boolean;
};

function StatCounter({ label, value, animate }: StatCounterProps) {
  const counted = useCountUp(animate ? value : 0);

  return (
    <div className="space-y-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ruby-400 sm:text-sm">{label}</dt>
      <dd className="text-4xl font-extrabold tabular-nums tracking-tight text-ink-100 sm:text-5xl">
        {counted.toLocaleString()}
      </dd>
    </div>
  );
}
