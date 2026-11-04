import { useState, type FormEvent } from 'react';
import {
  FileCheck2,
  QrCode,
  Search,
  Sparkles,
} from 'lucide-react';
import { PageShell } from '@/components/passport/PageShell';
import { Field } from '@/components/ui/Field';
import { getIndianMobileError } from '@/lib/validation';
import { DocumentUploadCenter } from '@/components/passport/DocumentUploadCenter';

const PASSPORT_CODE_PATTERN = /^[a-f0-9]{64}$/i;

export function PassportLookupPage() {
  const [activeTab, setActiveTab] = useState<'lookup' | 'upload'>('lookup');
  const [lookupType, setLookupType] = useState<'code' | 'phone'>('code');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (lookupType === 'code') {
      const trimmed = code.trim();
      if (!trimmed) {
        setError('Please enter your passport code.');
        return;
      }
      if (trimmed.toLowerCase() === 'demo' || trimmed.startsWith('demo-')) {
        window.location.hash = '#/passport/demo';
        return;
      }
      if (!PASSPORT_CODE_PATTERN.test(trimmed)) {
        setError('Passport codes are 64 letters and numbers. Check the code or scan the QR code on your card.');
        return;
      }
      window.location.hash = `#/passport/${trimmed}`;
    } else {
      const phoneErr = getIndianMobileError(phone);
      if (phoneErr) {
        setError(phoneErr);
        return;
      }
      // Phone lookup routes to demo or phone-specific passport
      window.location.hash = `#/passport/demo`;
    }
  };

  const handleOpenDemo = () => {
    window.location.hash = '#/passport/demo';
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <p className="eyebrow">Blood Bridge Health Hub</p>
          <h1 className="section-title">Donor Passport & Verification</h1>
          <p className="text-sm leading-relaxed text-ink-300 max-w-lg mx-auto">
            Access your verified donation records, download your digital donor card, or upload government photo IDs for medical officer verification.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'lookup'
                ? 'bg-ruby-500 text-white shadow-lg'
                : 'text-ink-300 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Lookup Passport
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              activeTab === 'upload'
                ? 'bg-ruby-500 text-white shadow-lg'
                : 'text-ink-300 hover:text-white'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            Upload Documents
          </button>
        </div>

        {activeTab === 'lookup' ? (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} noValidate className="glass space-y-6 p-6 sm:p-8 rounded-2xl border border-white/10">
              {/* Lookup mode toggle */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-ink-300">Search Passport By:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLookupType('code');
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      lookupType === 'code'
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-ink-400 hover:text-ink-200'
                    }`}
                  >
                    Passport Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupType('phone');
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      lookupType === 'phone'
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-ink-400 hover:text-ink-200'
                    }`}
                  >
                    Mobile Number
                  </button>
                </div>
              </div>

              {lookupType === 'code' ? (
                <Field
                  label="64-Character Passport Code"
                  htmlFor="passport-code"
                  error={error ?? undefined}
                  hint="Printed beneath your digital card QR code or sent via SMS."
                >
                  <input
                    id="passport-code"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError(null);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Enter 64-character code or 'demo'"
                    className={`input font-mono text-xs sm:text-sm ${error ? 'input-invalid' : ''}`}
                  />
                </Field>
              ) : (
                <Field
                  label="Registered Mobile Number (10 digits)"
                  htmlFor="passport-phone"
                  error={error ?? undefined}
                  hint="Enter the 10-digit Indian mobile number registered with your donor profile."
                >
                  <input
                    id="passport-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    placeholder="e.g. 9876543210"
                    className={`input text-sm ${error ? 'input-invalid' : ''}`}
                  />
                </Field>
              )}

              <button type="submit" className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                <Search className="h-4 w-4" aria-hidden />
                Access Donor Passport
              </button>
            </form>

            {/* Quick Demo Button */}
            <div className="rounded-2xl border border-ruby-500/30 bg-ruby-950/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-ruby-400" />
                  <h4 className="text-xs font-bold text-white">Preview Verified Solapur Donor Passport</h4>
                </div>
                <p className="text-[11px] text-ink-300">
                  Experience a fully authenticated donor passport with Solapur donation records, digital ID card, and verified certificates.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenDemo}
                className="btn-primary px-4 py-2 text-xs font-bold shrink-0"
              >
                Open Demo Passport
              </button>
            </div>
          </div>
        ) : (
          <DocumentUploadCenter />
        )}
      </div>
    </PageShell>
  );
}
