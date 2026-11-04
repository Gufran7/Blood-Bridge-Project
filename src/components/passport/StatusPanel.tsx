import type { ReactNode } from 'react';

type StatusPanelProps = {
  icon: ReactNode;
  title: string;
  message: string;
  action: ReactNode;
};

export function StatusPanel({ icon, title, message, action }: StatusPanelProps) {
  return (
    <div className="glass mx-auto flex max-w-lg flex-col items-center gap-5 p-10 text-center">
      {icon}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-ink-100">{title}</h1>
        <p className="text-sm leading-[1.5] text-ink-400">{message}</p>
      </div>
      {action}
    </div>
  );
}
