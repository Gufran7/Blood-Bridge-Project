import { supabase } from '@/lib/supabase';
import type { Donor } from '@/lib/bloodApi';
import type { BloodGroup } from '@/lib/bloodGroups';

export type PassportDonation = {
  certificate_code: string;
  certificate_number: string;
  donated_on: string;
  centre_name: string;
  volume_ml: number;
};

export type Passport = {
  passport_code: string;
  issued_on: string;
  donor: { full_name: string; blood_group: BloodGroup; city: string };
  next_eligible_on: string | null;
  donations: PassportDonation[];
};

export type Certificate = {
  certificate_number: string;
  donated_on: string;
  next_eligible_on: string;
  centre_name: string;
  volume_ml: number;
  blood_group: BloodGroup;
  passport_code: string;
  donor: { full_name: string; city: string };
  screening: {
    weight_kg: number;
    haemoglobin_g_dl: number;
    blood_pressure: string;
    pulse_bpm: number;
    temperature_c: number;
  };
};

export type RecordDonationInput = {
  staffCode: string;
  donorId: string;
  centreName: string;
  volumeMl: number;
  weightKg: number;
  haemoglobinGdl: number;
  systolic: number;
  diastolic: number;
  pulseBpm: number;
  temperatureC: number;
};

export type RecordedDonation = {
  passportCode: string;
  certificateCode: string;
  certificateNumber: string;
  donatedOn: string;
  nextEligibleOn: string;
};

export type RecordDonationResult =
  | { ok: true; donation: RecordedDonation }
  | { ok: false; message: string; reasons: string[] };

const LOAD_ERROR = 'We could not load this record. Please try again.';
const DONOR_COLUMNS = 'id, full_name, blood_group, city, phone, last_donated_on, is_available';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPassport(value: unknown): value is Passport {
  return (
    isRecord(value) &&
    typeof value.passport_code === 'string' &&
    isRecord(value.donor) &&
    typeof value.donor.full_name === 'string' &&
    Array.isArray(value.donations)
  );
}

function isCertificate(value: unknown): value is Certificate {
  return (
    isRecord(value) &&
    typeof value.certificate_number === 'string' &&
    typeof value.donated_on === 'string' &&
    isRecord(value.donor) &&
    isRecord(value.screening)
  );
}

export async function fetchPassport(code: string): Promise<Passport | null> {
  const { data, error } = await supabase.rpc('get_passport', { p_code: code });
  if (error) {
    console.error('get_passport failed', error);
    throw new Error(LOAD_ERROR);
  }
  if (data === null) return null;
  if (!isPassport(data)) throw new Error(LOAD_ERROR);
  return data;
}

export async function fetchCertificate(code: string): Promise<Certificate | null> {
  const { data, error } = await supabase.rpc('get_certificate', { p_code: code });
  if (error) {
    console.error('get_certificate failed', error);
    throw new Error(LOAD_ERROR);
  }
  if (data === null) return null;
  if (!isCertificate(data)) throw new Error(LOAD_ERROR);
  return data;
}

export async function findDonorsByPhone(phone: string): Promise<Donor[]> {
  const { data, error } = await supabase
    .from('donors')
    .select(DONOR_COLUMNS)
    .eq('phone', phone.trim())
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) {
    console.error('donor lookup failed', error);
    throw new Error('Donors could not be searched right now. Please try again.');
  }
  return (data ?? []) as Donor[];
}

function isRecordedDonation(value: unknown): value is RecordedDonation {
  return (
    isRecord(value) &&
    typeof value.passportCode === 'string' &&
    typeof value.certificateCode === 'string' &&
    typeof value.certificateNumber === 'string' &&
    typeof value.donatedOn === 'string' &&
    typeof value.nextEligibleOn === 'string'
  );
}

export async function fetchQrCodeUrl(value: string, size: number, signal: AbortSignal): Promise<string> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${baseUrl}/functions/v1/qr-code`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, size }),
    signal,
  });
  if (!response.ok) throw new Error('QR code could not be created.');

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function recordDonation(input: RecordDonationInput): Promise<RecordDonationResult> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/functions/v1/record-donation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, message: 'Network problem. Check your connection and try again.', reasons: [] };
  }

  const body: unknown = await response.json().catch(() => null);
  const errorMessage =
    isRecord(body) && typeof body.error === 'string' ? body.error : 'The donation could not be recorded.';
  const reasons = isRecord(body) && Array.isArray(body.reasons) ? body.reasons.filter((r): r is string => typeof r === 'string') : [];

  if (!response.ok) return { ok: false, message: errorMessage, reasons };
  if (!isRecordedDonation(body)) {
    return { ok: false, message: 'The donation may have been saved, but the confirmation was unreadable. Check the donor passport before recording again.', reasons: [] };
  }
  return { ok: true, donation: body };
}
