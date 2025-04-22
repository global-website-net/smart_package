// Vercel build script to ensure database tables are created
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// Step 1: Generate Prisma client
console.log('Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}

// Step 2: Apply database schema directly
console.log('Applying database schema...');
try {
  // Create a temporary script to apply the schema
  const schemaPath = path.join(__dirname, 'prisma', 'direct-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Create a temporary file with the schema
  const tempFile = path.join(__dirname, 'temp-schema.sql');
  fs.writeFileSync(tempFile, schema);
  
  // Execute the schema using psql
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Extract connection details from the URL
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port || '5432';
  const database = url.pathname.substring(1);
  const user = url.username;
  const password = url.password;
  
  // Set environment variables for psql
  process.env.PGPASSWORD = password;
  
  // Execute the schema
  execSync(`psql -h ${host} -p ${port} -d ${database} -U ${user} -f ${tempFile}`, { 
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: password }
  });
  
  // Clean up
  fs.unlinkSync(tempFile);
  
  console.log('Database schema applied successfully');
} catch (error) {
  console.error('Error applying database schema:', error);
  process.exit(1);
}

// Step 3: Build Next.js application
console.log('Building Next.js application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Next.js application built successfully');
} catch (error) {
  console.error('Error building Next.js application:', error);
  process.exit(1);
}

console.log('Vercel build process completed successfully'); 