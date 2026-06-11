-- Enable pg_cron for scheduled jobs (creates the cron schema)
create extension if not exists pg_cron;

-- Enable pg_net for HTTP calls from cron jobs
create extension if not exists pg_net schema extensions;

-- Schedule auto-create-puzzle at 3 AM UTC every day (~10 PM ET / 11 PM EDT).
-- BEFORE running this migration, add CRON_SECRET to your Supabase secrets:
--   supabase secrets set CRON_SECRET=<your-secret-value>
-- Then replace <YOUR_CRON_SECRET> below with that same value.
select cron.schedule(
  'auto-create-puzzle-nightly',
  '0 3 * * *',
  $cron$
  select net.http_post(
    url     := 'https://oyklvvbokossvubkhctj.supabase.co/functions/v1/auto-create-puzzle',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer ENTER CRON SECRET HERE"}'::jsonb,
    body    := '{}'::jsonb
  );
  $cron$
);
