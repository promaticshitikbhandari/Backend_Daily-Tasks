import { Schema, model } from "mongoose";

const itemSchema = new Schema (
    {
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        itemTotal: {
            type: Number,
            required: true
        }
    },
    {_id: false} //items don't need _id
);

const orderSchema = new Schema (
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: {
            type: [itemSchema],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length > 0;
                },
                message: "Order must be contain atleast one product"
            }
        },
        totalAmount: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        
        shippedAt: Date,
        deliveredAt: Date

    }, {timestamps: true}
);

export const Order = model("Order", orderSchema)