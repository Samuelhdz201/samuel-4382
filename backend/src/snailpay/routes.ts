import express from 'express';
import type { SnailPayConfig } from './config.js';
import { buildResponse } from './response.js';
import { decideCharge } from './rules.js';
import { validatePaymentRequest } from './validation.js';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createSnailPayRouter(config: SnailPayConfig) {
  const router = express.Router();

  router.post('/v1/payments', async (req, res) => {
    // Sistema caído: nunca se valida ni se aprueba nada.
    if (config.mode === 'down') {
      res.status(503).json(buildResponse(req.body, 'error', 'system_unavailable'));
      return;
    }

    // Sistema lento: responde bien, pero tarde (sirve para probar el timeout del cliente).
    if (config.mode === 'slow') await wait(config.slowDelayMs);

    const validation = validatePaymentRequest(req.body);
    if (!validation.ok) {
      res.status(422).json(buildResponse(req.body, 'rejected', validation.detail));
      return;
    }

    const decision = decideCharge(validation.data);
    res
      .status(decision.status === 'approved' ? 201 : 402)
      .json(buildResponse(req.body, decision.status, decision.detail));
  });

  return router;
}