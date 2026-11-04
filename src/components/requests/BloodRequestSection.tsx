import { AlertTriangle, ArrowRight, ClipboardList, HeartHandshake, MapPin, Clock } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchRecentRequests, type BloodRequestSummary, type UrgencyLevel } from '@/lib/bloodApi';
import { maskPatientName, timeAgo } from '@/lib/format';

const URGENCY_STYLES: Record<UrgencyLevel, { label: string; badge: string; dot: string }> = {
  critical: {
    label: 'Critical',
    badge: 'bg-danger-900/70 text-danger-300 ring-danger-500/40',
    dot: 'bg-danger-400',
  },
  urgent: {
    label: 'Urgent',
    badge: 'bg-ember-500/15 text-ember-300 ring-ember-500/40',
    dot: 'bg-ember-400',
  },
  planned: {
    label: 'Planned',
    badge: 'bg-white/5 text-steel-300 ring-steel-500/40',
    dot: 'bg-steel-400',
  },
};

type BloodRequestSectionProps = {
  version: number;
  onRequestBlood: () => void;
  onBecomeDonor: () => void;
};

export function BloodRequestSection({ version, onRequestBlood, onBecomeDonor }: BloodRequestSectionProps) {
  return (
    <section id="request-blood" className="relative scroll-mt-24 border-t border-white/10 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Blood requests"
          title="Need blood? Post a request and get matched"
          description="Tell us the blood group, hospital and urgency. Compatible donors and blood banks in the area can see your request straight away."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="glass group relative overflow-hidden p-8 transition duration-300 hover:border-ruby-500/40">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ruby-500/20 blur-3xl transition duration-500 group-hover:bg-ruby-500/30" aria-hidden />
            <div className="relative space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
                <ClipboardList className="h-6 w-6 text-ruby-300" aria-hidden />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-ink-100">I need blood</h3>
                <p className="text-sm leading-[1.5] text-ink-300">
                  For patients and families. Post a request in a few minutes and let donors and hospitals respond.
                </p>
              </div>
              <button type="button" onClick={onRequestBlood} className="btn-primary px-5 py-3">
                Post a blood request
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </article>

          <article className="glass group relative overflow-hidden p-8 transition duration-300 hover:border-steel-400/40">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-steel-500/15 blur-3xl transition duration-500 group-hover:bg-steel-400/25" aria-hidden />
            <div className="relative space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-steel-500/40">
                <HeartHandshake className="h-6 w-6 text-steel-300" aria-hidden />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-ink-100">I want to donate</h3>
                <p className="text-sm leading-[1.5] text-ink-300">
                  For healthy adults ready to help. Join the donor list so patients in your city can reach you.
                </p>
              </div>
              <button type="button" onClick={onBecomeDonor} className="btn-ghost px-5 py-3">
                Join as a donor
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </article>
        </div>

        <RequestFeed version={version} />
      </div>
    </section>
  );
}

type RequestFeedProps = {
  version: number;
};

function RequestFeed({ version }: RequestFeedProps) {
  const { data, error, loading, reload } = useAsyncData(() => fetchRecentRequests(), [version]);

  return (
    <div className="mt-16 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-ink-100">Open requests</h3>
          <p className="mt-1 text-sm text-ink-400">The latest patients who are waiting for a donor.</p>
        </div>
      </div>

      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading requests">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-44" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="glass flex flex-col items-center gap-4 p-10 text-center">
          <AlertTriangle className="h-8 w-8 text-danger-400" aria-hidden />
          <p className="text-sm text-ink-300">{error}</p>
          <button type="button" onClick={reload} className="btn-ghost px-4 py-2 text-sm">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-sm text-ink-400">No open requests right now. Thank you for keeping the community ready.</p>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: BloodRequestSummary }) {
  const urgency = URGENCY_STYLES[request.urgency];

  return (
    <article className="glass flex flex-col gap-5 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${urgency.badge}`}>
          <span className="relative flex h-2 w-2">
            {request.urgency === 'critical' && (
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${urgency.dot}`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${urgency.dot}`} />
          </span>
          {urgency.label}
        </span>
        <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-ruby-500/15 px-3 text-base font-extrabold text-ruby-300 ring-1 ring-ruby-500/30">
          {request.blood_group}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-base font-bold text-ink-100">
          {maskPatientName(request.patient_name)}
          <span className="ml-2 text-sm font-normal text-ink-400">
            needs {request.units_needed} {request.units_needed === 1 ? 'unit' : 'units'}
          </span>
        </h4>
        <p className="flex items-center gap-1.5 text-sm text-ink-400">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">
            {request.hospital}, {request.city}
          </span>
        </p>
      </div>

      <p className="mt-auto flex items-center gap-1.5 text-xs text-ink-500">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Posted {timeAgo(request.created_at)}
      </p>
    </article>
  );
}
