-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS admin_auth CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS cert_status CASCADE;

-- Now recreate everything fresh
-- Create certificate status enum
CREATE TYPE cert_status AS ENUM ('VALID', 'EXPIRED', 'REVOKED');

-- Admin authentication table
CREATE TABLE admin_auth (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs table (no level column)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on programs slug
CREATE INDEX idx_programs_slug ON programs(slug);

-- Certificates table
CREATE TABLE certificates (
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
CREATE INDEX idx_certificates_cert_code ON certificates(cert_code);
CREATE INDEX idx_certificates_program_id ON certificates(program_id);
CREATE INDEX idx_certificates_status ON certificates(status);

-- Seed program data
INSERT INTO programs (id, name, slug, description, image_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'AI Integration Specialist',
  'ai-integration-specialist',
  'Integrate AI into real products: data pipelines, model deployment, prompt and context engineering, monitoring.',
  '/placeholder.svg?height=400&width=600'
);

-- Seed sample certificate
INSERT INTO certificates (
  cert_code,
  holder_name,
  holder_email,
  program_id,
  issued_at,
  expires_at,
  status,
  achievements_markdown,
  signature_hash
)
VALUES (
  'VC-2025-000001',
  'Asha Rai',
  'asha@example.com',
  '11111111-1111-1111-1111-111111111111',
  '2025-11-10T00:00:00Z',
  '2027-11-10T00:00:00Z',
  'VALID',
  E'- Built an AI automation pipeline\n- Deployed a model-backed API on cloud\n- Completed ethical AI compliance\n- Passed final capstone with distinction',
  'sha256:samplehashseed'
);

-- Set up default admin password
-- You'll need to hash the actual default password from ADMIN_DEFAULT_PASSWORD env var
-- For now, this creates an empty record that will be populated on first login attempt
INSERT INTO admin_auth (password_hash)
VALUES ('$2a$10$placeholder.hash.will.be.replaced.on.first.login')
ON CONFLICT (id) DO NOTHING;
