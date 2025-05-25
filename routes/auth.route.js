import express from 'express';
import { signupController, loginController, logoutController, getMeController } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middleware/protectedRoute.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/me',protectedRoute, getMeController);
router.post('/logout', logoutController);


export default router;
