import { Request } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        userId: string;
    }
}

declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
} 