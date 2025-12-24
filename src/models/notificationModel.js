import { Schema, model } from "mongoose";

const notificationSchema = new Schema (
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['order', 'admin', 'system', 'product', 'other'],
            default: 'other'
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        redirectUrl: {
            type: String
        },
        relatedId: {
            type: Schema.Types.ObjectId
        }
    }, {timestamps: true}
);

export const Notification = model("Notification", notificationSchema);