import { Quote } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const STORIES = [
  {
    quote: 'I registered after a friend needed urgent surgery. Two weeks later I got a message asking if I could help a patient in my city. It felt like the easiest thing I have ever done.',
    name: 'Amara J.',
    role: 'Regular donor',
    group: 'O+',
  },
  {
    quote: 'Finding O- blood at 2 a.m. felt impossible until we posted the request. Within the hour, three donors had called the hospital and my father was treated.',
    name: 'Daniel R.',
    role: 'Family of a patient',
    group: 'O-',
  },
  {
    quote: 'The eligibility checker gave me confidence to book my first donation. The staff at the centre were kind, and I now donate every few months.',
    name: 'Priya S.',
    role: 'First-time donor',
    group: 'A+',
  },
];

export function Testimonials() {
  return (
    <section id="stories" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeading eyebrow="Impact and stories" title="The people behind every drop" align="center" />

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {STORIES.map((story, index) => (
          <Reveal key={story.name} delay={index * 120}>
            <figure className="glass flex h-full flex-col gap-6 p-7 transition duration-300 hover:-translate-y-1 hover:border-ruby-500/30">
              <Quote className="h-8 w-8 text-ruby-500/70" aria-hidden />
              <blockquote className="flex-1 text-sm leading-[1.5] text-ink-300">&ldquo;{story.quote}&rdquo;</blockquote>
              <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <p className="text-sm font-bold text-ink-100">{story.name}</p>
                  <p className="text-xs text-ink-500">{story.role}</p>
                </div>
                <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-ruby-500/15 px-2.5 text-sm font-extrabold text-ruby-300 ring-1 ring-ruby-500/30">
                  {story.group}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
