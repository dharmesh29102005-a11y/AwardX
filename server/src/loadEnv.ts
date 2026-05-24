import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

let loaded = false;

/** Load root `.env` / `.env.local` once (Vercel injects env in production). */
export function loadRootEnv() {
  if (loaded) return;
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });
  dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });
  loaded = true;
}
