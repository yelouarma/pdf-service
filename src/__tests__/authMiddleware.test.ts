import { requireInternalKey } from '../middleware/authMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('requireInternalKey', () => {
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    const originalEnv = process.env;

    function createReq(path: string, headers: Record<string, string> = {}): Partial<Request> {
        return { path, headers } as Partial<Request>;
    }

    beforeEach(() => {
        process.env = { ...originalEnv, INTERNAL_API_KEY: 'test-secret-key' };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should call next() for /health path', () => {
        const mockReq = createReq('/health');

        requireInternalKey(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when X-Internal-Key is missing', () => {
        const mockReq = createReq('/internal/generate');

        requireInternalKey(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('Unauthorized') })
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when X-Internal-Key is invalid', () => {
        const mockReq = createReq('/internal/generate', { 'x-internal-key': 'wrong-key' });

        requireInternalKey(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('Unauthorized') })
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when X-Internal-Key matches', () => {
        const mockReq = createReq('/internal/generate', { 'x-internal-key': 'test-secret-key' });

        requireInternalKey(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });
});
