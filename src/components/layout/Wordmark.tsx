import { Droplet } from 'lucide-react';

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight ${className}`}>
      <Droplet className="h-5 w-5 fill-ruby-500 text-ruby-500" aria-hidden />
      <span className="text-ink-100">BLOOD</span>
      <span className="text-ruby-500">BRIDGE</span>
    </span>
  );
}
