import { spawnSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'EthioAgri';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (repo.endsWith('.github.io') ? '' : `/${repo}`);
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath, NEXT_TELEMETRY_DISABLED: '1' },
});
process.exit(result.status ?? 1);
