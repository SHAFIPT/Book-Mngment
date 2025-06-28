import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my_very_secure_secret_key';

export const generateAccessToken = (payload: { id: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (payload: { id: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => jwt.verify(token, JWT_SECRET);
export const verifyRefreshToken = (token: string) => jwt.verify(token, JWT_SECRET);