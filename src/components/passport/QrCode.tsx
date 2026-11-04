import { useEffect, useState } from 'react';
import { fetchQrCodeUrl } from '@/lib/passportApi';

type QrCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

export function QrCode({ value, size = 168, className = '' }: QrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setSrc(null);
    setFailed(false);

    fetchQrCodeUrl(value, size, controller.signal)
      .then((url) => {
        if (controller.signal.aborted) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [value, size]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-white p-4 text-center text-xs text-ink-600 ${className}`}
        style={{ width: size, height: size }}
      >
        QR code unavailable
      </div>
    );
  }

  if (!src) {
    return <div className={`skeleton rounded-xl ${className}`} style={{ width: size, height: size }} aria-hidden />;
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code that opens this record"
      className={`rounded-xl bg-white p-2 ${className}`}
    />
  );
}
