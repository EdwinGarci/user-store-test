import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService, EmailService } from '../services';
import { JwtAdapter, envs } from '../../config';
import { UserModel } from '../../data';

export class AuthRoutes {

    static get routes(): Router {
        const router = Router();

        const jwtAdapter = new JwtAdapter(envs.JWT_SEED);
        const emailService = new EmailService(
            envs.MAILER_SERVICE,
            envs.MAILER_EMAIL,
            envs.MAILER_SECRET_KEY,
        );
        const baseWebServiceUrl = envs.WEBSERVICE_URL;
        const authService = new AuthService(jwtAdapter, emailService, baseWebServiceUrl);
        const controller = new AuthController(authService);

        // Definir las rutas
        router.post('/login', controller.loginUser);
        router.post('/register', controller.registerUser);
        router.get('/validate-email/:token', controller.validateEmail);

        return router;
    }


}

