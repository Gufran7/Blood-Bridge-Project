import { HeartPulse, Route, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const VALUES: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Built for emergencies',
    description: 'Every screen is designed to get a patient the information they need in seconds, not minutes.',
    icon: Zap,
  },
  {
    title: 'Matched by compatibility',
    description: 'Searches follow real blood compatibility rules, so donors and patients are connected with care.',
    icon: Route,
  },
  {
    title: 'Respectful by default',
    description: 'Donors choose to join and agree before anyone contacts them about a request.',
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    question: 'Who can donate blood under Indian guidelines?',
    answer:
      'Healthy adults between 18 and 65 years who weigh at least 50 kg and have a haemoglobin level of at least 12.5 g/dL can donate. Vital signs including blood pressure and hemoglobin are checked free of charge at all certified blood centres.',
  },
  {
    question: 'Why is a 10-digit Indian mobile number required?',
    answer:
      'To prevent spam and ensure rapid coordination during life-or-death emergencies, Blood Bridge verifies valid 10-digit Indian mobile numbers (starting with 6, 7, 8, or 9). Special characters and country codes should be omitted.',
  },
  {
    question: 'How do I find nearby hospitals and blood banks in Solapur?',
    answer:
      'Use the "Nearby Hospitals & Blood Banks" section. Click "Use My GPS Location" to instantly calculate real-time distances, or select local landmarks like Civil Hospital Chowk, Ashok Chowk, or Murarji Peth. You can call centres directly or get Google Maps turn-by-turn directions.',
  },
  {
    question: 'How do document uploads and donor verification work?',
    answer:
      'In the Donor Passport Hub, you can securely upload a clear photo or PDF of your Government ID (Aadhaar, Voter ID, Driving License) and Blood Group Report. Registered medical officers review and verify your records to grant you a verified donor badge.',
  },
  {
    question: 'How often can I donate whole blood?',
    answer:
      'Under Indian National Blood Transfusion Council (NBTC) guidelines, men can donate whole blood every 90 days (3 months) and women every 120 days (4 months) to allow full replenishment of red cell mass and iron stores.',
  },
  {
    question: 'What should I do in a life-threatening medical emergency?',
    answer:
      'Always dial the national emergency number 112 or 108 first, or proceed directly to Solapur Civil Hospital casualty (0217 2731900). Blood Bridge aids in voluntary donor matching but does not replace emergency medical response.',
  },
];

export function AboutFaq() {
  return (
    <section id="faq" className="relative scroll-mt-24 border-t border-white/10 bg-ink-900/40">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="space-y-12">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="About Blood Bridge"
              title="Our mission is shorter waits for every patient"
              description="Blood Bridge exists to make blood easier to find. We connect people who want to give with the patients and hospitals who need it, quickly and clearly."
            />
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-steel-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <HeartPulse className="h-3.5 w-3.5 text-ruby-400" aria-hidden />
                Donors
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <HeartPulse className="h-3.5 w-3.5 text-ruby-400" aria-hidden />
                Patients
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <HeartPulse className="h-3.5 w-3.5 text-ruby-400" aria-hidden />
                Hospitals
              </span>
            </div>
          </div>

          <ul className="space-y-4">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <li key={value.title} className="glass flex gap-5 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
                    <Icon className="h-5 w-5 text-ruby-300" aria-hidden />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-ink-100">{value.title}</h3>
                    <p className="text-sm leading-[1.5] text-ink-400">{value.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="eyebrow">Common questions</p>
            <h3 className="text-2xl font-extrabold tracking-tight text-ink-100">Frequently asked questions</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group glass overflow-hidden transition duration-300 open:border-ruby-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-ink-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ruby-400 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-ruby-300 transition duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-sm leading-[1.5] text-ink-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
