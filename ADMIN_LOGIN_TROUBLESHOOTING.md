# Admin Login Troubleshooting Guide

## Issue: Admin Login Not Working

If you're experiencing issues with the admin login, follow these steps to diagnose and fix the problem.

## Step 1: Check Environment Variables

Ensure `.env.local` exists with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lvvuladjhqtvstbyszxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ADMIN_DEFAULT_PASSWORD=changeit!
```

**Status:** ✅ Already configured

## Step 2: Verify Database Tables Exist

The application requires these database tables:
- `admin_auth` - Stores admin password hash
- `programs` - Certificate programs
- `certificates` - Certificate records

### Option A: Run Setup Script (Recommended)

```bash
./setup-database.sh
```

This script will:
1. Test database connection
2. Create all required tables
3. Insert seed data
4. Verify the setup

### Option B: Manual Setup via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Navigate to your project: `lvvuladjhqtvstbyszxd`
3. Click "SQL Editor" in the left sidebar
4. Run the following scripts in order:
   - `scripts/001-create-tables.sql`
   - `scripts/002-seed-data.sql`

### Option C: Using psql Command Line

```bash
# Set password
export PGPASSWORD="nCKMJPKn5Tz03jnZ"

# Run migrations
psql -h "db.lvvuladjhqtvstbyszxd.supabase.co" \
     -U "postgres" \
     -d "postgres" \
     -f scripts/001-create-tables.sql

psql -h "db.lvvuladjhqtvstbyszxd.supabase.co" \
     -U "postgres" \
     -d "postgres" \
     -f scripts/002-seed-data.sql
```

## Step 3: Start the Application

```bash
npm run dev
```

The application will start on http://localhost:3000

## Step 4: Test Admin Login

1. Navigate to: http://localhost:3000/admin/login
2. Enter password: `changeit!` (or your custom ADMIN_DEFAULT_PASSWORD)
3. Check server logs for diagnostic messages

## Understanding the Logs

When you attempt to login, you'll see detailed logs like:

```
[v0] ═══════════════════════════════════════════
[v0] Admin login attempt started
[v0] Environment check:
[v0]   - NEXT_PUBLIC_SUPABASE_URL: ✓ Set
[v0]   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ✓ Set
[v0]   - ADMIN_DEFAULT_PASSWORD: ✓ Set
[v0] Password provided, length: 9
[v0] Verifying password...
[v0] Fetching admin auth from database...
```

### Common Error Patterns

#### Error: "relation 'admin_auth' does not exist"
**Cause:** Database tables haven't been created yet
**Fix:** Run `./setup-database.sh` or manually create tables

#### Error: "Invalid password"
**Cause:** Wrong password or admin_auth table is not initialized
**Fix:**
- Try default password: `changeMeNow!` (if you didn't set ADMIN_DEFAULT_PASSWORD)
- Or use your custom password from ADMIN_DEFAULT_PASSWORD env var: `changeit!`

#### Error: "Failed to fetch"
**Cause:** Supabase connection issue
**Fix:** Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

#### Error: "Internal server error"
**Cause:** Various - check server logs for details
**Fix:** Look at the detailed error message in console logs

## Step 5: How Default Password Works

When you first try to login:

1. The system checks the `admin_auth` table
2. If the table is empty, it automatically creates a default password
3. Default password is either:
   - Value from `ADMIN_DEFAULT_PASSWORD` env var → **`changeit!`** (your setup)
   - Or falls back to `changeMeNow!` if env var not set

## Step 6: Changing the Admin Password

Once logged in:

1. Navigate to: http://localhost:3000/admin/settings
2. Enter current password
3. Set new password
4. The password is hashed using bcrypt before storing

## Quick Diagnosis Checklist

- [ ] `.env.local` file exists
- [ ] Environment variables are loaded (restart dev server after changes)
- [ ] Database tables exist (`admin_auth`, `programs`, `certificates`)
- [ ] Using correct password: `changeit!`
- [ ] Server logs show detailed diagnostic output
- [ ] No network issues connecting to Supabase

## Still Having Issues?

If admin login still doesn't work after following these steps:

1. Check the server console logs carefully
2. Look for the diagnostic messages starting with `[v0]`
3. Share the error logs to get specific help
4. Verify Supabase project is not paused (free tier projects auto-pause after inactivity)

## Default Credentials

**Password:** `changeit!`

**Important:** Change this password immediately after first login via the Settings page!
