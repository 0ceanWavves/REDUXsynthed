-- Fix specific functions with search path issues
-- This script handles overloaded functions by using their full signatures

-- First, let's get the full signatures of the functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE 'Available functions and their signatures:';
    
    FOR func_record IN 
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname IN ('encrypt_phi', 'decrypt_phi', 'log_phi_access', 'update_drug_test_status')
        ORDER BY p.proname, pg_get_function_identity_arguments(p.oid)
    LOOP
        RAISE NOTICE '%s.%s(%s)', 
            func_record.schema_name, 
            func_record.function_name,
            func_record.args;
    END LOOP;
END$$;

-- Now, let's systematically fix each function
-- We need to use the full function signature for each overloaded function

-- Fix each function with its explicit signature
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname IN ('encrypt_phi', 'decrypt_phi', 'log_phi_access', 'update_drug_test_status')
    LOOP
        BEGIN
            -- Use the full function signature for unambiguous identification
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = "$user", %I, public;', 
                     func_record.schema_name, 
                     func_record.function_name,
                     func_record.args,
                     func_record.schema_name);
                     
            RAISE NOTICE 'Successfully updated function %s.%s(%s)', 
                func_record.schema_name, 
                func_record.function_name,
                func_record.args;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to update function %s.%s(%s): %s', 
                func_record.schema_name, 
                func_record.function_name,
                func_record.args,
                SQLERRM;
        END;
    END LOOP;
END$$; 