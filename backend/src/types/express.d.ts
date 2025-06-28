// types/express.d.ts
import { Request } from 'express';

export interface AuthPayload {
  id: string;
  role: 'ADMIN' | 'AUTHOR' | 'RETAIL';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}
