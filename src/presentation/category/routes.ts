import { Router } from 'express';
import { CategoryController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { envs, JwtAdapter } from '../../config';
import { CategoryService } from '../services/category.service';

export class CategoryRoutes {

    static get routes(): Router {
        const router = Router();
        const categoryService = new CategoryService();
        const jwtAdapter = new JwtAdapter(envs.JWT_SEED);
        const authMiddleware = new AuthMiddleware(jwtAdapter);

        const controller = new CategoryController(categoryService);
        // Definir las rutas
        router.get('/', controller.getCategories);
        router.post('/', [authMiddleware.validateJWT.bind(authMiddleware)], controller.createCategory);

        return router;
    }


}

