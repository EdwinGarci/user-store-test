import jwt from 'jsonwebtoken';

export class JwtAdapter {
    private secret: string;

    constructor(secret: string) {
        if (!secret) {
            throw new Error('JWT secret is required');
        }
        this.secret = secret;
    }

    async generateToken(payload: any, duration: string = '1h') {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, this.secret, {expiresIn: duration}, (err, token) => {
                if (err || !token) return reject(err);
                resolve(token);
            });
        });
    }

    async validateToken(token: string) {
        throw new Error('Method not implemented.');
        return;
    }
}