import { readFileSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';

const envPath = resolve(process.cwd(), '.env');
let mode = 'dev';

try {
  const content = readFileSync(envPath, 'utf-8');
  const match = content.match(/MODE\s*=\s*(\w+)/);
  if (match) {
    const value = match[1].trim().toLowerCase();
    mode = value === 'production' ? 'prod' : 'dev';
  }
} catch {
  // .env missing or unreadable: default to dev
}

const args = process.argv.slice(2);
const viteArgs = ['vite', '--mode', mode, ...args];
const child = spawn('npx', viteArgs, { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
