import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, align = 'left', children }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-4">{title}</h2>
      {description && <p className="mt-4 text-base leading-[1.5] text-ink-300">{description}</p>}
      {children}
    </div>
  );
}
