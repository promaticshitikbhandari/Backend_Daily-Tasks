import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";
import { createNotifications } from "./notificationControllers.js";
import sendEmail from "../utils/sendEmail.utils.js";

export const placeOrder = async (req, res) => {
    try {
        const user_id = req.user._id;
        const user = req.user;
        const {items} = req.body;

        if(!items || items.length === 0) {
            return res.status(400).json({success: false, message: "Order must contain atleast one product"})
        }

        let totalAmount = 0;
        let orderItems = [];

        for(const item of items) {
            const {product_id, quantity} = item;

            if(quantity < 1) {
                return res.status(400).json({success: false, message: "Quantity must be atleast 1"})
            }

            const product = await Product.findById(product_id);
            if(!product) {
                return res.status(404).json({success: false, message: "Product not Found"})
            }

            let itemTotal = product.productPrice * quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                product_id,
                quantity,
                price: product.productPrice,
                itemTotal
            })
        }

        const order = await Order.create({
            user_id,
            items: orderItems,
            totalAmount,
            orderStatus: "pending"
        })
        
        await createNotifications({
            user_id,
            title: "Order Placed",
            message: `Your order #${order._id} has been placed successfully`,
            type: "order",
            redirectUrl: `/orders/${order._id}`,
            relatedId: order._id
        });

        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
        console.log(user.email)
        await sendEmail({
            to: user.email,
            subject: "Order Placed Successfully",
            html: `
                <h3>Order Placed Successfully</h3>
                <p>Your Order <b>#${order._id}</b> has been placed</p>
            `
        });

        return res.status(201).json({
            success: true,
            message: "Order Placed successfully",
            data: order
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while order creation"
        })
    }
}

export const myOrders = async (req, res) => {
    try {
        const user = req.user;

        const myOrders = await Order.find({user_id: user._id});
        if(!myOrders) return res.status(404).json({success: false, message: "Orders not found"})

        return res.status(200).json({
            success: true,
            message: "User's Orders",
            data: myOrders
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching user orders"
        })
    }
}

export const mysingleOrder = async (req, res) => {
    try {
        const {id} = req.params;

        const mysingleOrder = await Order.findById(id);
        if(!mysingleOrder) return res.status(404).json({success: false, message: "Order not found"})

        return res.status(200).json({
            success: true,
            message: "User's Order",
            data: mysingleOrder
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching single Order"
        })
    }
}

export const allOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            orderStatus,
            sort = "latest"
        } = req.query;

    const pageNum = Math.max((parseInt(page, 10) || 1), 1)
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1),20)
    const offset = (pageNum - 1) * limitNum;

    const filter = {};
    if(orderStatus) filter.orderStatus = orderStatus
    if(search) {
        const users = await User.find({
            $or: [
                {username: {$regex: search, $options: 'i'}},
                {email: {$regex: search, $options: 'i'}}
            ]
        }).select("_id");

        const userIds = users.map( (user) => user._id);
        filter.user_id = {$in: userIds}

    }

    console.log(filter)
    const sortCriteria = sort === "oldest" ? {createdAt: 1} : {createdAt: -1}

    const allOrders = await Order.aggregate([
        {$match: filter},
        {$sort: sortCriteria},
        {$skip: offset},
        {$limit: limitNum},
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_detail"
            }
        },
        {
            $unwind: "$user_detail"
        },
        {
            $project: {
                items: 1,
                totalAmount: 1,
                orderStatus: 1,
                createdAt: 1,
                "user_detail.username": 1,
                "user_detail.email": 1
            }
        }

    ])

    const totalOrders = await Order.countDocuments(filter)
    const totalPages = Math.ceil(totalOrders/limitNum)

    return res.status(200).json({
        success: true,
        message: "All orders fetched",
        totalOrders,
        totalPages,
        limitNum,
        pageNum,
        data: allOrders
    })       
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching all Orders"
        })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {neworderStatus} = req.body;
        const user_id = req.user._id
        
        //1. allowed status transitions [state machine]
        const allowedStatus = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["cancelled", "shipped"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: []
        };

        //2. find orders
        const order = await Order.findById(orderId);
        if(!order) return res.status(404).json({success: false, message: "Order not found"});

        const currentStatus = order.orderStatus;

        //3. validate new status exists
        if(! allowedStatus[currentStatus]) {
            return res.status(400).json({
                success: false,
                message: "Invalid current order status"
            })
        }
        
        //4. validate newstatus transition
        if(! allowedStatus[currentStatus].includes(neworderStatus)) {
            return res.status(400).json({
                success: false, 
                message: `Cannot change order from ${currentStatus} to ${neworderStatus}`});
        }

        //5. update timestamps based on neworderStatus
        if(neworderStatus === "shipped") {
            order.shippedAt = new Date();
        }
        if(neworderStatus === "delivered") {
            order.deliveredAt = new Date();
        }

        //6.update orderstatus
        order.orderStatus = neworderStatus;

        await order.save()

        //create notifications for update order status
        await createNotifications({
            user_id,
            title: "Order Status Updated",
            message: `Your order #${order._id} status updated successfully`,
            type: "order",
            redirectUrl: `/orders/${order._id}`,
            relatedId: order._id
        });

        //7. response
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        })

        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while Updating Order Status"
        })
    }
}

export const cancelOrderByUser = async (req, res) => {
    try {
        const {orderId} = req.params;
        const user_id = req.user._id;

        const order = await Order.findById(orderId);
        if(! order) {
            return res.status(404).json({success: false, message: "Order not found"});
        }

        if((order.user_id).toString() !== (user_id).toString()) {
            console.log(user_id);
            console.log(order.user_id)
            return res.status(403).json({success: false, message: "Forbid access"})
        }
        // if(!order.user_id.equal(user._id))

        if(order.orderStatus !== "pending") {
            return res.status(400).json({success: false, message: "Cannot change Order status"})
        } 

        order.orderStatus = "cancelled";
        await order.save()

        //Notification for cancel order
        await createNotifications({
            user_id,
            title: "Order Cancelled",
            message: `Your order #${order._id} has been cancelled successfully`,
            type: "order",
            redirectUrl: `/orders/${order._id}`,
            relatedId: order._id
        });

        return res.status(200).json({
            success: true,
            message: "Order Cancelled",
            data: order
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while Cancelling the order by user"
        })
    }
}