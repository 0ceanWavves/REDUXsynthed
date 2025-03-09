# Supabase Auth Settings Fix Instructions

To fix the remaining auth settings that are causing security warnings, follow these step-by-step instructions:

## 1. Auth OTP Long Expiry Fix

1. Log in to your Supabase dashboard
2. Navigate to **Authentication** in the left sidebar
3. Click on **Providers**
4. In the Email section, click **Edit**
5. Find the **Expiration time for confirmation links and OTPs** setting
6. Set this value to **1800** (30 minutes) or less
7. Click **Save**

## 2. Leaked Password Protection Fix

1. Stay in the Authentication section
2. Click on **Policies** in the sub-menu
3. Find the **Passwords** section
4. Look for **Leaked Password Detection** or **HaveIBeenPwned Integration**
5. Toggle this setting to **Enable**
6. Click **Save**

If you don't see these exact options, look for similar settings that control OTP expiry time and password security checks.

## Alternative Method (API)

If you have access to the Supabase Management API, you can also apply these settings programmatically:

```bash
# Get your service role key from the API settings in your Supabase dashboard
SERVICE_ROLE_KEY="your-service-role-key"
PROJECT_REF="your-project-ref"

# Fix OTP expiry time (30 minutes = 1800 seconds)
curl -X PUT "https://api.supabase.io/v1/projects/$PROJECT_REF/auth/config" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION": true,
    "EXTERNAL_EMAIL_ENABLED": true,
    "SECURITY_EMAIL_CONFIRMATION_LIFESPAN": 1800
  }'

# Enable leaked password protection
curl -X PUT "https://api.supabase.io/v1/projects/$PROJECT_REF/auth/config" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "HIBP": {
      "enabled": true
    }
  }'
```

## Verification

After making these changes, return to the SQL linting section of your Supabase dashboard to verify that the warnings have been resolved. It may take a few minutes for the changes to propagate and the warnings to disappear. 