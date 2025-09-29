// Vercel Node.js entrypoint without Express. Minimal router.
import url from 'url';
import { AuthController } from '../src/controllers/AuthController';
import { PropertyController } from '../src/controllers/PropertyController';
import { AnalysisController } from '../src/controllers/AnalysisController';

type Handler = (req: RequestLike, res: ResponseLike) => Promise<void> | void;

interface RequestLike {
  method: string;
  pathname: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  params?: Record<string, string>;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (data: any) => void;
  send: (data: any) => void;
}

async function parseBody(req: any): Promise<any> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : undefined);
      } catch (e) {
        resolve(undefined);
      }
    });
    req.on('error', reject);
  });
}

function createResponse(res: any): ResponseLike {
  let statusCode = 200;
  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: any) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    },
    send(payload: any) {
      res.statusCode = statusCode;
      if (typeof payload === 'object') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      } else {
        res.end(String(payload));
      }
    },
  };
}

const routes: Record<string, Record<string, Handler>> = {
  GET: {
    '/health': async (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    },
    '/api/v1/health': async (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
    },
    '/': async (_req, res) => {
      res.json({ name: 'Luxe Property Analysis API', status: 'online' });
    },
  },
  POST: {},
};

// Thin adapters to call existing controllers
const authController = new AuthController();
const propertyController = new PropertyController();
const analysisController = new AnalysisController();

function toExpressLike(req: RequestLike, res: ResponseLike) {
  const expressReq: any = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    params: req.params || {},
    query: req.query || {},
  };
  const expressRes: any = {
    status(code: number) {
      res.status(code);
      return this;
    },
    json(payload: any) {
      res.json(payload);
    },
    send(payload: any) {
      res.send(payload);
    },
  };
  const next = (err?: any) => {
    if (err) {
      res.status(err.statusCode || 500).json({ success: false, error: { message: err.message || 'Internal Error' } });
    }
  };
  return { expressReq, expressRes, next };
}

// Register auth endpoints
routes.POST['/api/v1/auth/register'] = async (req, res) => {
  const { expressReq, expressRes, next } = toExpressLike(req, res);
  await authController.register(expressReq, expressRes, next);
};

routes.POST['/api/v1/auth/login'] = async (req, res) => {
  const { expressReq, expressRes, next } = toExpressLike(req, res);
  await authController.login(expressReq, expressRes, next);
};

// Properties endpoints (minimal)
routes.GET['/api/v1/properties'] = async (req, res) => {
  const { expressReq, expressRes, next } = toExpressLike(req, res);
  await propertyController.getProperties(expressReq, expressRes, next);
};

routes.GET['/api/v1/properties/:id'] = async (req, res) => {
  const { expressReq, expressRes, next } = toExpressLike(req, res);
  const match = req.pathname.match(/^\/api\/v1\/properties\/([^/]+)$/);
  expressReq.params = { id: match ? match[1] : '' };
  await propertyController.getProperty(expressReq, expressRes, next);
};

// Analysis public list
routes.GET['/api/v1/analysis/public'] = async (req, res) => {
  const { expressReq, expressRes, next } = toExpressLike(req, res);
  await analysisController.getPublicAnalyses(expressReq, expressRes, next);
};

export default async function handler(req: any, res: any) {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '/';
  const method = (req.method || 'GET').toUpperCase();
  const body = await parseBody(req);
  // basic param extraction for routes like /api/v1/properties/:id
  const params: Record<string, string> = {};

  const requestLike: RequestLike = {
    method,
    pathname,
    query: (parsed.query as any) || {},
    headers: req.headers || {},
    body,
    params,
  };
  const responseLike = createResponse(res);

  const match = routes[method]?.[pathname];
  if (match) {
    try {
      await match(requestLike, responseLike);
    } catch (e: any) {
      responseLike.status(500).json({ success: false, error: { message: e?.message || 'Internal Error' } });
    }
    return;
  }

  responseLike.status(404).json({ success: false, error: { message: 'Not Found' } });
}



