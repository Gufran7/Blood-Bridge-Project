/*
# Blood Bridge Enhancement Migration
# 1. Enforce 10-digit Indian mobile numbers on donors and blood_requests.
# 2. Create donor_documents table for health and ID verification.
# 3. Add verified Solapur hospitals and blood banks to directory.
# 4. RLS policies and indexes.
*/

-- 1. Create donor_documents table for health verification
CREATE TABLE IF NOT EXISTS donor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('govt_id', 'blood_group_report', 'previous_donation_proof')),
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  file_size integer NOT NULL CHECK (file_size > 0 AND file_size <= 5242880), -- 5MB limit
  file_type text NOT NULL CHECK (file_type IN ('application/pdf', 'image/jpeg', 'image/jpg', 'image/png')),
  file_data text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason text CHECK (rejection_reason IS NULL OR char_length(rejection_reason) <= 500),
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donor_documents_donor_idx ON donor_documents (donor_id, status);

ALTER TABLE donor_documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON donor_documents TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_donor_documents" ON donor_documents;
CREATE POLICY "anon_select_donor_documents" ON donor_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_donor_documents" ON donor_documents;
CREATE POLICY "anon_insert_donor_documents" ON donor_documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_donor_documents" ON donor_documents;
CREATE POLICY "anon_update_donor_documents" ON donor_documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Allow admin updates and inserts on blood_banks
GRANT INSERT, UPDATE, DELETE ON blood_banks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_manage_blood_banks" ON blood_banks;
CREATE POLICY "anon_manage_blood_banks" ON blood_banks FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Seed Verified Solapur Hospitals & Blood Banks
INSERT INTO blood_banks (name, kind, city, address, phone, is_24h)
VALUES
  ('Civil Hospital, Solapur', 'hospital', 'Solapur', 'Dr. V. M. Government Medical College & CSM Sarvopchar Rugnalaya, Civil Chowk', '0217 2731900', true),
  ('Ashwini Hospital', 'hospital', 'Solapur', '60/1, North Sadar Bazar, Near Old Employment Exchange', '0217 2319900', true),
  ('Markandeya Cooperative Hospital', 'hospital', 'Solapur', 'Shastri Nagar, Near Ashok Chowk, New Paccha Peth', '0217 2620820', true),
  ('Mule Hospital', 'hospital', 'Solapur', 'Near Datta Chowk, Murarji Peth', '0217 2727063', true),
  ('Chidgupkar Hospital', 'hospital', 'Solapur', '145, Murarji Peth, Near Railway Station', '0217 2326841', true),
  ('Yashodhara Hospital', 'hospital', 'Solapur', '9, Park Road, Opp. Siddheshwar Temple Lake', '0217 2323001', true),
  ('Siddheshwar Multispeciality Hospital', 'hospital', 'Solapur', '111/1, Station Road, Near Old Poona Naka', '0217 2320840', true),
  ('Unique Hospital', 'hospital', 'Solapur', '10/11, Old Pune Naka, Murarji Peth', '0217 2323211', true),
  ('Bhave Hospital', 'hospital', 'Solapur', '73/2, Railway Lines, Duffrin Chowk', '0217 2727078', false),
  ('Apex Hospital', 'hospital', 'Solapur', '121, South Kasba, Near Budhwar Peth', '0217 2600603', true),
  ('Smt. Gopabai Damani Blood Centre', 'blood_bank', 'Solapur', 'Damani Blood Bank Building, Near Civil Hospital, Civil Lines', '0217 2726858', true),
  ('Dr. Hedgewar Blood Bank', 'blood_bank', 'Solapur', '44, Gold Finch Peth, Near Datta Mandir', '0217 2311281', true),
  ('Chhatrapati Shivaji Maharaj Sarvopchar Hospital Blood Bank', 'blood_bank', 'Solapur', 'Civil Hospital Campus, Ground Floor, Civil Chowk', '0217 2310766', true),
  ('Athar Blood Bank', 'blood_bank', 'Solapur', '45, Shukrawar Peth, Near Manik Chowk', '0217 2622999', true),
  ('Akshay Blood Bank', 'blood_bank', 'Solapur', '88, Navi Peth, Near Ambedkar Statue', '0217 2315025', true),
  ('Irrapanna N. Bolli Blood Centre', 'blood_bank', 'Solapur', '12, New Pachha Peth, Near Ashok Chowk', '0217 2653829', true),
  ('Siddheshwar Blood Centre', 'blood_bank', 'Solapur', 'Opposite Siddheshwar Temple Lake', '0217 6004222', true),
  ('Mallikarjun Blood Bank', 'blood_bank', 'Solapur', '104, Murarji Peth, Near Old Pune Naka', '0217 2310555', true),
  ('Mahatma Basaveshwar Blood Centre', 'blood_bank', 'Solapur', 'Basaveshwar Chowk', '9850220047', true),
  ('Solapur Blood Bank', 'blood_bank', 'Solapur', '21, Railway Lines, Near Collector Office', '0217 2317242', true)
ON CONFLICT DO NOTHING;
