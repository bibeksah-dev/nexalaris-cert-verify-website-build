Migration instructions
----------------------

This project uses a simple Postgres migration to create `admin_sessions` (server-side sessions)
and `admin_auth` (admin password storage) tables. Run the SQL file below against your database.

File: `scripts/migrations/001_create_admin_sessions.sql`

How to apply (Supabase/Postgres):

Using `psql`:

```powershell
# On Windows PowerShell - replace placeholders with your values
psql "postgresql://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>" -f scripts/migrations/001_create_admin_sessions.sql
```

Using the Supabase CLI:

```powershell
# If you have supabase CLI configured
supabase db remote set <DATABASE_URL>
supabase db query < scripts/migrations/001_create_admin_sessions.sql
```

After running migrations:
- Confirm `admin_sessions` and `admin_auth` tables exist.
- If you already have an `admin_auth` row, it will remain unchanged.
- If you need to create an initial admin account, insert a hashed password using a secure workflow (do not insert plaintext).

Example: generate bcrypt hash with Node REPL

```powershell
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('<your-password>', 10).then(h => console.log(h))"
```

Then insert into DB (psql):

```sql
INSERT INTO admin_auth (password_hash) VALUES ('<bcrypt-hash>');
```
