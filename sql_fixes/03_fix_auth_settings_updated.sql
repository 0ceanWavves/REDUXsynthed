-- Script to fix Auth OTP expiry and enable leaked password protection
-- Note: These settings are typically managed via the Supabase dashboard or API
-- This SQL provides the equivalent database updates if direct access is available

-- For Auth OTP long expiry issue:
-- The OTP expiry setting is not directly modifiable via SQL
-- You need to update this setting through the Supabase dashboard:
--   1. Go to Authentication > Settings > Email
--   2. Set "Email OTP Code Expiry" to 30 minutes or less

-- For leaked password protection:
-- This setting must be enabled through the Supabase dashboard:
--   1. Go to Authentication > Settings > Security & Compliance 
--   2. Enable "Leaked Password Protection"

-- Note: If you have the Supabase Admin API access, you can use:
-- POST /auth/v1/config
-- with payload: { 
--   "EXTERNAL_EMAIL_ENABLED": true,
--   "SECURITY_EMAIL_CONFIRMATION_LIFESPAN": 1800,
--   "HIBP": { "enabled": true } 
-- }

-- This script serves as documentation, but the actual changes
-- need to be made through the Supabase dashboard or API 