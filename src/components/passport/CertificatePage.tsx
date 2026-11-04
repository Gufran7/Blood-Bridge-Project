import { AlertTriangle, Droplet, Printer, RefreshCw, ArrowLeft } from 'lucide-react';
import { PageShell } from '@/components/passport/PageShell';
import { QrCode } from '@/components/passport/QrCode';
import { StatusPanel } from '@/components/passport/StatusPanel';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatDate } from '@/lib/format';
import { fetchCertificate, type Certificate } from '@/lib/passportApi';

const ELIGIBILITY_CRITERIA = [
  'Weight of at least 50 kg',
  'Haemoglobin of at least 12.5 g/dL',
  'Blood pressure within 90 to 180 / 50 to 110 mmHg',
  'Pulse between 50 and 100 beats per minute',
  'Temperature no higher than 37.5 C',
  'At least 56 days since the previous donation',
];

type CertificatePageProps = {
  code: string;
};

export function CertificatePage({ code }: CertificatePageProps) {
  const { data, error, loading, reload } = useAsyncData(() => fetchCertificate(code), [code]);

  return (
    <PageShell>
      {loading && <div className="skeleton h-[32rem]" aria-busy="true" aria-label="Loading certificate" />}

      {!loading && error && (
        <StatusPanel
          icon={<AlertTriangle className="h-7 w-7 text-warning-400" aria-hidden />}
          title="Certificate unavailable"
          message={error}
          action={
            <button type="button" onClick={reload} className="btn-ghost">
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          }
        />
      )}

      {!loading && !error && !data && (
        <StatusPanel
          icon={<AlertTriangle className="h-7 w-7 text-warning-400" aria-hidden />}
          title="No certificate found"
          message="This certificate link does not match any donation. Open the passport to see the donations on record."
          action={
            <a href="#/passport" className="btn-ghost">
              Open a passport
            </a>
          }
        />
      )}

      {!loading && !error && data && <CertificateDocument certificate={data} code={code} />}
    </PageShell>
  );
}

function CertificateDocument({ certificate, code }: { certificate: Certificate; code: string }) {
  const certificateUrl = `${window.location.origin}${window.location.pathname}#/certificate/${code}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <a
          href={`#/passport/${certificate.passport_code}`}
          className="inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-ink-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to passport
        </a>
        <button type="button" onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" aria-hidden />
          Print or save as PDF
        </button>
      </div>

      <article className="relative overflow-hidden rounded-3xl border-[10px] border-double border-ruby-700 bg-white p-8 text-ink-900 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-14 print:border-ruby-700 print:shadow-none">
        <div className="flex items-center justify-between gap-4 border-b border-ink-900/10 pb-6">
          <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Droplet className="h-6 w-6 fill-ruby-600 text-ruby-600" aria-hidden />
            <span className="text-ink-900">BLOOD</span>
            <span className="text-ruby-600">BRIDGE</span>
          </div>
          <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            Certificate no.
            <span className="mt-1 block font-mono text-sm normal-case tracking-normal text-ink-900">
              {certificate.certificate_number}
            </span>
          </p>
        </div>

        <div className="space-y-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ruby-700">Certificate of blood donation</p>
          <p className="text-sm text-ink-600">This certifies that</p>
          <h1 className="text-3xl font-extrabold leading-[1.2] tracking-tight text-ink-900 sm:text-5xl">
            {certificate.donor.full_name}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-[1.5] text-ink-700">
            donated {certificate.volume_ml} ml of whole blood ({certificate.blood_group}) at{' '}
            <span className="font-semibold text-ink-900">{certificate.centre_name}</span> on{' '}
            <span className="font-semibold text-ink-900">{formatDate(certificate.donated_on)}</span>, and was screened and
            found eligible on that date.
          </p>
        </div>

        <div className="grid gap-8 border-t border-ink-900/10 pt-8 md:grid-cols-2">
          <section aria-labelledby="screening-record" className="space-y-4">
            <h2 id="screening-record" className="text-xs font-semibold uppercase tracking-[0.16em] text-ruby-700">
              Screening record on the day
            </h2>
            <dl className="divide-y divide-ink-900/10 text-sm">
              <ScreeningRow label="Weight" value={`${certificate.screening.weight_kg} kg`} />
              <ScreeningRow label="Haemoglobin" value={`${certificate.screening.haemoglobin_g_dl} g/dL`} />
              <ScreeningRow label="Blood pressure" value={certificate.screening.blood_pressure} />
              <ScreeningRow label="Pulse" value={`${certificate.screening.pulse_bpm} bpm`} />
              <ScreeningRow label="Temperature" value={`${certificate.screening.temperature_c} C`} />
              <ScreeningRow label="Volume donated" value={`${certificate.volume_ml} ml`} />
            </dl>
          </section>

          <section aria-labelledby="eligibility-details" className="space-y-4">
            <h2 id="eligibility-details" className="text-xs font-semibold uppercase tracking-[0.16em] text-ruby-700">
              Eligibility
            </h2>
            <ul className="space-y-2 text-sm leading-[1.5] text-ink-700">
              {ELIGIBILITY_CRITERIA.map((criterion) => (
                <li key={criterion} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ruby-600" />
                  {criterion}
                </li>
              ))}
            </ul>
            <p className="rounded-xl bg-ink-900/[0.04] px-4 py-3 text-sm text-ink-800">
              Next eligible donation: <span className="font-semibold">{formatDate(certificate.next_eligible_on)}</span>
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-ink-900/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md space-y-2 text-xs leading-[1.5] text-ink-500">
            <p>
              Issued by Blood Bridge from the donation centre's screening record. This certificate confirms a donation and the
              screening values recorded on that day. It is not a medical certificate or a clinical diagnosis.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QrCode value={certificateUrl} size={120} className="ring-1 ring-ink-900/10" />
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Scan to verify this certificate</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function ScreeningRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-ink-600">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
