import { type Request, type Response, type NextFunction } from 'express';
import { type User } from '@shared/schema';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user as User).role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' });
  }
};
