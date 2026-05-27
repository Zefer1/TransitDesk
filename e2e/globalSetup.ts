import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
    const serverDir = path.resolve(import.meta.dirname, '../server');
    execSync('npm run seed:test', { cwd: serverDir, stdio: 'inherit' });
}
