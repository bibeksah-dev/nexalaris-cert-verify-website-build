-- Prune expired admin sessions
DELETE FROM admin_sessions WHERE expires_at <= now();

-- You can schedule this with cron or Supabase scheduled functions.
