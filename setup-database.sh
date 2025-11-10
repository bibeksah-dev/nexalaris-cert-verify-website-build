#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Nexalaris Certificate Verification - Database Setup Script
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Nexalaris Certificate Verification Database Setup         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
    echo "✓ Environment variables loaded from .env.local"
else
    echo "✗ Error: .env.local file not found"
    exit 1
fi

# Check required environment variables
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DATABASE" ]; then
    echo "✗ Error: Missing required environment variables"
    echo "  Required: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE"
    exit 1
fi

echo "✓ Database connection details verified"
echo ""
echo "Host: $POSTGRES_HOST"
echo "User: $POSTGRES_USER"
echo "Database: $POSTGRES_DATABASE"
echo ""

# Test connection
echo "→ Testing database connection..."
export PGPASSWORD="$POSTGRES_PASSWORD"

if ! psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✗ Error: Could not connect to database"
    echo "  Please check your connection details and network connectivity"
    exit 1
fi

echo "✓ Database connection successful"
echo ""

# Run migration scripts
echo "════════════════════════════════════════════════════════════"
echo "Running migration scripts..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Script 1: Create tables
echo "→ Running 001-create-tables.sql..."
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f scripts/001-create-tables.sql
echo "✓ Tables created successfully"
echo ""

# Script 2: Seed data
echo "→ Running 002-seed-data.sql..."
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f scripts/002-seed-data.sql
echo "✓ Seed data inserted successfully"
echo ""

# Script 3: Add program description
if [ -f scripts/003-add-program-description.sql ]; then
    echo "→ Running 003-add-program-description.sql..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f scripts/003-add-program-description.sql 2>/dev/null || echo "  (Skipped - column may already exist)"
    echo ""
fi

# Script 4: Add missing program columns
if [ -f scripts/004-add-missing-program-columns.sql ]; then
    echo "→ Running 004-add-missing-program-columns.sql..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f scripts/004-add-missing-program-columns.sql 2>/dev/null || echo "  (Skipped - columns may already exist)"
    echo ""
fi

# Script 5: Remove file storage columns
if [ -f scripts/005-remove-file-storage-columns.sql ]; then
    echo "→ Running 005-remove-file-storage-columns.sql..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f scripts/005-remove-file-storage-columns.sql 2>/dev/null || echo "  (Skipped - columns may not exist)"
    echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "Verifying database setup..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Check tables
echo "→ Checking tables..."
TABLES=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" | grep -v '^$' | wc -l)
echo "✓ Found $TABLES tables in public schema"
echo ""

# Check admin_auth
ADMIN_COUNT=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -t -c "SELECT COUNT(*) FROM admin_auth;")
echo "✓ admin_auth table: $ADMIN_COUNT record(s)"

# Check programs
PROGRAM_COUNT=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -t -c "SELECT COUNT(*) FROM programs;")
echo "✓ programs table: $PROGRAM_COUNT record(s)"

# Check certificates
CERT_COUNT=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -t -c "SELECT COUNT(*) FROM certificates;")
echo "✓ certificates table: $CERT_COUNT record(s)"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✓ Database setup completed successfully!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Default admin password: ${ADMIN_DEFAULT_PASSWORD:-changeMeNow!}"
echo ""
echo "You can now start the application with: npm run dev"
echo ""
