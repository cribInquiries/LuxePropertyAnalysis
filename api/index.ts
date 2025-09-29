// Register tsconfig-paths so absolute aliases like '@/...' work in Vercel runtime
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('tsconfig-paths/register');
} catch {}
import app from '../src/index';

export default app;


