-- Script to fix Auth OTP expiry and enable leaked password protection
-- Note: These settings are typically managed via the Supabase dashboard or API
-- This SQL provides the equivalent database updates if direct access is available

-- For Auth OTP long expiry issue
-- Reduce the email code expiry time to under 1 hour (3600 seconds)
-- This example sets it to 30 minutes (1800 seconds)
UPDATE auth.flow_state
SET code_challenge_expiry = NOW() + interval '30 minutes'
WHERE provider_type = 'email' AND code_challenge_expiry > NOW() + interval '1 hour';

-- Enable leaked password protection
-- This typically needs to be done through the Supabase dashboard or API
-- If you have direct DB access, you might be able to update a configuration table

-- Alternatively, you may need to use the Supabase Management API
-- POST /auth/v1/config
-- with payload: { "HIBP": { "enabled": true } }

-- Note: You may need to restart the Auth service for changes to take effect 