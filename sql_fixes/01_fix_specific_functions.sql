-- Fix specific functions with search path issues

-- encrypt_phi
ALTER FUNCTION public.encrypt_phi SET search_path = "$user", public;

-- decrypt_phi
ALTER FUNCTION public.decrypt_phi SET search_path = "$user", public;

-- log_phi_access
ALTER FUNCTION public.log_phi_access SET search_path = "$user", public;

-- update_drug_test_status
ALTER FUNCTION public.update_drug_test_status SET search_path = "$user", public;

-- The function may have overloaded versions (different parameter lists)
-- So let's also try to fix any overloaded versions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            p.oid
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname IN ('encrypt_phi', 'decrypt_phi', 'log_phi_access', 'update_drug_test_status')
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = "$user", public;', 
                       func_record.function_name,
                       pg_get_function_identity_arguments(func_record.oid));
            RAISE NOTICE 'Updated overloaded function %', func_record.schema_name || '.' || func_record.function_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to update overloaded function %: %', 
                func_record.schema_name || '.' || func_record.function_name, 
                SQLERRM;
        END;
    END LOOP;
END$$; 