# Supabase Security Remediation Report

## Overview

This report documents the security issues identified in your Supabase database and provides detailed remediation steps. The issues were discovered through Supabase's built-in security linting tools.

## Issues Identified

### 1. Function Search Path Mutable

**Severity:** Warning  
**Category:** Security  
**Description:** Numerous functions in the `public` and `audit` schemas have a role mutable search_path.

**Impact:** When a function's search path is not explicitly set, it inherits the search path from the calling user. This can lead to privilege escalation attacks where a malicious user manipulates the search path to execute unauthorized code.

**Affected Functions:**
- `public.update_updated_at_column`
- `public.is_role`
- `public.encrypt_sensitive_data`
- `public.decrypt_sensitive_data`
- `public.encrypt_patient_data`
- `public.encrypt_phi`
- `public.decrypt_phi`
- And many others (40+ functions)

**Remediation:**
- Set an explicit search_path for each function using `ALTER FUNCTION` 
- The search_path should follow the principle of least privilege
- Our script `01_fix_search_path.sql` automates this for all affected functions

### 2. Extension in Public Schema

**Severity:** Warning  
**Category:** Security  
**Description:** The `pg_trgm` extension is installed in the `public` schema.

**Impact:** Extensions in the public schema may grant excessive privileges to public users and potentially expose functionality that should be restricted. This can lead to information disclosure or privilege escalation.

**Affected Extension:**
- `pg_trgm`

**Remediation:**
- Move the extension to the `extensions` schema
- Update any references to the extension objects
- Our script `02_fix_extensions.sql` automates this process

### 3. Auth OTP Long Expiry

**Severity:** Warning  
**Category:** Security  
**Description:** Email OTP (One-Time Password) codes have an expiry time set to more than one hour.

**Impact:** Long-lived OTP codes increase the window of opportunity for brute force attacks and compromise of authentication mechanisms.

**Remediation:**
- Reduce the OTP expiry time to 30 minutes or less
- Update through Supabase dashboard or API
- Partial SQL fixes provided in `03_fix_auth_settings.sql`

### 4. Leaked Password Protection Disabled

**Severity:** Warning  
**Category:** Security  
**Description:** The HaveIBeenPwned password check feature is currently disabled.

**Impact:** Without password leak checking, users may set passwords that have been compromised in known data breaches, significantly increasing the risk of account takeover.

**Remediation:**
- Enable the Leaked Password Protection feature
- Update through Supabase dashboard (Authentication > Settings > Security & Compliance)
- Guidance provided in README.md

## Verification

After applying the remediation steps, you can verify the fixes using:

1. The `04_verify_fixes.sql` script which checks database configurations
2. The Supabase dashboard security linting tools to confirm the warnings are resolved

## Best Practices

1. **Regular Security Audits**: Run the Supabase linter regularly to identify new security issues
2. **Principle of Least Privilege**: Always apply the minimum necessary permissions
3. **Schema Isolation**: Keep sensitive functions and extensions in dedicated schemas
4. **Explicit Configurations**: Always explicitly define security-related configurations
5. **Documentation**: Maintain documentation of your security settings and remediation history

## References

- [Supabase Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [Function Search Path Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Extension in Public Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Supabase Auth Security Documentation](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Password Security Documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) 