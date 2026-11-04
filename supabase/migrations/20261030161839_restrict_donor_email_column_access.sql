REVOKE SELECT ON donors FROM anon, authenticated;

GRANT SELECT (id, full_name, blood_group, city, phone, last_donated_on, is_available, created_at)
  ON donors TO anon, authenticated;
