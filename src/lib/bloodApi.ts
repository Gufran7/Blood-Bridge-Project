import { supabase } from '@/lib/supabase';
import { CAN_RECEIVE_FROM, type BloodGroup } from '@/lib/bloodGroups';
import { getIndianMobileError } from '@/lib/validation';

export type DonorFilter = {
  bloodGroup: BloodGroup | null;
  city: string;
  availableOnly: boolean;
};

export type Donor = {
  id: string;
  full_name: string;
  blood_group: BloodGroup;
  city: string;
  phone: string;
  last_donated_on: string | null;
  is_available: boolean;
};

export type UrgencyLevel = 'critical' | 'urgent' | 'planned';

export type BloodRequestSummary = {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital: string;
  city: string;
  urgency: UrgencyLevel;
  created_at: string;
};

export type BloodBank = {
  id: string;
  name: string;
  kind: 'blood_bank' | 'hospital';
  city: string;
  address: string;
  phone: string;
  is_24h: boolean;
};

export type SiteStats = {
  donors: number;
  requests: number;
  activeRequests: number;
  centres: number;
};

export type NewDonorInput = {
  full_name: string;
  blood_group: BloodGroup;
  city: string;
  phone: string;
  email: string | null;
  last_donated_on: string | null;
};

export type NewBloodRequestInput = {
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital: string;
  city: string;
  contact_name: string;
  contact_phone: string;
  urgency: UrgencyLevel;
  notes: string | null;
};

const DONOR_COLUMNS = 'id, full_name, blood_group, city, phone, last_donated_on, is_available';
const REQUEST_SUMMARY_COLUMNS = 'id, patient_name, blood_group, units_needed, hospital, city, urgency, created_at';
const BLOOD_BANK_COLUMNS = 'id, name, kind, city, address, phone, is_24h';

export async function searchDonors(filter: DonorFilter): Promise<Donor[]> {
  let query = supabase
    .from('donors')
    .select(DONOR_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(60);

  if (filter.bloodGroup) query = query.eq('blood_group', filter.bloodGroup);
  if (filter.city.trim()) query = query.ilike('city', `%${filter.city.trim()}%`);
  if (filter.availableOnly) query = query.eq('is_available', true);

  const { data, error } = await query;
  if (error) {
    console.error('searchDonors failed', error);
    throw new Error('We could not load donors right now.');
  }
  return (data ?? []) as Donor[];
}

export async function countCompatibleDonors(bloodGroup: BloodGroup, city: string): Promise<number> {
  const { count, error } = await supabase
    .from('donors')
    .select('id', { count: 'exact', head: true })
    .in('blood_group', CAN_RECEIVE_FROM[bloodGroup])
    .eq('is_available', true)
    .ilike('city', `%${city.trim()}%`);

  if (error) {
    console.error('countCompatibleDonors failed', error);
    throw new Error('We could not check matching donors.');
  }
  return count ?? 0;
}

export async function createDonor(input: NewDonorInput): Promise<void> {
  const phoneError = getIndianMobileError(input.phone);
  if (phoneError) {
    throw new Error(`Invalid phone: ${phoneError}`);
  }
  const { error } = await supabase.from('donors').insert({ ...input, is_available: true });
  if (error) {
    console.error('createDonor failed', error);
    throw new Error('Your details could not be saved. Please try again.');
  }
}

export async function createBloodRequest(input: NewBloodRequestInput): Promise<void> {
  const phoneError = getIndianMobileError(input.contact_phone);
  if (phoneError) {
    throw new Error(`Invalid contact phone: ${phoneError}`);
  }
  const { error } = await supabase.from('blood_requests').insert({ ...input, status: 'open' });
  if (error) {
    console.error('createBloodRequest failed', error);
    throw new Error('Your request could not be posted. Please try again.');
  }
}

export async function fetchRecentRequests(limit = 6): Promise<BloodRequestSummary[]> {
  const { data, error } = await supabase
    .from('blood_requests')
    .select(REQUEST_SUMMARY_COLUMNS)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRecentRequests failed', error);
    throw new Error('We could not load requests right now.');
  }
  return (data ?? []) as BloodRequestSummary[];
}

export async function fetchBloodBanks(): Promise<BloodBank[]> {
  const { data, error } = await supabase
    .from('blood_banks')
    .select(BLOOD_BANK_COLUMNS)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchBloodBanks failed', error);
    throw new Error('We could not load blood banks right now.');
  }
  return (data ?? []) as BloodBank[];
}

async function countRows(build: () => PromiseLike<{ count: number | null; error: unknown }>): Promise<number> {
  const { count, error } = await build();
  if (error) throw error;
  return count ?? 0;
}

export async function fetchSiteStats(): Promise<SiteStats> {
  try {
    const [donors, requests, activeRequests, centres] = await Promise.all([
      countRows(() => supabase.from('donors').select('id', { count: 'exact', head: true })),
      countRows(() => supabase.from('blood_requests').select('id', { count: 'exact', head: true })),
      countRows(() =>
        supabase.from('blood_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ),
      countRows(() => supabase.from('blood_banks').select('id', { count: 'exact', head: true })),
    ]);
    return { donors, requests, activeRequests, centres };
  } catch (error) {
    console.error('fetchSiteStats failed', error);
    throw new Error('Live stats are unavailable right now.');
  }
}
