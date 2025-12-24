import { User } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";

const getDashboardStats = async (req, res) => {
    try {

        const now = new Date(); //Today date with current-time

        const startOfToday = new Date(now); 
        startOfToday.setHours(0,0,0,0); // now we are setting time or hours to (0,0,0,0)
        // console.log("startOfToday", startOfToday)

        const startOfYesterday = new Date(startOfToday); //here are putting today date and time(0,0,0,0)
        startOfYesterday.setDate(startOfYesterday.getDate() - 1); //now we are setting start of yesterday by getDate() - 1, here getDate() gives date that we store which is todaydate and time (0,0,0,0) and then we -1, that means yesterday date with time (0,0,0,0)
        // console.log("startOfYesterday", startOfYesterday);
        
        const endOfYesterday = new Date(startOfToday); //end of yesterday, first we are giving start of today means current date with time (0,0,0,0)
        endOfYesterday.setMilliseconds(-1); //we minus (-1) millisecond in (0,0,0,0) so now our date and time will yesterday date and time is (11,59,59,59)
        // console.log("endOfYesterday", endOfYesterday);
        
        const last7Days = new Date(now); // for getting last 7days we give first current date and time
        last7Days.setDate(last7Days.getDate() - 7); // And then by applying getDate( method) we giving last 7 days date by -7

        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);

        //1. User Stats
        // const totalUsers = await User.countDocuments();
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: {$sum: 1},
                    usersToday: {
                        $sum: {
                            $cond: [
                                {$gte: ["$createdAt", startOfToday]},
                                1,
                                0
                            ]
                        }
                    },
                    usersYesterday: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {$gte: ["$createdAt", startOfYesterday]},
                                        {$lte: ["$createdAt", endOfYesterday]}
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    userslast7Days: {
                        $sum: {
                            $cond: [
                                {$gte: ["$createdAt", last7Days]},
                                1, 0
                            ]
                        }
                    },
                    userslast30Days: {
                        $sum: {
                            $cond: [
                                {$gte: ["$createdAt", last30Days]},
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);
        console.log(userStats)
        const stats = userStats[0] || {};
        const dashboardUsers = {
            total: stats.totalUsers || 0,
            todayUsers: stats.usersToday || 0,
            YesterdayUsers: stats.usersYesterday || 0,
            last7DaysUsers: stats.userslast7Days || 0,
            last30DaysUsers: stats.userslast30Days || 0
        };


        //2. Order Stats
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: {$sum: 1}
                }
            }
        ]);

        //3. Total Order Counts
        const totalOrders = await Order.countDocuments();

        //4. Total Revenue
        const revenueResult = await Order.aggregate([
            {
                $match: {orderStatus: "delivered"}
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {$sum: "$totalAmount"},
                    Average: {$avg: "$totalAmount"}
                }
            }
        ])

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        const Average = revenueResult.length > 0 ? revenueResult[0].Average : 0;
        // "pending", "confirmed", "shipped", "delivered", "cancelled"
        //5. Format order status data
        const orderStatusSummary = {
            pending: 0,
            confirmed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }

        orderStats.forEach( stat => {
            orderStatusSummary[stat._id] = stat.count;
        });
        

        //final response
        return res.status(200).json({
            success: true,
            data: {
                users: {
                    dashboardUsers
                },
                orders: {
                    total: totalOrders,
                    statusBreakdown: orderStatusSummary
                },
                revenue: {
                    total: totalRevenue,
                    Average
                }
            }
        });
        
    } catch (error) {
        console.log("Dashboard Stats Error: ",error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard Stats"
        });
    }
};

export { getDashboardStats }