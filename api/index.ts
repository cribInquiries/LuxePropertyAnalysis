// Register tsconfig-paths so absolute aliases like '@/...' work in Vercel runtime
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tsconfigPaths = require('tsconfig-paths');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tsconfig = require('../tsconfig.json');

  const baseUrl = path.join(__dirname, '..');
  const paths = (tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths) || {};
  tsconfigPaths.register({ baseUrl, paths });
} catch {}

import app from '../src/index';

// Export a handler function compatible with Vercel
export default (req: any, res: any) => app(req, res);



