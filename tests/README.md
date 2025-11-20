Smoke tests
-----------

These are simple smoke checks to validate that public endpoints are reachable and admin endpoints are protected.

Requirements:
- Node 18+ (global fetch) or install `node-fetch` and adjust the script
- The dev server must be running (e.g., `pnpm dev`)

Run:

```powershell
# Start dev server in another terminal
pnpm dev

# In this project root
node tests/smoke_test.js
```

Set `BASE_URL` if your server listens elsewhere:

```powershell
$env:BASE_URL = 'http://localhost:3000'
node tests/smoke_test.js
```
