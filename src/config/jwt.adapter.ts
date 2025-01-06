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

    async validateToken<T>(token: string): Promise<T | null> {
        return new Promise((resolve) => {
            jwt.verify(token, this.secret, (err, decoded) => {
                if (err) return resolve(null);
                resolve(decoded as T);
            });
        })
    }
}