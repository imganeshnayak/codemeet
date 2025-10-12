import jwt, { SignOptions, Secret } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
  const options = { expiresIn: process.env.JWT_EXPIRE || '7d' } as SignOptions;
  return jwt.sign(payload as string | object | Buffer, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret: Secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  const options = { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' } as SignOptions;
  return jwt.sign(payload as string | object | Buffer, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const secret: Secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const secret: Secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
