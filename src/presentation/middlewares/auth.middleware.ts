import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {
    // Si no necesitas DI, entonces se puede hacer static
    private jwtAdapter: JwtAdapter;
    constructor(jwtAdapter: JwtAdapter) {
        this.jwtAdapter = jwtAdapter;
    }

    async validateJWT(req: Request, res: Response, next: NextFunction) {
        const authorization = req.header('Authorization');
        if (!authorization)  return res.status(401).json({ error: 'No token provided' });
        if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid token' });
        
        const token = authorization.split(' ').at(1) || '';
        try {
            const payload = await this.jwtAdapter.validateToken<{id: string}>(token);
            if (!payload) return res.status(401).json({ error: 'Invalid token' });
            
            const user = await UserModel.findById(payload.id);
            if (!user) return res.status(401).json({ error: 'Invalid token' });

            req.body.user = UserEntity.fromObject(user);
            next();
        } catch (error) {
            // Se puede usar Winston o un Logger para loggear el error
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}