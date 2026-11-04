import { ClipboardList, HeartHandshake, Search, UserPlus, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'steel' | 'ruby';
};

const STEPS: Step[] = [
  {
    title: 'Register',
    description: 'Sign up as a donor or share your blood group and city.',
    icon: UserPlus,
    tone: 'steel',
  },
  {
    title: 'Search',
    description: 'Find compatible donors or banks near the patient.',
    icon: Search,
    tone: 'ruby',
  },
  {
    title: 'Request or donate',
    description: 'Post an urgent request or confirm you can give blood.',
    icon: ClipboardList,
    tone: 'ruby',
  },
  {
    title: 'Connect and save',
    description: 'Reach out directly, meet the donor and save a life.',
    icon: HeartHandshake,
    tone: 'steel',
  },
];

const TONE_CLASSES: Record<Step['tone'], { ring: string; icon: string }> = {
  steel: {
    ring: 'border-steel-500/50 bg-steel-700/40 shadow-[0_0_24px_rgba(154,163,174,0.15)]',
    icon: 'text-steel-300',
  },
  ruby: {
    ring: 'border-ruby-500/60 bg-ruby-700/40 shadow-[0_0_28px_rgba(224,49,63,0.35)]',
    icon: 'text-ruby-300',
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeading eyebrow="How it works" title="Simple steps to saving lives" align="center" />

      <div className="relative mt-16 grid gap-12 md:grid-cols-4 md:gap-6">
        <div
          aria-hidden="true"
          className="absolute left-[12%] right-[12%] top-9 hidden h-px bg-gradient-to-r from-steel-500/40 via-ruby-500 to-steel-500/40 md:block"
        />

        {STEPS.map((step, index) => {
          const tone = TONE_CLASSES[step.tone];
          const Icon = step.icon;
          return (
            <Reveal key={step.title} delay={index * 120} className="relative flex flex-col items-center text-center">
              <div className={`relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full border ${tone.ring}`}>
                <Icon className={`h-7 w-7 ${tone.icon}`} aria-hidden />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-xs font-extrabold text-ink-950">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-ink-100">{step.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-[1.5] text-ink-400">{step.description}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
