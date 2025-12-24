import { Notification } from "../models/notificationModel.js";

//1. get all notification with pagination
export const getAllNotifications = async (req, res) => {
    try {
        const user_id = req.user._id;
        const {
            page = 1,
            limit = 10,
        } = req.query;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);

        const skip = (pageNum - 1) * limitNum;

        const notifications = await Notification.find({user_id})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limitNum);

        return res.status(200).json({
            success: true,
            message: "All notifications fetched",
            count: notifications.length,
            limit: limitNum,
            data: notifications
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching all notifications"
        })
    }
}

export const getUnreadNotifications = async (req, res) => {
    try {
        const user_id = req.user._id;

        const unreadNotifications = await Notification
        .find({user_id, isRead: false}).sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            message: "Unread Notifications fetched",
            count: unreadNotifications.length,
            data: unreadNotifications
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching UnRead notifications"
        })
    }
}

export const getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user._id;

        const unreadNotificationsCount = await Notification.countDocuments(
            {user_id, isRead: false}
        );

        return res.status(200).json({
            success: true,
            message: "Unread Notifications Count",
            count: unreadNotificationsCount
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while Counting UnRead notifications"
        })
    }
}

export const markNotificationAsRead = async (req, res) => {
    try {
      const user_id = req.user._id;
      const { notificationId } = req.params;

      let notification;
      if(notificationId === "all") {
        notification = await Notification.updateMany(
            {user_id, isRead: false},
            {$set: {isRead: true}}
        );
      } else {
        notification = await Notification.findOne({
            _id: notificationId,
            user_id
          }); 
          if(notification) {
            notification.isRead = true;
            await notification.save();
          }
      }

    //   if(notification.user_id.toString() !== user_id.toString()) {
    //     return res.status(403).json({
    //         success: false,
    //         message: "forbid access"
    //     })
    //   }
   
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }
        
      res.status(200).json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//new and in this we can update one , two or all. this depends on the ids passed in req.body
export const markAllNotificationAsRead = async (req, res) => {
    try {
        const user_id = req.user._id;
        const {notificationIds} = req.body;

        const notification = await Notification.updateMany(
            {_id: {$in: notificationIds}, user_id, isRead: false},
            {$set: {isRead: true}}
        );
        if(! notification) {
            return res.status(400).json({
                success: false,
                message: "Notification not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "All notifications marked as Read"
        })
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

//new and in this we can delete one , two or all. this depends on the ids passed in req.body
export const deleteNotifications = async (req, res) => {
    try {
        const user_id = req.user._id;
        const {notificationIds} = req.body;

        const notification = await Notification.deleteMany(
            {_id: {$in: notificationIds}, user_id}
        )

        if(! notification) {
            return res.status(400).json({
                success: false,
                message: "Notification not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "notification deleted"
        })
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const createNotifications = async (
    {
        user_id,
        title,
        message,
        type = "other",
        redirectUrl,
        relatedId
    }
) => {
    try {
        await Notification.create({
            user_id,
            title,
            message,
            type,
            redirectUrl,
            relatedId
        });
        
    } catch (error) {
        console.error("Notification creation failed:", error.message);
    }
}