import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '../types';
import UserModel from '../models/User';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: UserModel | false, _info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new AuthenticationError('Authentication required'));
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
};

export const isCustomer = authorize(UserRole.CUSTOMER);
export const isAgent = authorize(UserRole.AGENT);
export const isAdmin = authorize(UserRole.ADMIN);
export const isAgentOrAdmin = authorize(UserRole.AGENT, UserRole.ADMIN);
export const isCustomerOrAgent = authorize(UserRole.CUSTOMER, UserRole.AGENT);

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (_err: any, user: UserModel | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

export const checkEmailVerified = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.email_verified) {
    return next(new AuthorizationError('Email verification required'));
  }

  next();
};

export const checkAccountNotLocked = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.isAccountLocked()) {
    return next(new AuthorizationError('Account is temporarily locked due to multiple failed login attempts'));
  }

  next();
};
