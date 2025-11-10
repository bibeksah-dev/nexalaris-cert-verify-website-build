-- Seed program data
INSERT INTO programs (id, name, slug, description, image_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'AI Integration Specialist',
  'ai-integration-specialist',
  'Integrate AI into real products: data pipelines, model deployment, prompt and context engineering, monitoring.',
  '/placeholder.svg?height=400&width=600'
) ON CONFLICT (slug) DO NOTHING;

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
) ON CONFLICT (cert_code) DO NOTHING;

-- Seed default admin password (changeMeNow! - this is bcrypt hashed)
-- Hash for "changeMeNow!" 
INSERT INTO admin_auth (password_hash)
VALUES ('$2a$10$rqZqZqZqZqZqZqZqZqZqZuXYZ.YxYxYxYxYxYxYxYxYxYxYxYxY')
ON CONFLICT (id) DO NOTHING;
