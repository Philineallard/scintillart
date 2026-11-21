// Bundles scripts/worker-entry.ts into dist/_worker.js for the Cloudflare dashboard upload
// (drag and drop does not compile functions/). Run after `npm run build`.
// esbuild is not a project dependency: `npx esbuild` fetches it on demand.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

execFileSync(
  'npx',
  [
    '--yes',
    'esbuild@0.25',
    'scripts/worker-entry.ts',
    '--bundle',
    '--format=esm',
    '--platform=neutral',
    '--target=es2022',
    '--minify',
    '--outfile=dist/_worker.js',
  ],
  { stdio: 'inherit' },
)

writeFileSync(
  'dist/_routes.json',
  JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }, null, 2) + '\n',
)
console.log('wrote dist/_worker.js and dist/_routes.json')
