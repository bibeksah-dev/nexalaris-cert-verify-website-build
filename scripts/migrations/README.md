Migration instructions
----------------------

> **Note:** this README previously pointed at
> `scripts/migrations/001_create_admin_sessions.sql`, but that file was never
> checked into the repository. The migration that created `admin_sessions`
> and `admin_auth` was applied directly in the Supabase SQL editor and is
> unversioned. The schema below is reconstructed from what the application
> code (`lib/auth.ts`) reads and writes; verify it against the live database
> before reusing it.

The app expects two tables:

- `admin_sessions` — server-side session tokens. Columns used by the code:
  `token` (text, unique), `created_at` (timestamptz), `expires_at` (timestamptz).
- `admin_auth` — single-row admin password storage. Columns used by the code:
  `password_hash` (text), `updated_at` (timestamptz).

Both tables are only ever accessed through the service-role client, so RLS
should be enabled with no anonymous policies.

Creating an initial admin account
---------------------------------

Insert a hashed password using a secure workflow (do not insert plaintext).

Generate a bcrypt hash with the Node REPL:

```powershell
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('<your-password>', 10).then(h => console.log(h))"
```

Then insert it (Supabase SQL editor or psql):

```sql
INSERT INTO admin_auth (password_hash) VALUES ('<bcrypt-hash>');
```
