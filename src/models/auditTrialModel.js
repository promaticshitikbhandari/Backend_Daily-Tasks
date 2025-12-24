import { Schema, model } from "mongoose";

const auditTrialSchema = new Schema (
    {
        entityType: {
            type: String
        },
        entityId: Schema.Types.ObjectId,
        action: {
            type: String,
            enum: ["UPDATE", "DELETE"]
        },
        changedBy: Schema.Types.ObjectId,
        oldValues: Object,
        newValues: Object

    }, {timestamps: true}
);

export const AuditTrial = model("AuditTrial", auditTrialSchema);