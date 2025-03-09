-- Script to fix function search path issues in Supabase
-- This script updates functions to explicitly set search_path

-- For all public and audit schema functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname IN ('public', 'audit')
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I SET search_path = "$user", %I, public;', 
                       func_record.schema_name, 
                       func_record.function_name,
                       func_record.schema_name);
            RAISE NOTICE 'Updated function %', func_record.schema_name || '.' || func_record.function_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to update function %: %', 
                func_record.schema_name || '.' || func_record.function_name, 
                SQLERRM;
        END;
    END LOOP;
END$$; 