import { ActivityLog } from "../models/activityLogModel.js";

export const logActivity = async ({
    actorId,
    actorRole,
    action,
    category,
    description,
    targetId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
}) => {
    await ActivityLog.create({
    actorId,
    actorRole,
    action,
    category,
    description,
    targetId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    });
};