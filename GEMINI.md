# GEMINI.md - Nexalaris Certificate Verification System

This document provides architectural context, development standards, and operational instructions for the Nexalaris Certificate Verification System.

## Project Overview

A secure, high-performance certificate verification and management platform. It allows administrators to issue certificates and public users to verify them via unique codes or QR codes.

### Core Architecture
- **Framework**: Next.js 16 (App Router) with React 19.
- **Database**: Supabase (PostgreSQL).
- **Styling**: Tailwind CSS v4.
- **Components**: shadcn/ui (New York style).
- **State Management**: React Server Components (RSC) & client-side hooks.
- **Package Manager**: `pnpm`.

## Technology Stack & Libraries

- **Authentication**: Custom session-based auth (bcryptjs, crypto, httpOnly cookies).
- **PDF/PNG Export**: jsPDF + html2canvas (client-side rendering).
- **QR Codes**: `qrcode` library.
- **Forms**: React Hook Form + Zod.
- **Icons**: Lucide React.
- **Date Handling**: date-fns.

## Critical Patterns

### 1. Authentication & Security
- **Admin Protection**: Middleware (`middleware.ts`) protects all `/admin/*` routes.
- **Session Management**: Handled in `lib/auth.ts`. Uses `nexalaris_admin_session` (httpOnly) and `nexalaris_admin_csrf`.
- **CSRF Protection**: Enforced for all non-GET admin requests. Use `adminFetch()` from `lib/csrf-client.ts` for client-side requests.
- **Bypassing RLS**: Privileged operations (like password verification or session creation) use `getSupabaseAdminClient()` from `lib/supabase/server.ts`.

### 2. Supabase Client Usage
Always use the appropriate client from `lib/supabase/`:
- **`getSupabaseServerClient`**: For standard SSR data fetching with user permissions.
- **`getSupabaseAdminClient`**: For service-role operations that bypass RLS.
- **`createClient` (lib/supabase/client.ts)**: For browser-side operations.

### 3. Certificate Codes
- **Format**: `VC-YYYY-XXXXX` (e.g., `VC-2024-ABC123`).
- **Verification**: Public verification happens at `/c/[cert_code]`.

### 4. API Route Protection
All routes under `app/api/admin/` **MUST** verify the admin session:
```typescript
import { verifyAdminRequest } from "@/lib/auth"

export async function POST(request: Request) {
  const verification = await verifyAdminRequest(request)
  if (!verification.ok) {
    return NextResponse.json({ error: verification.error }, { status: 401 })
  }
  // ... proceed
}
```

## Development Commands

- `pnpm dev`: Start development server.
- `pnpm build`: Create production build.
- `pnpm lint`: Run ESLint.
- `node tests/smoke_test.js`: Run smoke tests (requires server to be running).

## Key File Locations

- `app/admin/`: Admin dashboard and pages.
- `app/api/admin/`: Protected admin endpoints.
- `app/c/[cert_code]/`: Public verification page.
- `lib/auth.ts`: Core authentication logic.
- `lib/certificate-template.tsx`: Shared UI for certificate display and export.
- `scripts/migrations/`: SQL schema definitions.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations (Server-only).
- `NEXT_PUBLIC_SITE_URL`: Base URL for QR codes and certificate links.
- `ADMIN_DEFAULT_PASSWORD`: Initial admin password.
- `REDIS_URL`: Optional, for distributed rate limiting.

## Database Keep-Alive (Cron Job)

To prevent the Supabase database from pausing due to inactivity, a cron job is configured to ping the database every 2 days.

- **Endpoint**: `/api/cron/keep-alive`
- **Schedule**: `0 0 */2 * *` (Every 2 days at midnight)
- **Security**: Requires an `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` header.
- **Config**: Defined in `vercel.json`.

## Database Schema Highlights

- `admin_auth`: Stores bcrypt password hashes.
- `admin_sessions`: Tracks active admin tokens and expiry.
- `certificates`: Main certificate data (recipient, code, program_id, etc.).
- `programs`: Available certification programs.

## Development Standards

- **Strict TypeScript**: Use proper interfaces for all data structures.
- **Server Components**: Prefer Server Components for data fetching unless interactivity is required.
- **UI Consistency**: Use shadcn/ui primitives. Adhere to the current aesthetic (minimalist, clean).
- **Security**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the client. Always verify admin status on mutation endpoints.
