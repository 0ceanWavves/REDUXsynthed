-- Script to verify that fixes have been applied

-- Check function search_path settings
SELECT routine_schema, routine_name,
       pg_catalog.obj_description(p.oid, 'pg_proc') as description,
       p.prosecdef, p.proconfig
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'audit')
ORDER BY routine_schema, routine_name;

-- Check extension schema
SELECT extname, extnamespace::regnamespace as schema 
FROM pg_extension
WHERE extname = 'pg_trgm';

-- Check auth flow state expirations (for OTP expirations)
SELECT provider_type, code_challenge_expiry
FROM auth.flow_state
WHERE provider_type = 'email'
AND code_challenge_expiry > NOW()
ORDER BY code_challenge_expiry DESC
LIMIT 10;

-- Note: For checking leaked password protection,
-- you will need to check via Supabase dashboard or API
-- as this is not directly stored in a queryable database table in most setups 