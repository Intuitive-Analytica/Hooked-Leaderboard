import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import logger from '../utils/logger';

interface AuditRequest extends Request {
  user?: any;
  auditStartTime?: number;
}

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

const sanitizeData = (data: any): any => {
  if (!data) return data;

  const sanitized = { ...data };

  SENSITIVE_FIELDS.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

const determineResourceInfo = (path: string, method: string): { resource: string; action: string } => {
  const pathParts = path.split('/').filter(p => p);

  if (path.includes('/auth/login')) return { resource: 'authentication', action: 'login' };
  if (path.includes('/auth/logout')) return { resource: 'authentication', action: 'logout' };
  if (path.includes('/auth/refresh')) return { resource: 'authentication', action: 'token_refresh' };

  if (path.includes('/leaderboard')) {
    if (method === 'GET') return { resource: 'leaderboard', action: 'view' };
    if (method === 'POST') return { resource: 'leaderboard', action: 'create' };
    if (method === 'PUT') return { resource: 'leaderboard', action: 'update' };
    if (method === 'DELETE') return { resource: 'leaderboard', action: 'delete' };
  }

  if (path.includes('/agents')) {
    if (method === 'GET') return { resource: 'agent', action: 'view' };
    if (method === 'POST') return { resource: 'agent', action: 'create' };
    if (method === 'PUT') return { resource: 'agent', action: 'update' };
    if (method === 'DELETE') return { resource: 'agent', action: 'delete' };
  }

  if (path.includes('/sales')) {
    if (method === 'GET') return { resource: 'sale', action: 'view' };
    if (method === 'POST') return { resource: 'sale', action: 'record' };
    if (method === 'PUT') return { resource: 'sale', action: 'update' };
    if (method === 'DELETE') return { resource: 'sale', action: 'delete' };
  }

  if (path.includes('/analytics')) return { resource: 'analytics', action: 'view' };

  return { resource: pathParts[2] || 'unknown', action: method.toLowerCase() };
};

export const auditLogger = (req: AuditRequest, res: Response, next: NextFunction) => {
  req.auditStartTime = Date.now();

  const originalSend = res.send;
  const originalJson = res.json;

  const captureResponse = (body: any) => {
    const duration = Date.now() - (req.auditStartTime || Date.now());
    const { resource, action } = determineResourceInfo(req.path, req.method);

    const auditData = {
      userId: undefined,
      userEmail: undefined,
      userRole: undefined,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      action,
      resource,
      resourceId: req.params.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      requestBody: req.method !== 'GET' ? sanitizeData(req.body) : undefined,
      responseBody: res.statusCode >= 400 ? sanitizeData(body) : undefined,
      error: res.statusCode >= 400 ? body?.error || body?.message : undefined,
      duration,
      metadata: {
        query: req.query,
        headers: {
          'content-type': req.headers['content-type'],
          'accept': req.headers['accept'],
        },
      },
    };

    AuditLog.create(auditData).catch(err => {
      logger.error('Failed to create audit log:', err);
    });

    return body;
  };

  res.send = function(body: any) {
    captureResponse(body);
    return originalSend.call(this, body);
  };

  res.json = function(body: any) {
    captureResponse(body);
    return originalJson.call(this, body);
  };

  next();
};

export const criticalAuditLogger = (action: string, resource: string) => {
  return (req: AuditRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      const auditData = {
        userId: undefined,
        userEmail: undefined,
        userRole: undefined,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'],
        action,
        resource,
        resourceId: req.params.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        requestBody: sanitizeData(req.body),
        duration,
        metadata: {
          critical: true,
          timestamp: new Date(),
        },
      };

      AuditLog.create(auditData)
        .then(() => {
          logger.info(`Critical action logged: ${action} on ${resource} from IP ${req.ip}`);
        })
        .catch(err => {
          logger.error('Failed to create critical audit log:', err);
        });
    });

    next();
  };
};