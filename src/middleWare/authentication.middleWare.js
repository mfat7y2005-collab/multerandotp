import jwt from 'jsonwebtoken';
import userModel from '../DB/models/user.model.js';
import * as redisService from '../DB/redis/redis.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lol';

// ================= AUTHENTICATION =================
export const auth = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      // 1. Check token existence
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return next(new Error("Token required", { cause: 400 }));
      }

      // 2. Extract token
      const token = authorization.split(" ")[1];

      // 3. Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded?.id) {
        return next(new Error("Invalid token", { cause: 400 }));
      }

      // 4. Check revoke (Redis)
      if (decoded.jti) {
        const isRevoked = await redisService.get(`revoked_token:${decoded.jti}`);
        if (isRevoked) {
          return next(new Error("Token has been revoked", { cause: 401 }));
        }
      }

      // 5. Get user
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found", { cause: 404 }));
      }

      // 6. Check logout (change credentials)
      if (
        user.changeCredentialTime &&
        user.changeCredentialTime.getTime() / 1000 > decoded.iat
      ) {
        return next(new Error("Session expired, please login again", { cause: 401 }));
      }

      // 7. Check user status
      if (user.isDeleted || user.status === 'blocked') {
        return next(new Error("User account is disabled", { cause: 403 }));
      }

      // 8. Attach user to request
      req.user = user;
      req.decoded = decoded;

      next();
    } catch (err) {
      next(new Error("Authentication failed", { cause: 401 }));
    }
  };
};

// ================= AUTHORIZATION =================
export const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new Error("Unauthorized", { cause: 401 }));
      }

      if (!roles.includes(req.user.role)) {
        return next(new Error("Forbidden: Access denied", { cause: 403 }));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};