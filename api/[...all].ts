import { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create the Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routes
let isSetup = false;
async function setupApp() {
  if (!isSetup) {
    await registerRoutes(app);
    isSetup = true;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await setupApp();
  
  // Convert IncomingMessage to Express request
  const expressReq = req as any;
  expressReq.url = req.url?.replace('/api', '') || '/';
  expressReq.method = req.method;
  expressReq.headers = req.headers;
  
  // Convert ServerResponse to Express response
  const expressRes = res as any;
  
  return new Promise((resolve) => {
    expressRes.on('finish', resolve);
    app(expressReq, expressRes);
  });
}
