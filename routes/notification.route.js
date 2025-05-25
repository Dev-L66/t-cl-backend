import { protectedRoute } from "../middleware/protectedRoute.js";
import {getNotifications, deleteNotifications, deleteNotification} from '../controllers/notification.controller.js'
import express from 'express';


const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
router.delete("/:id", protectedRoute, deleteNotification);

export default router;
