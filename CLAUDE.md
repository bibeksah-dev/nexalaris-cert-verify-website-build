# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build production bundle
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

Run smoke tests: `node tests/smoke_test.js` (requires dev server running)

## Technology Stack

- **Next.js 16** with App Router and React 19
- **Supabase** for PostgreSQL database (not using Supabase Auth)
- **Tailwind CSS v4** with shadcn/ui components (new-york style)
- **TypeScript** in strict mode
- **pnpm** as package manager

## Architecture Overview

### Authentication System

Custom session-based authentication (not Supabase Auth):
- **`lib/auth.ts`** - Core auth logic: session management, bcrypt password verification, CSRF protection
- **`middleware.ts`** - Protects `/admin/*` routes, redirects to login on invalid session
- Session cookies: `nexalaris_admin_session` (httpOnly) and `nexalaris_admin_csrf`
- Rate limiting: 5 login attempts per 15 minutes (Redis optional, falls back to in-memory)
- Tables: `admin_sessions` (tokens), `admin_auth` (password hashes)

### Supabase Client Pattern

Three client types in `lib/supabase/`:
1. **`client.ts`** - Browser client for public data access
2. **`server.ts`** - Server client with cookie management for SSR
3. **`server.ts` (admin)** - Service role client that bypasses RLS for privileged operations

### Certificate System

- **Code format**: `VC-YYYY-XXXXX` (e.g., `VC-2024-ABC123`)
- **Public verification**: `/c/[cert_code]` routes
- **Template**: `lib/certificate-template.tsx` renders HTML for PDF/PNG export
- **Export**: Client-side via jsPDF + html2canvas
- **Statuses**: `VALID`, `EXPIRED`, `REVOKED`

### API Route Patterns

Admin routes require `verifyAdminRequest()`:
```typescript
const verification = await verifyAdminRequest(request)
if (!verification.ok) return NextResponse.json({ error: ... }, { status: 401 })
```

Client-side admin requests use `adminFetch()` from `lib/csrf-client.ts` which auto-includes CSRF headers.

### Key Directories

- `app/admin/` - Protected admin dashboard, certificate management, settings
- `app/api/admin/` - Protected API endpoints (login, logout, certificate CRUD)
- `app/api/certificates/` - Public certificate endpoints
- `app/c/[cert_code]/` - Public certificate verification pages
- `components/ui/` - shadcn/ui components (auto-generated)

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-only, never expose
NEXT_PUBLIC_SITE_URL=           # Used in QR codes and certificate links
ADMIN_DEFAULT_PASSWORD=         # Change after first login
REDIS_URL=                      # Optional, for distributed rate limiting
```

## Database Migrations

SQL migration files are in `scripts/migrations/`. Run them in Supabase SQL editor in order.
