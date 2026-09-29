import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configFromEnv, type SnailPayConfig } from './snailpay/config.js';
import { buildResponse } from './snailpay/response.js';
import { createSnailPayRouter } from './snailpay/routes.js';

export interface AppOptions {
  snailpay?: SnailPayConfig;
}

/** Errores fuera de la ruta (JSON mal formado, cuerpo muy grande) también salen con la forma de SnailPay. */
function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status =
    typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number'
      ? err.status
      : 500;

  if (status >= 400 && status < 500) {
    res.status(status).json(buildResponse(undefined, 'rejected', 'invalid_request'));
    return;
  }
  // Solo se registra el mensaje: el error puede traer el cuerpo de la petición (datos de tarjeta).
  console.error('Error interno:', err instanceof Error ? err.message : 'desconocido');
  res.status(500).json(buildResponse(undefined, 'error', 'system_unavailable'));
}

export function createApp(options: AppOptions = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/snailpay', createSnailPayRouter(options.snailpay ?? configFromEnv()));
  app.use(errorHandler);

  return app;
}