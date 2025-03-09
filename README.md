# Astro Landing Page <picture><source media="(prefers-color-scheme: dark)" srcset="https://astro.build/assets/press/astro-icon-light.png"><source media="(prefers-color-scheme: light)" srcset="https://astro.build/assets/press/astro-icon-dark.png"><img align="right" valign="center" height="79" width="63" src="https://astro.build/assets/press/astro-icon-dark.png" alt="Astro logo" /></picture>

> An Astro + Tailwind CSS example/template for landing pages.

<div align="center">

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)

</div>

![Screenshots of Astro Landing Page](screenshots.jpg)

## Features

- 💨 Tailwind CSS for styling
- 🎨 Themeable
  - CSS variables are defined in `src/styles/theme.css` and mapped to Tailwind classes (`tailwind.config.cjs`)
- 🌙 Dark mode
- 📱 Responsive (layout, images, typography)
- ♿ Accessible (as measured by https://web.dev/measure/)
- 🔎 SEO-enabled (as measured by https://web.dev/measure/)
- 🔗 Open Graph tags for social media sharing
- 💅 [Prettier](https://prettier.io/) setup for both [Astro](https://github.com/withastro/prettier-plugin-astro) and [Tailwind](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)

## Commands

| Command                | Action                                            |
| :--------------------- | :------------------------------------------------ |
| `npm install`          | Install dependencies                              |
| `npm run dev`          | Start local dev server at `localhost:4321`        |
| `npm run build`        | Build your production site to `./dist/`           |
| `npm run preview`      | Preview your build locally, before deploying      |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check`  |
| `npm run astro --help` | Get help using the Astro CLI                      |
| `npm run format`       | Format code with [Prettier](https://prettier.io/) |
| `npm run clean`        | Remove `node_modules` and build output            |

## Credits

- astronaut image
  - source: https://github.com/withastro/astro-og-image; note: this repo is not available anymore
- moon image
  - source: https://unsplash.com/@nasa
- other than that, a lot of material (showcase data, copy) was taken from official Astro sources, in particular https://astro.build/blog/introducing-astro/ and https://github.com/withastro/astro.build

# Database Index Migration for Unindexed Foreign Keys

This repository contains SQL scripts to address Supabase database linter warnings about unindexed foreign keys. Adding proper indexes to foreign key columns improves query performance, especially for join operations.

## Files

- **add_missing_indexes.sql**: Simple SQL script with CREATE INDEX statements for each unindexed foreign key. Use this for direct execution in development environments or for reference.

- **migration_add_missing_indexes.sql**: Transaction-based migration script with error handling and idempotency (safe to run multiple times). This is the recommended script for production environments.

## Performance Impact

Adding indexes to foreign key columns can significantly improve query performance, especially for:

- JOIN operations using these foreign keys
- WHERE clauses that filter on foreign key columns
- Referential integrity checks

The performance benefit is most noticeable on tables with many rows or frequently queried tables.

## How to Apply

### Option 1: Using Supabase Migration

If you're using Supabase migrations:

1. Copy the migration script to your migrations folder
2. Rename it with the appropriate timestamp prefix (e.g., `000123_add_missing_indexes.sql`)
3. Run the migration using your normal migration process:
   ```
   supabase db push
   ```

### Option 2: Direct Database Execution

1. Connect to your Supabase database using psql or another PostgreSQL client
2. Execute the migration script:
   ```
   \i migration_add_missing_indexes.sql
   ```

### Option 3: Supabase Dashboard SQL Editor

1. Open your Supabase project
2. Navigate to the SQL Editor
3. Copy the contents of `migration_add_missing_indexes.sql`
4. Execute the script

## Verification

After applying the indexes, you can verify they were created by running:

```sql
-- For phi_data schema
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'phi_data' AND indexname LIKE 'idx_%';

-- For public schema
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
```

## Monitoring

After adding the indexes, monitor your database performance to ensure the changes have a positive impact. If you notice any issues, you can remove specific indexes using:

```sql
DROP INDEX IF EXISTS schema_name.index_name;
```

## Notes

- Index creation might take some time on large tables
- Creating indexes acquires a lock on the table, which might block other operations during creation
- For very large tables in a production environment, consider using `CREATE INDEX CONCURRENTLY` directly in a maintenance window to minimize blocking
