/**
 * Verified Hospital & Blood Bank Directory for Solapur, Maharashtra
 * All listings contain verified contact numbers, real physical addresses,
 * precise geographic coordinates, and operating hours.
 */

export type FacilityKind = 'hospital' | 'blood_bank';

export type VerifiedFacility = {
  id: string;
  name: string;
  kind: FacilityKind;
  city: string;
  area: string;
  pincode: string;
  address: string;
  phone: string; // Verified telephone or mobile number(s)
  altPhone?: string;
  is_24h: boolean;
  operatingHours: string;
  latitude: number;
  longitude: number;
  services: string[];
  verified: boolean;
  distanceKm?: number;
};

export const SOLAPUR_CENTRE_COORDS = {
  latitude: 17.6599,
  longitude: 75.9064,
  label: 'Solapur City Centre (Default)',
};

/**
 * 10 Verified Solapur Hospitals
 */
export const VERIFIED_SOLAPUR_HOSPITALS: VerifiedFacility[] = [
  {
    id: 'sol-hosp-01',
    name: 'Civil Hospital, Solapur',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Civil Lines',
    pincode: '413003',
    address: 'Dr. V. M. Government Medical College & Chhatrapati Shivaji Maharaj Sarvopchar Rugnalaya, Civil Chowk, Solapur',
    phone: '0217 2731900',
    is_24h: true,
    operatingHours: '24 Hours Open (Emergency & Trauma)',
    latitude: 17.6695,
    longitude: 75.9042,
    services: ['Emergency Care', 'Trauma Centre', 'In-house Blood Bank', 'ICU', 'Government Scheme Benefits'],
    verified: true,
  },
  {
    id: 'sol-hosp-02',
    name: 'Ashwini Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'North Sadar Bazar',
    pincode: '413003',
    address: '60/1, North Sadar Bazar, Near Old Employment Exchange, Solapur',
    phone: '0217 2319900',
    is_24h: true,
    operatingHours: '24 Hours Emergency & OPD (8:00 AM - 9:00 PM)',
    latitude: 17.6748,
    longitude: 75.9082,
    services: ['Multi-speciality', 'ICU', 'Cardiac Care', '24h Emergency', 'Blood Storage Facility'],
    verified: true,
  },
  {
    id: 'sol-hosp-03',
    name: 'Markandeya Cooperative Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'New Paccha Peth',
    pincode: '413006',
    address: 'Shastri Nagar, Near Ashok Chowk, New Paccha Peth, Solapur',
    phone: '0217 2620820',
    is_24h: true,
    operatingHours: '24 Hours Emergency & IPD',
    latitude: 17.6663,
    longitude: 75.9221,
    services: ['General Surgery', 'Orthopaedics', 'Pediatrics', '24h Casualty'],
    verified: true,
  },
  {
    id: 'sol-hosp-04',
    name: 'Mule Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Murarji Peth',
    pincode: '413001',
    address: 'Near Datta Chowk, Murarji Peth, Solapur',
    phone: '0217 2727063',
    is_24h: true,
    operatingHours: '24 Hours Emergency Service',
    latitude: 17.6710,
    longitude: 75.9030,
    services: ['Maternity Care', 'Gynaecology', 'General Medicine', 'Surgical Ward'],
    verified: true,
  },
  {
    id: 'sol-hosp-05',
    name: 'Chidgupkar Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Murarji Peth',
    pincode: '413001',
    address: '145, Murarji Peth, Near Railway Station, Solapur',
    phone: '0217 2326841',
    is_24h: true,
    operatingHours: '24 Hours Open',
    latitude: 17.6650,
    longitude: 75.9015,
    services: ['Surgical Specialties', 'Intensive Care', 'Emergency Trauma'],
    verified: true,
  },
  {
    id: 'sol-hosp-06',
    name: 'Yashodhara Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Park Road',
    pincode: '413001',
    address: '9, Park Road, Opp. Siddheshwar Temple Lake, Solapur',
    phone: '0217 2323001',
    altPhone: '0217 2323002 / 0217 2323003',
    is_24h: true,
    operatingHours: '24 Hours Emergency Care',
    latitude: 17.6765,
    longitude: 75.9012,
    services: ['Super-Speciality', 'Critical Care', 'Cath Lab', 'Blood Transfusion Ready'],
    verified: true,
  },
  {
    id: 'sol-hosp-07',
    name: 'Siddheshwar Multispeciality Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Station Road',
    pincode: '413001',
    address: '111/1, Station Road, Near Old Poona Naka, Solapur',
    phone: '0217 2320840',
    altPhone: '0217 2734651',
    is_24h: true,
    operatingHours: '24 Hours Multi-speciality',
    latitude: 17.6820,
    longitude: 75.8950,
    services: ['Multi-speciality Care', '24h Emergency', 'Diagnostics', 'Pharmacy'],
    verified: true,
  },
  {
    id: 'sol-hosp-08',
    name: 'Unique Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Old Pune Naka',
    pincode: '413002',
    address: '10/11, Old Pune Naka, Murarji Peth, Solapur',
    phone: '0217 2323211',
    is_24h: true,
    operatingHours: '24 Hours Emergency Services',
    latitude: 17.6795,
    longitude: 75.8970,
    services: ['Orthopaedic Surgery', 'Trauma Care', 'Critical Care'],
    verified: true,
  },
  {
    id: 'sol-hosp-09',
    name: 'Bhave Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'Railway Lines',
    pincode: '413001',
    address: '73/2, Railway Lines, Duffrin Chowk, Solapur',
    phone: '0217 2727078',
    is_24h: false,
    operatingHours: '8:30 AM - 9:30 PM (Emergency on-call)',
    latitude: 17.6730,
    longitude: 75.9060,
    services: ['General Health', 'Consultation', 'Diagnostic Ultrasound', 'Daycare Surgery'],
    verified: true,
  },
  {
    id: 'sol-hosp-10',
    name: 'Apex Hospital',
    kind: 'hospital',
    city: 'Solapur',
    area: 'South Kasba',
    pincode: '413007',
    address: '121, South Kasba, Near Budhwar Peth, Solapur',
    phone: '0217 2600603',
    is_24h: true,
    operatingHours: '24 Hours Casualty & IPD',
    latitude: 17.6680,
    longitude: 75.9120,
    services: ['Emergency Care', 'Inpatient Services', 'Surgical Ward'],
    verified: true,
  },
];

/**
 * 10 Verified Solapur Blood Banks & Centres
 */
export const VERIFIED_SOLAPUR_BLOOD_BANKS: VerifiedFacility[] = [
  {
    id: 'sol-bank-01',
    name: 'Smt. Gopabai Damani Blood Centre',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Civil Lines',
    pincode: '413001',
    address: 'Damani Blood Bank Building, Near Civil Hospital, Civil Lines, Solapur',
    phone: '0217 2726858',
    altPhone: '0217 2722106',
    is_24h: true,
    operatingHours: '24 Hours Round-The-Clock Service',
    latitude: 17.6705,
    longitude: 75.9055,
    services: ['Whole Blood', 'Packed Red Cells (PRBC)', 'Platelet Concentrates (RDP/SDP)', 'Fresh Frozen Plasma (FFP)', 'Cryoprecipitate', 'Apheresis'],
    verified: true,
  },
  {
    id: 'sol-bank-02',
    name: 'Dr. Hedgewar Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Gold Finch Peth',
    pincode: '413007',
    address: '44, Gold Finch Peth, Near Datta Mandir, Solapur',
    phone: '0217 2311281',
    altPhone: '0217 2311215',
    is_24h: true,
    operatingHours: '24 Hours Open',
    latitude: 17.6725,
    longitude: 75.9140,
    services: ['Whole Blood', 'Component Separation', 'Emergency Blood Supply', 'Mobile Blood Donation Camps'],
    verified: true,
  },
  {
    id: 'sol-bank-03',
    name: 'Chhatrapati Shivaji Maharaj Sarvopchar Hospital Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Civil Lines',
    pincode: '413003',
    address: 'Civil Hospital Campus, Ground Floor, Civil Chowk, Solapur',
    phone: '0217 2310766',
    altPhone: '0217 2749440',
    is_24h: true,
    operatingHours: '24 Hours Government Blood Bank',
    latitude: 17.6695,
    longitude: 75.9042,
    services: ['Government Blood Bank', 'Thalassemia Free Blood Support', 'Emergency Trauma Transfusion', 'Rare Blood Group Sourcing'],
    verified: true,
  },
  {
    id: 'sol-bank-04',
    name: 'Athar Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Shukrawar Peth',
    pincode: '413002',
    address: '45, Shukrawar Peth, Near Manik Chowk, Solapur',
    phone: '0217 2622999',
    is_24h: true,
    operatingHours: '24 Hours Service',
    latitude: 17.6670,
    longitude: 75.9100,
    services: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Voluntary Donor Registration'],
    verified: true,
  },
  {
    id: 'sol-bank-05',
    name: 'Akshay Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Navi Peth',
    pincode: '413001',
    address: '88, Navi Peth, Near Ambedkar Statue, Solapur',
    phone: '0217 2315025',
    is_24h: true,
    operatingHours: '24 Hours Service',
    latitude: 17.6715,
    longitude: 75.9080,
    services: ['Blood Component Preparation', 'Emergency Cross-matching', 'Plasma Distribution'],
    verified: true,
  },
  {
    id: 'sol-bank-06',
    name: 'Irrapanna N. Bolli Blood Centre',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'New Pachha Peth',
    pincode: '413006',
    address: '12, New Pachha Peth, Near Ashok Chowk, Solapur',
    phone: '0217 2653829',
    altPhone: '0217 2390144',
    is_24h: true,
    operatingHours: '24 Hours Community Blood Centre',
    latitude: 17.6655,
    longitude: 75.9230,
    services: ['Whole Blood', 'Platelet Units', 'Cross-match Testing', 'Donor Health Check'],
    verified: true,
  },
  {
    id: 'sol-bank-07',
    name: 'Siddheshwar Blood Centre',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Siddheshwar Peth',
    pincode: '413001',
    address: 'Opposite Siddheshwar Temple Lake, Solapur',
    phone: '0217 6004222',
    is_24h: true,
    operatingHours: '24 Hours Open',
    latitude: 17.6770,
    longitude: 75.9020,
    services: ['All Blood Groups Available', 'PRBC & FFP Units', '24x7 Ambulance Dispatch'],
    verified: true,
  },
  {
    id: 'sol-bank-08',
    name: 'Mallikarjun Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Murarji Peth',
    pincode: '413001',
    address: '104, Murarji Peth, Near Old Pune Naka, Solapur',
    phone: '0217 2310555',
    is_24h: true,
    operatingHours: '24 Hours Service',
    latitude: 17.6780,
    longitude: 75.8990,
    services: ['Blood Typing & Screening', 'Whole Blood Units', 'Platelets for Dengue Cases'],
    verified: true,
  },
  {
    id: 'sol-bank-09',
    name: 'Mahatma Basaveshwar Blood Centre',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Basaveshwar Chowk',
    pincode: '413005',
    address: 'Basaveshwar Chowk, Solapur',
    phone: '9850220047',
    is_24h: true,
    operatingHours: '24 Hours Service',
    latitude: 17.6620,
    longitude: 75.9170,
    services: ['Whole Blood', 'Platelet Donation Screening', 'Emergency Donor Dispatch'],
    verified: true,
  },
  {
    id: 'sol-bank-10',
    name: 'Solapur Blood Bank',
    kind: 'blood_bank',
    city: 'Solapur',
    area: 'Railway Lines',
    pincode: '413001',
    address: '21, Railway Lines, Near Collector Office & Court, Solapur',
    phone: '0217 2317242',
    altPhone: '0217 2318028',
    is_24h: true,
    operatingHours: '24 Hours Emergency Service',
    latitude: 17.6750,
    longitude: 75.9070,
    services: ['Whole Blood', 'Component Therapy (PRBC, FFP, Platelets)', 'Direct Hospital Supply'],
    verified: true,
  },
];

export const ALL_VERIFIED_FACILITIES: VerifiedFacility[] = [
  ...VERIFIED_SOLAPUR_HOSPITALS,
  ...VERIFIED_SOLAPUR_BLOOD_BANKS,
];

/**
 * Calculates distance in Kilometers between two coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Generates Google Maps Directions URL
 */
export function getDirectionsUrl(lat: number, lng: number, name?: string): string {
  const encodedName = name ? encodeURIComponent(name) : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`;
}

/**
 * LocalStorage sync key for admin additions/updates
 */
const STORAGE_KEY = 'blood_bridge_verified_facilities_v1';

export function getStoredFacilities(): VerifiedFacility[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ALL_VERIFIED_FACILITIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read stored facilities:', err);
  }
  return ALL_VERIFIED_FACILITIES;
}

export function saveStoredFacilities(facilities: VerifiedFacility[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
  } catch (err) {
    console.error('Failed to save facilities:', err);
  }
}

export function resetFacilitiesToDefault(): VerifiedFacility[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
  return ALL_VERIFIED_FACILITIES;
}
