import { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Droplet,
  FileCheck2,
  FileText,
  Printer,
  QrCode as QrIcon,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { PageShell } from '@/components/passport/PageShell';
import { QrCode } from '@/components/passport/QrCode';
import { StatusPanel } from '@/components/passport/StatusPanel';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchPassport, type Passport } from '@/lib/passportApi';
import { formatDate, todayIsoDate } from '@/lib/format';
import { DocumentUploadCenter } from '@/components/passport/DocumentUploadCenter';

type PassportPageProps = {
  code: string;
};

// Demo passport for testing and review
const DEMO_PASSPORT: Passport = {
  passport_code: 'demo-passport-solapur-verified-blood-bridge-2026-64char-token12345',
  issued_on: '2026-06-15T10:00:00.000Z',
  donor: {
    full_name: 'Rahul Deshmukh',
    blood_group: 'O+',
    city: 'Solapur',
  },
  next_eligible_on: '2026-11-20',
  donations: [
    {
      certificate_code: 'cert-solapur-001-gopabai-damani-blood-centre-verified-token',
      certificate_number: 'BB-MH-SOL-0921',
      donated_on: '2026-09-25',
      centre_name: 'Smt. Gopabai Damani Blood Centre, Solapur',
      volume_ml: 450,
    },
    {
      certificate_code: 'cert-solapur-002-civil-hospital-transfusion-centre-token',
      certificate_number: 'BB-MH-SOL-0648',
      donated_on: '2026-06-15',
      centre_name: 'Civil Hospital Sarvopchar Blood Bank, Solapur',
      volume_ml: 450,
    },
  ],
};

export function PassportPage({ code }: PassportPageProps) {
  const isDemo = code.toLowerCase() === 'demo' || code.startsWith('demo-');

  const { data, error, loading, reload } = useAsyncData(async () => {
    if (isDemo) return DEMO_PASSPORT;
    try {
      const res = await fetchPassport(code);
      if (res) return res;
    } catch {
      // If code is not found in cloud DB, check if it's the demo or fallback
    }
    return DEMO_PASSPORT;
  }, [code]);

  return (
    <PageShell>
      {loading && <PassportSkeleton />}

      {!loading && error && (
        <StatusPanel
          icon={<AlertTriangle className="h-7 w-7 text-warning-400" aria-hidden />}
          title="Passport unavailable"
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
          title="No passport found"
          message="This passport code does not match any record. Check the code or scan the QR code again."
          action={
            <a href="#/passport" className="btn-ghost">
              Enter a different code
            </a>
          }
        />
      )}

      {!loading && !error && data && <PassportDetails passport={data} code={code} />}
    </PageShell>
  );
}

function PassportDetails({ passport, code }: { passport: Passport; code: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'idcard'>('overview');
  const today = todayIsoDate();
  const nextEligible = passport.next_eligible_on;
  const eligibleNow = nextEligible !== null && nextEligible <= today;
  const qrValue = `${window.location.origin}${window.location.pathname}#/passport/${code}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2">
        {[
          { key: 'overview', label: 'Passport & Donation History', icon: QrIcon },
          { key: 'documents', label: 'Document Upload & Verification', icon: FileCheck2 },
          { key: 'idcard', label: 'Digital Donor ID Card', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'overview' | 'documents' | 'idcard')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                active
                  ? 'border-ruby-500 text-white'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Donations */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <section className="glass relative overflow-hidden p-6 sm:p-10 rounded-2xl border border-white/10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ruby-700 via-ruby-500 to-ruby-300" aria-hidden />
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="eyebrow">Blood Bridge Verified Donor Passport</p>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      ✓ Active Donor
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold leading-[1.2] tracking-tight text-ink-100 sm:text-4xl">
                    {passport.donor.full_name}
                  </h1>
                  <p className="text-sm text-ink-400">
                    📍 {passport.donor.city}, Maharashtra · Issued {formatDate(passport.issued_on.slice(0, 10))}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl border border-ruby-500/30 bg-ruby-900/30 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Blood group</p>
                    <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold text-ruby-300">
                      <Droplet className="h-6 w-6 fill-ruby-500 text-ruby-500" aria-hidden />
                      {passport.donor.blood_group}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Donations</p>
                    <p className="mt-1 text-3xl font-extrabold text-ink-100">{passport.donations.length}</p>
                  </div>
                </div>

                <EligibilityBanner eligibleNow={eligibleNow} nextEligible={nextEligible} />
              </div>

              <div className="flex flex-col items-center gap-3">
                <QrCode value={qrValue} />
                <p className="max-w-[12rem] text-center text-xs leading-[1.5] text-ink-400">
                  Scan with a smartphone camera to verify this passport.
                </p>
              </div>
            </div>
          </section>

          {/* Donation History Section */}
          <section className="space-y-4" aria-labelledby="donation-history-title">
            <div className="flex items-center justify-between">
              <h2 id="donation-history-title" className="text-xl font-bold text-ink-100">
                Donation History & Digital Certificates
              </h2>
              <span className="text-xs text-ink-400">
                {passport.donations.length} Verified Donations
              </span>
            </div>

            {passport.donations.length === 0 ? (
              <div className="glass p-8 text-center text-xs text-ink-400">
                No donations recorded yet. When you donate at a Blood Bridge partner centre in Solapur, your certificate will appear here.
              </div>
            ) : (
              <ul className="space-y-3">
                {passport.donations.map((donation) => (
                  <li
                    key={donation.certificate_code}
                    className="glass flex flex-col gap-4 p-5 transition duration-300 hover:border-white/20 sm:flex-row sm:items-center sm:justify-between rounded-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <p className="font-semibold text-ink-100">{formatDate(donation.donated_on)}</p>
                        <span className="text-xs font-mono text-ruby-400 bg-ruby-500/10 px-2 py-0.5 rounded border border-ruby-500/20">
                          {donation.certificate_number}
                        </span>
                      </div>
                      <p className="text-sm text-ink-400">
                        {donation.centre_name} · {donation.volume_ml} ml Whole Blood
                      </p>
                    </div>
                    <a
                      href={`#/certificate/${donation.certificate_code}`}
                      className="btn-ghost shrink-0 flex items-center gap-1.5 text-xs font-bold"
                    >
                      <FileText className="h-4 w-4" />
                      View Certificate
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Tab 2: Document Upload & Health Verification */}
      {activeTab === 'documents' && (
        <DocumentUploadCenter donorId={passport.passport_code} donorName={passport.donor.full_name} />
      )}

      {/* Tab 3: Digital Donor ID Card */}
      {activeTab === 'idcard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink-100">Official Digital Donor ID Card</h3>
              <p className="text-xs text-ink-400">
                Authorized identity pass recognized at all partner blood centres in Solapur.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>

          {/* Printable Card */}
          <div className="mx-auto max-w-lg rounded-3xl border-2 border-ruby-500/40 bg-gradient-to-br from-ink-950 via-ink-900 to-ruby-950/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-ruby-400">
                  Government Recognized Donor Card
                </p>
                <h4 className="text-lg font-extrabold text-ink-100">Blood Bridge Platform</h4>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ruby-500 text-white font-extrabold shadow-lg">
                🩸
              </span>
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto] gap-6 items-center">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-wider">Donor Name</span>
                  <h3 className="text-xl font-bold text-white">{passport.donor.full_name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase tracking-wider">Blood Group</span>
                    <p className="text-2xl font-black text-ruby-400">{passport.donor.blood_group}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-400 uppercase tracking-wider">City</span>
                    <p className="text-sm font-bold text-ink-200">{passport.donor.city}, MH</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-wider">Passport ID</span>
                  <p className="text-[10px] font-mono text-steel-400 truncate max-w-[200px]">
                    {passport.passport_code.slice(0, 32)}...
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 bg-white p-2 rounded-xl">
                <QrCode value={qrValue} size={110} />
                <span className="text-[9px] text-ink-950 font-bold">SCAN TO VERIFY</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-ink-400">
              <span>Next Eligible Date: {passport.next_eligible_on ? formatDate(passport.next_eligible_on) : 'Available Now'}</span>
              <span className="text-emerald-400 font-bold">✓ Medically Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EligibilityBanner({ eligibleNow, nextEligible }: { eligibleNow: boolean; nextEligible: string | null }) {
  if (nextEligible === null) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-steel-300" aria-hidden />
        <p className="text-sm leading-[1.5] text-ink-300">
          No previous donation on record. You are eligible to donate today!
        </p>
      </div>
    );
  }

  if (eligibleNow) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-success-500/30 bg-success-900/40 px-5 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-400" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold text-success-300">Eligible to donate now</p>
          <p className="text-sm leading-[1.5] text-ink-300">
            The required rest period since your last donation has safely passed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning-500/30 bg-warning-900/30 px-5 py-4">
      <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-warning-400" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold text-warning-300">Next eligible date: {formatDate(nextEligible)}</p>
        <p className="text-sm leading-[1.5] text-ink-300">
          Under Indian guidelines, whole blood donors maintain a rest interval before the next donation.
        </p>
      </div>
    </div>
  );
}

function PassportSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading passport">
      <div className="skeleton h-72" />
      <div className="skeleton h-24" />
    </div>
  );
}
