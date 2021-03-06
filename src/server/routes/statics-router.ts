import path from 'path';
import express from 'express';
import { Router } from 'express';
import { IS_DEV, WEBPACK_PORT } from '../config';

export function staticsRouter() {
  const router = Router();
  
  if (IS_DEV) {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    router.use(
      '/statics',
      createProxyMiddleware({
        target: `http://localhost:${WEBPACK_PORT}/`,
      }),
    );
  } else {
    const staticsPath = path.join(process.cwd(), 'dist', 'statics');

    router.use('/statics', express.static(staticsPath));
  }
  return router;
}
