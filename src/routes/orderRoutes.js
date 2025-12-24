import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allOrders, cancelOrderByUser, myOrders, mysingleOrder, placeOrder, updateOrderStatus } from "../controllers/orderController.js";
import { roleBasedAuth } from "../middleware/roleBasedAccessMiddleware.js";
import activityLogMiddleware from "../middleware/logActivityMiddleware.js";

const router = Router();

router.post("/placeOrders", authMiddleware, activityLogMiddleware({
    action: "ORDER_PLACED",
    category: "ORDER",
    description: "New Order is placed"
}), placeOrder);

router.get("/myOrders", authMiddleware, myOrders);
router.get("/singleOrder/:id", authMiddleware, mysingleOrder);

//admin route
router.get("/allOrders", authMiddleware, roleBasedAuth(["admin"]), allOrders);
router.patch("/updateOrderStatus/:orderId", authMiddleware, roleBasedAuth(["admin"]), updateOrderStatus);
router.patch("/cancelOrder/:orderId", authMiddleware, cancelOrderByUser)

export default router