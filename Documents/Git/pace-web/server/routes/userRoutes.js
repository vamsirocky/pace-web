import express from "express";
import { signup, login } from "../controllers/authController.js";
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile/:id", authenticate, getProfile);
router.get('/profile/:user_id', getProfile);
router.put('/profile/:user_id', updateProfile);
router.get('/profile/:user_id', authenticate, getProfile);

export default router;

















