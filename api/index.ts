// Vercel Node.js entrypoint without Express. Minimal router.
import url from 'url';

type Handler = (req: RequestLike, res: ResponseLike) => Promise<void> | void;

interface RequestLike {
  method: string;
  pathname: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
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
    '/': async (_req, res) => {
      res.json({ name: 'Luxe Property Analysis API', status: 'online' });
    },
  },
};

export default async function handler(req: any, res: any) {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '/';
  const method = (req.method || 'GET').toUpperCase();
  const body = await parseBody(req);

  const requestLike: RequestLike = {
    method,
    pathname,
    query: (parsed.query as any) || {},
    headers: req.headers || {},
    body,
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



