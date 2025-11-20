# Nexalaris Certificate Verification System

A modern, secure certificate verification and management system built with Next.js 16, Supabase, and TypeScript.

## Features

- **Certificate Verification**: Verify certificates using unique codes or QR codes
- **Admin Dashboard**: Manage certificates, programs, and authentication
- **Certificate Generation**: Export certificates as PDF or PNG
- **Real-time Updates**: Powered by Supabase for instant data synchronization
- **Responsive Design**: Fully optimized for mobile and desktop devices
- **Secure Authentication**: Custom admin authentication with bcrypt password hashing

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Custom bcrypt-based auth system
- **PDF Generation**: jsPDF + html2canvas
- **QR Codes**: qrcode library
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ or Bun
- Supabase account and project
- Vercel account (for deployment)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Authentication
ADMIN_DEFAULT_PASSWORD=your_secure_password
\`\`\`

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/bibeksah-dev/nexalaris-cert-verify-website-build.git
cd nexalaris-cert-verify-website-build
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
bun install
\`\`\`

3. Set up the database:
   - Run the SQL scripts in the `scripts/` folder in order
   - Connect your Supabase project in the v0 interface or manually

4. Start the development server:
\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

Run these SQL scripts in your Supabase SQL editor in order:

1. `001-create-tables.sql` - Creates the database schema
2. `002-seed-data.sql` - Seeds initial data (optional)

## Admin Access

- Navigate to `/admin/login`
- Default password: Set via `ADMIN_DEFAULT_PASSWORD` env variable
- Change password after first login from `/admin/dashboard`

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

### Environment Configuration

Ensure all production environment variables are set:
- Use production Supabase credentials
- Set `NEXT_PUBLIC_SITE_URL` to your production domain
- Change `ADMIN_DEFAULT_PASSWORD` to a secure password

## Security Best Practices

- Never commit `.env` files to version control
- Use strong passwords for admin authentication
- Enable Row Level Security (RLS) in Supabase
- Keep dependencies updated regularly
- Use HTTPS in production

## Performance Optimizations

- Image optimization enabled by default
- Static assets cached with proper headers
- Database queries optimized with proper indexes
- Client-side PDF generation for better performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Nexalaris Tech Private Limited.

## Support

For support, contact: support@nexalaris.com

---

Built with [v0.app](https://v0.app) | Deployed on [Vercel](https://vercel.com)
