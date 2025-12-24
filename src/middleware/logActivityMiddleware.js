import { logActivity } from "../services/activityLog.services.js";

const activityLogMiddleware = ({action, category, description, }) => {
    return (req, res, next) => {
        try {
            res.on("finish", async () => {
                //log only if request succeeded (2xx)
                if( res.statusCode >=200 && res.statusCode < 300) {
                    await logActivity({
                        actorId: req.user?._id || null,
                        actorRole: req.user?.role || "system",
                        action,
                        category,
                        description,
                        targetId: req.params?.id || null,
                        oldValues: null,
                        newValues: null,
                        ipAddress: req.ip,
                        userAgent: req.headers["user-agent"]
                    });
                }
            });
            next();
            
        } catch (error) {
            next();
        }
    }
};

export default activityLogMiddleware;