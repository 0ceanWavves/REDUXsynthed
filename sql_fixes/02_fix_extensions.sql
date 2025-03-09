-- Script to move pg_trgm extension from public to extensions schema

-- First, create the extension in extensions schema if it doesn't exist there already
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Drop the extension from public schema if it exists
DROP EXTENSION IF EXISTS pg_trgm CASCADE;

-- Recreate extension in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Update any references to public.* objects to extensions.* if needed
-- Note: This may require specific adjustments based on your database usage 