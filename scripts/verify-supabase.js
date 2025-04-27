// This script verifies the Supabase configuration
require('dotenv').config();

async function main() {
  console.log('Verifying Supabase configuration...');
  
  // Import the verification function
  const { verifySupabaseConfig } = require('../src/lib/verify-supabase-config');
  
  try {
    const result = await verifySupabaseConfig();
    
    if (result) {
      console.log('✅ Supabase configuration is valid');
      process.exit(0);
    } else {
      console.error('❌ Supabase configuration is invalid');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error verifying Supabase configuration:', error);
    process.exit(1);
  }
}

main(); 