import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { deleteNotifications, getAllNotifications, getUnreadCount, getUnreadNotifications, markAllNotificationAsRead, markNotificationAsRead } from "../controllers/notificationControllers.js";
import activityLogMiddleware from "../middleware/logActivityMiddleware.js";

const router = Router();

router.get("/getAllNotifications", authMiddleware, getAllNotifications);
router.get("/getUnreadNotifications", authMiddleware, getUnreadNotifications);
router.get("/getUnreadCount", authMiddleware, getUnreadCount);
router.patch("/markAsRead/:notificationId", authMiddleware, markNotificationAsRead); //This is not in use

router.patch("/markAllRead", authMiddleware, markAllNotificationAsRead);
router.delete("/deleteNotifications", authMiddleware, activityLogMiddleware({
    action: "DELETE_NOTIFICATION",
    category: "NOTIFICATION",
    description: "notification deleted"
}), deleteNotifications);

export default router