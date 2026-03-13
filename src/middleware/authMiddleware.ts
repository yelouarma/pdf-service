import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates X-Internal-Key header against INTERNAL_API_KEY env var.
 * Applied globally to all routes except /health.
 */
export function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
    // Skip auth for health check
    if (req.path === '/health') {
        next();
        return;
    }

    const apiKey = req.headers['x-internal-key'];
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        res.status(401).json({ error: 'Unauthorized: missing or invalid X-Internal-Key' });
        return;
    }

    next();
}
