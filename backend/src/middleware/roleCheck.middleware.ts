import { Request, Response, NextFunction } from 'express';
import { IAdmin } from '../models/Admin';

interface AuthRequest extends Request {
  admin?: IAdmin;
}

type AdminRole = 'super-admin' | 'admin' | 'moderator';

// Check if admin has required role
export const requireRole = (allowedRoles: AdminRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(admin.role as AdminRole)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient privileges.',
        required: allowedRoles,
        current: admin.role,
      });
    }

    next();
  };
};

// Check if admin is super-admin
export const requireSuperAdmin = requireRole(['super-admin']);

// Check if admin is super-admin or admin
export const requireAdminOrAbove = requireRole(['super-admin', 'admin']);

// Check if admin is any role (just authenticated)
export const requireAnyAdmin = requireRole(['super-admin', 'admin', 'moderator']);
