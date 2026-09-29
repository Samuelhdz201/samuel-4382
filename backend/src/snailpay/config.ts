export type SnailPayMode = 'normal' | 'down' | 'slow';

export interface SnailPayConfig {
  mode: SnailPayMode;
  slowDelayMs: number;
}

const MODES: readonly SnailPayMode[] = ['normal', 'down', 'slow'];
const DEFAULT_SLOW_DELAY_MS = 15_000;

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): SnailPayConfig {
  const mode = env.SNAILPAY_MODE ?? 'normal';
  if (!MODES.includes(mode as SnailPayMode))
    throw new Error(`SNAILPAY_MODE inválido: "${mode}". Usa normal, down o slow.`);

  const delay = Number(env.SNAILPAY_SLOW_DELAY_MS ?? DEFAULT_SLOW_DELAY_MS);
  return {
    mode: mode as SnailPayMode,
    slowDelayMs: Number.isFinite(delay) && delay >= 0 ? delay : DEFAULT_SLOW_DELAY_MS,
  };
}