import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../models';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';

// hack typescript a little bit
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

namespace Middleware {
    export function useToken(request: Request): string[] {
        const authorization = request.headers.authorization;
        if (!authorization) {
            throw new Error('invalid authorization');
        } else {
            return authorization.split(/\s+/);
        }
    }
    
    export function protectedByUser(req: Request, res: Response, next: NextFunction) {
        try {
            const [_, token] = useToken(req);
            req.user = <IUser>jwt.verify(token, config.JWT_SECRET); 
            return next();
        } catch (error) {
            res.status(403).send({ message: error.message });
        }
    }
}

export default Middleware;
