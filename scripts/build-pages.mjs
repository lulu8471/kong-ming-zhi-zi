import { spawnSync } from 'node:child_process';
import { cpSync, rmSync, writeFileSync } from 'node:fs';

// GitHub project Pages uses the repository name as its path prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/kong-ming-zhi-zi';
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath, NEXT_TELEMETRY_DISABLED: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
rmSync('docs', { recursive: true, force: true });
cpSync('out', 'docs', { recursive: true });
writeFileSync('docs/.nojekyll', '');
console.log('GitHub Pages files prepared in docs/.');
