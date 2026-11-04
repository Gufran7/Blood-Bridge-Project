/*
# Create Blood Bridge core schema

1. New Tables
- `donors`: people who have signed up to give blood. Stores name, blood group, city, phone, optional email, last donation date and whether they are currently available.
- `blood_requests`: urgent requests posted by patients or their families. Stores patient name, blood group needed, units, hospital, city, contact phone, urgency level and status.
- `blood_banks`: directory of blood banks and hospitals shown on the site (name, city, address, phone, type, 24-hour flag).

2. Security
- Row level security is enabled on all three tables.
- The site has no sign-in, so visitors use the anon role.
- `donors` and `blood_requests`: anon can read and insert only. No updates or deletes from the site.
- `blood_banks`: anon can read only. Entries are managed from the database.
- Column-level constraints restrict blood groups to the eight valid values and keep text fields within sensible lengths.

3. Notes
- Indexes on blood group and city support fast donor search.
- Sample blood bank entries are seeded so the directory is not empty on first load. Replace them with real centres later.
*/

CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 80),
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 60),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  email text CHECK (email IS NULL OR char_length(email) <= 120),
  last_donated_on date,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donors_blood_group_city_idx ON donors (blood_group, city);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON donors TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_donors" ON donors;
CREATE POLICY "anon_select_donors" ON donors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_donors" ON donors;
CREATE POLICY "anon_insert_donors" ON donors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL CHECK (char_length(patient_name) BETWEEN 2 AND 80),
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units_needed integer NOT NULL CHECK (units_needed BETWEEN 1 AND 20),
  hospital text NOT NULL CHECK (char_length(hospital) BETWEEN 2 AND 120),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 60),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 80),
  contact_phone text NOT NULL CHECK (char_length(contact_phone) BETWEEN 7 AND 20),
  urgency text NOT NULL DEFAULT 'urgent' CHECK (urgency IN ('critical','urgent','planned')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','fulfilled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blood_requests_blood_group_status_idx ON blood_requests (blood_group, status);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON blood_requests TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_blood_requests" ON blood_requests;
CREATE POLICY "anon_select_blood_requests" ON blood_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blood_requests" ON blood_requests;
CREATE POLICY "anon_insert_blood_requests" ON blood_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blood_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('blood_bank','hospital')),
  city text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  is_24h boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blood_banks ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON blood_banks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_blood_banks" ON blood_banks;
CREATE POLICY "anon_select_blood_banks" ON blood_banks FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO blood_banks (name, kind, city, address, phone, is_24h)
SELECT * FROM (VALUES
  ('Central blood bank', 'blood_bank', 'Downtown', '12 Main Street', '+1 555 0101', true),
  ('St. Mary Community Hospital', 'hospital', 'Downtown', '48 Hospital Road', '+1 555 0142', true),
  ('Riverside Blood Centre', 'blood_bank', 'Riverside', '7 River Lane', '+1 555 0177', false),
  ('Northgate Medical Hospital', 'hospital', 'Northgate', '220 Northgate Ave', '+1 555 0198', true),
  ('Lakeview Donation Camp', 'blood_bank', 'Lakeview', '31 Lake Drive', '+1 555 0213', false),
  ('Hope General Hospital', 'hospital', 'Lakeview', '90 Hope Boulevard', '+1 555 0260', true)
) AS seed(name, kind, city, address, phone, is_24h)
WHERE NOT EXISTS (SELECT 1 FROM blood_banks);
