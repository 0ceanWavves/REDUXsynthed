-- Script to fix function search path issues in Supabase
-- This script updates functions to explicitly set search_path

-- For all public schema functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_schema, routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_schema IN ('public', 'audit')
        AND routine_type = 'FUNCTION'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I SET search_path = "$user", %I, public;', 
                       func_record.routine_schema, 
                       func_record.routine_name,
                       func_record.routine_schema);
            RAISE NOTICE 'Updated function %', func_record.routine_schema || '.' || func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to update function %: %', 
                func_record.routine_schema || '.' || func_record.routine_name, 
                SQLERRM;
        END;
    END LOOP;
END$$; 