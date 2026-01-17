import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  if (messages.some((msg) => !msg.role || !msg.content)) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  next();
};
