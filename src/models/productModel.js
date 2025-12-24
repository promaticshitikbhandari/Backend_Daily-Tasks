import { Schema, model } from "mongoose";

const productSchema = new Schema (
    {
        productName: {
            type: String,
            required: true,
            maxLength: 50
        },
        productDescription: {
            type: String,
            required: true,
            maxLength: 250
        },
        productPrice: {
            type: Number,
            required: true,
        },
        productImage: {
            type: [String],
            required: true
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        },
        subCategory_id: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory"
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, {timestamps: true}
)

export const Product = model("Product", productSchema)