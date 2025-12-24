import { AuditTrial } from "../models/auditTrialModel.js";

export const logAudit = async (
    {entityType, entityId, action, changedBy, oldValues, newValues}
) => {
    await AuditTrial.create({
        entityType, entityId, action, changedBy, oldValues, newValues
    })
};