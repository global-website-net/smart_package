import { verifySupabaseConfig } from '../dist/lib/verify-supabase-config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Run the verification
verifySupabaseConfig()
  .then(success => {
    if (!success) {
      console.error('❌ Supabase configuration verification failed');
      process.exit(1);
    }
    console.log('✅ Supabase configuration verified successfully');
  })
  .catch(error => {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }); 