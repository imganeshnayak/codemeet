import { Router, Request, Response } from 'express';

const router = Router();

router.get('/env', (req: Request, res: Response) => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.json({ openrouter: false });
  const masked = key.length > 10 ? `${key.slice(0,8)}...${key.slice(-4)}` : key;
  return res.json({ openrouter: true, key: masked });
});

export default router;
