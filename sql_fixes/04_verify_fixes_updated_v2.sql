-- Script to verify that fixes have been applied

-- Check function search_path settings using PostgreSQL catalog views
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_catalog.obj_description(p.oid, 'pg_proc') AS description,
    p.prosecdef,
    p.proconfig
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'audit')
ORDER BY n.nspname, p.proname;

-- Check extension schema
SELECT 
    e.extname,
    n.nspname AS schema_name
FROM pg_catalog.pg_extension e
JOIN pg_catalog.pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname = 'pg_trgm';

-- Note: Auth settings (OTP expiry and leaked password protection)
-- must be verified through the Supabase dashboard:
-- 1. Go to Authentication > Settings > Email
--    - Verify "Email OTP Code Expiry" is set to 30 minutes or less
-- 2. Go to Authentication > Settings > Security & Compliance
--    - Verify "Leaked Password Protection" is enabled 