import mongoose from "mongoose";
import { Product } from "../models/productModel.js";
import { createNotifications } from "./notificationControllers.js";
import sendEmail from "../utils/sendEmail.utils.js";

const createProduct = async (req, res) => {
    try {
        const user = req.user;
        const {productName, productDescription, productPrice, productImage, category_id, subCategory_id} = req.body;
        // const {productImage} = req.files;

        // console.log("productImage",productImage)

        if(!productName || !productDescription || !productPrice || !productImage || !category_id || !subCategory_id) return res.status(400).json({success: false, message: "Product Name, Description, Image and Price all are required fields"});
        
        console.log(productImage)
        // const ImageArray = productImage.map( (elem) => elem.path.replace("public/", ""))
        // const ImageArray = productImage.map( (elem) => "Images/" + elem.filename)
        // console.log(ImageArray)
        
        const createProduct = await Product.create({productName, productDescription, productPrice, productImage, category_id, subCategory_id, user_id: user._id});

        //Notification for createProduct
        await createNotifications({
                    user_id: user._id,
                    title: "Product Created",
                    message: `Your Product #${createProduct._id} has been created successfully`,
                    type: "product",
                    redirectUrl: `/products/${createProduct._id}`,
                    relatedId: createProduct._id
                });
        
        await sendEmail({
            to: user.email,
            subject: "Product Created Successfully",
            html: `
                <h3>Product Created Successfully</h3>
                <p>Your Product <b>#${createProduct._id}</b> has been created</p>
            `
        })

        return res.status(201).json({
            success: true,
            message: "New Product is Created",
            data: createProduct
        })

    } catch (error) {
        console.log(error);
    }
}

const getMyProduct = async (req, res) => {
    try {
        const user = req.user;
        const {
            page = 1,
            limit = 5,
            search,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        filter.user_id = user._id;
        if(minPrice) filter.productPrice = {...filter.productPrice, $gte: parseInt(minPrice, 10)};
        if(maxPrice) filter.productPrice = {...filter.productPrice, $lte: parseInt(maxPrice, 10)};

        if(search) {
            filter.productName = { $regex: search, $options: 'i'}
        }
        console.log("filter ",filter);
        
        //Multiple Dynamic Sort
        let sortCriteria;
        const allowedSort = ['productName', 'productDescription', 'productPrice', 'createdAt', 'updatedAt'];
        if(!sort) {
            sortCriteria = {createdAt: -1}
        } else {
            const sortPairs = sort.split(',') //["price:asc", "name:desc"]
            const sortObj = {};

            sortPairs.forEach(pair => {
                const [field, order] = pair.split(':'); //["price", "asc"];

                //validate field
                if( !allowedSort.includes(field)) return;

                const sortOrder = order === "asc" ? 1 : -1;
                sortObj[field] = sortOrder;
            });
            if(Object.keys(sortObj).length === 0) {
                sortCriteria = {createdAt: -1}
            } else {
                sortCriteria = sortObj
            }
        }

        console.log("sortCriteria ",sortCriteria);

        const [docsQuery, totalDocs] = await Promise.all([
            Product.find(filter)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limitNum)
            .lean(), 
            Product.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalDocs/limitNum);

        return res.status(200).json({
            success: true,
            message: "Products Fetched",
            totalPages,
            pageNum,
            limitNum,
            totalDocs,
            data: docsQuery
        })

        // console.log(user)
        // const getProducts = await Product.find({user_id: user._id});
        // if(!getProducts) return res.status(400).json({success: false, message: "Product List is Empty"});
        // // console.log(getProducts)
        // return res.status(200).json({
        //     success: true,
        //     message: "Products Fetched",
        //     data: getProducts
        // })

    } catch (error) {
        console.log(error);
    }
}

const updateProduct = async (req, res) => {
    try {
        const user = req.user;
        // const id = (user._id).toString()
        // console.log(id)
        const {id} = req.params
        const {productName, productDescription, productPrice} = req.body;

        if(! (productName || productDescription || productPrice)) return res.status(400).json({success: false, message: "Atleast One field is required for update"})
        
        const update = await Product.findByIdAndUpdate(
            id,
            {$set: {productName, productDescription, productPrice}},
            {new: true, runValidators: false}
        )

        //Notification for updateProduct
        await createNotifications({
            user_id: user._id,
            title: "Product updated",
            message: `Your Product #${update._id} has been updated successfully`,
            type: "product",
            redirectUrl: `/products/${update._id}`,
            relatedId: update._id
        });

        return res.status(200).json({
            success: true,
            message: "Updated Successfully",
            data: update
        })

    } catch (error) {
        console.log(error)
    }
}

const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;

        const deleteProduct = await Product.findByIdAndDelete(id);

        //Notification for deleteProduct
        await createNotifications({
            user_id: user._id,
            title: "Product deleted",
            message: `Your Product #${deleteProduct._id} has been deleted successfully`,
            type: "product",
            redirectUrl: `/products/${deleteProduct._id}`,
            relatedId: deleteProduct._id
        });

        return res.status(202).json({
            success: true,
            message: "Deleted SuccessFully",
            data: deleteProduct
        })

    } catch (error) {
        console.log(error)
    }
}

const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            search,
            category,
            subCategory,
            sort,
        } = req.query;

        // console.log(category)
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if(category) filter.category_id = new mongoose.Types.ObjectId(category);
        if(subCategory) filter.subCategory_id = new mongoose.Types.ObjectId(subCategory);
        if(search) {
            filter.productName = { $regex: search, $options: 'i'}
        }

        let sortCriteria;
        const allowedSort = ["productPrice", "productName", "productDescription", "createdAt", "updatedAt"];
        if(!sort) {
            sortCriteria = {createdAt: -1}
        } else {
            const sortPairs = sort.split(",") //["price:asc", "createdAt:desc"]
            const sortObj = {};
            sortPairs.forEach( (pair) => {
                const [field, order] = pair.split(":"); //[price, asc]
                
                if(!allowedSort.includes(field)) return
                const sortOrder = order === "asc" ? 1 : -1;
                sortObj[field] = sortOrder;
            })
            if(Object.keys(sortObj).length === 0) {
                sortCriteria = {createdAt: -1}
            } else {
                sortCriteria = sortObj
            }
        }

        console.log(filter)
        console.log("Sort ",sortCriteria)
        const allProductList = await Product.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "Product_Categories"
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory_id",
                    foreignField: "_id",
                    as: "Product_SubCategories"
                }
            },
            {
                $sort: sortCriteria
            },
            {
                $skip: skip
            },
            {
                $limit: limitNum
            },
            {
                $project: {
                    productName: 1,
                    productDescription: 1,
                    productPrice: 1,
                    productImage: 1,
                    Category: "$Product_Categories.name",
                    Subcategory: "$Product_SubCategories.subname", 
                }
            }
        ])
        // console.log(allProductList);

        const totaldocs = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totaldocs/limitNum);

        res.status(200).json({
            success: true,
            message: "Get All Products",
            data: allProductList,
            totaldocs,
            skip,
            page,
            limit,
            totalPages
        })
    } catch (error) {
        console.log(error)
    }
}

export {
    createProduct,
    getMyProduct,
    updateProduct,
    deleteProduct,
    getAllProducts
}