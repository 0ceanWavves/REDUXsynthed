# Supabase Security Fixes

This folder contains SQL scripts to address security warnings found in your Supabase database.

## Issues Being Fixed

1. **Function Search Path Mutable** - Functions in your database are missing explicit search_path settings, which is a security best practice.
2. **Extension in Public** - The pg_trgm extension is installed in the public schema, which is not recommended.
3. **Auth OTP Long Expiry** - Email OTP codes are set to expire after more than an hour, which is longer than recommended.
4. **Leaked Password Protection Disabled** - The HaveIBeenPwned password check feature is disabled.

## Application Instructions

### Method 1: Using Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run each script in order:
   - `01_fix_search_path.sql` - Sets search_path for all functions
   - `02_fix_extensions.sql` - Moves pg_trgm extension to the extensions schema
   - `03_fix_auth_settings.sql` - Adjusts auth settings where possible
4. Run `04_verify_fixes.sql` to confirm the changes were applied

### Method 2: Using Supabase CLI

If you have the Supabase CLI set up locally:

```bash
# Apply each script
supabase db execute --file=./sql_fixes/01_fix_search_path.sql
supabase db execute --file=./sql_fixes/02_fix_extensions.sql
supabase db execute --file=./sql_fixes/03_fix_auth_settings.sql

# Verify changes
supabase db execute --file=./sql_fixes/04_verify_fixes.sql
```

### Auth Settings

For the auth settings that cannot be updated directly via SQL:

1. **Leaked Password Protection**:
   - Go to Authentication > Settings > Security & Compliance
   - Enable "Leaked Password Protection"

2. **OTP Expiry**:
   - Go to Authentication > Settings > Email
   - Set "Email OTP Code Expiry" to 30 minutes or less

## Additional Notes

- Some changes may require a restart of your database or auth services to take effect
- Always back up your database before making structural changes
- Test these changes in a development environment before applying to production

## Verification

After applying these fixes, you should see the security warnings disappear from your Supabase dashboard. 