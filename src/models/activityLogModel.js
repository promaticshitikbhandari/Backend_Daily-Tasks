import { Schema, model } from "mongoose";

const activityLogSchema = new Schema ({
    actorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    actorRole: {
        type: String,
        enum: ["user", "admin", "system"],
        required: true
    },
    action: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    targetId: Schema.Types.ObjectId,
    oldValues: Object,
    newValues: Object,
    ipAddress: String,
    userAgent: String,

}, {timestamps: true});

export const ActivityLog = model("ActivityLog", activityLogSchema);