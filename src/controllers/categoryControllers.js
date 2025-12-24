import { Category } from "../models/categoryModel.js";

const createCategory = async (req, res) => {
    try {
        // console.log("Hello")
        const user = req.user;
        const {name} = req.body;
        if(! name) return res.status(400).json({success: false, message: "Category Name is Required"});

        const checkcategory = await Category.findOne({name});
        if(checkcategory) return res.status(400).json({success: false, message: "Category Already listed"});

        const category = await Category.create({name, admin_id: user._id});

        return res.status(201).json({
            success: true,
            message: "New Category Created",
            data: category
        })

    } catch (error) {
        console.log(error)
    }
}

const getCategory = async (req, res) => {
    try {
        const user = req.user;
        const getCategory = await Category.find({admin_id: user._id});
        return res.status(202).json({
            success: true,
            message: "Categories Fetched",
            data: getCategory
        })
    } catch (error) {
        console.log(error);
    }
}

const updateCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;
        const updateCategory = await Category.findByIdAndUpdate(
            id,
            {$set: {name}},
            {new: true}
        )
        return res.status(200).json({
            success: true,
            message: "Category Updated Successfully",
            data: updateCategory
        })
    } catch (error) {
        console.log(error)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const deleteCategory = await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category Deleted Successfully",
            data: deleteCategory
        })
    } catch (error) {
        console.log(error);
    }
}

export {
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory
}