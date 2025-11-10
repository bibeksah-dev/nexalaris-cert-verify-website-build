import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase connection...\n');

// Test 1: Check admin_auth table
console.log('1️⃣ Checking admin_auth table...');
const { data: adminData, error: adminError } = await supabase
  .from('admin_auth')
  .select('*')
  .limit(1);

if (adminError) {
  console.error('❌ admin_auth table error:', adminError.message);
  console.error('   Error details:', JSON.stringify(adminError, null, 2));
  if (adminError.code === '42P01') {
    console.error('   → Table does not exist! Need to run migration scripts.');
  }
} else {
  console.log('✅ admin_auth table exists');
  console.log('   Records found:', adminData?.length || 0);
  if (adminData?.length === 0) {
    console.log('   ⚠️  No admin password set yet');
  }
}

// Test 2: Check programs table
console.log('\n2️⃣ Checking programs table...');
const { data: programsData, error: programsError } = await supabase
  .from('programs')
  .select('id, name, slug')
  .limit(5);

if (programsError) {
  console.error('❌ programs table error:', programsError.message);
  console.error('   Error code:', programsError.code);
  if (programsError.code === '42P01') {
    console.error('   → Table does not exist! Need to run migration scripts.');
  }
} else {
  console.log('✅ programs table exists');
  console.log('   Records found:', programsData?.length || 0);
}

// Test 3: Check certificates table
console.log('\n3️⃣ Checking certificates table...');
const { data: certsData, error: certsError } = await supabase
  .from('certificates')
  .select('id, cert_code, holder_name')
  .limit(5);

if (certsError) {
  console.error('❌ certificates table error:', certsError.message);
  console.error('   Error code:', certsError.code);
  if (certsError.code === '42P01') {
    console.error('   → Table does not exist! Need to run migration scripts.');
  }
} else {
  console.log('✅ certificates table exists');
  console.log('   Records found:', certsData?.length || 0);
}

console.log('\n✨ Database connection test complete!');

if (adminError || programsError || certsError) {
  console.log('\n💡 Next steps:');
  console.log('   1. Run the SQL migration scripts in your Supabase dashboard');
  console.log('   2. Or use psql to run scripts/001-create-tables.sql');
  process.exit(1);
}
