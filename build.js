import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        process.env[key] = value;
      }
    }
  });
  
  console.log('Environment variables loaded:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
}

try {
  // Build frontend
  console.log('Building frontend with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit', 
    env: { ...process.env },
    cwd: __dirname
  });
  // Build backend
  console.log('Building backend with esbuild...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit', 
    env: { ...process.env },
    cwd: __dirname
  });

  // Build Vercel handler
  console.log('Building Vercel handler...');
  execSync('npx esbuild vercel-handler.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/vercel-handler.js', { 
    stdio: 'inherit', 
    env: { ...process.env },
    cwd: __dirname
  });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
