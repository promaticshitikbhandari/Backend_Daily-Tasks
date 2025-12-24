import { Schema, model } from "mongoose";

const subCategorySchema = new Schema (
    {
        subname: {
            type: String,
            required: true,
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        },
        admin_id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }   
    }, {timestamps: true}
)

export const SubCategory = model("SubCategory", subCategorySchema);