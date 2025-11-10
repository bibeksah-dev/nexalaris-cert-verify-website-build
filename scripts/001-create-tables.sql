-- Create certificate status enum
CREATE TYPE cert_status AS ENUM ('VALID', 'EXPIRED', 'REVOKED');

-- Admin authentication table
CREATE TABLE IF NOT EXISTS admin_auth (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on programs slug
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_code TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  holder_email TEXT,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  status cert_status NOT NULL DEFAULT 'VALID',
  achievements_markdown TEXT NOT NULL,
  signature_hash TEXT,
  pdf_url TEXT,
  png_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes on certificates
CREATE INDEX IF NOT EXISTS idx_certificates_cert_code ON certificates(cert_code);
CREATE INDEX IF NOT EXISTS idx_certificates_program_id ON certificates(program_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
