import { Notification } from "../models/notifications.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Internal function to add notifications
export const addNotification = async ({ user_id, message, type }) => {
  try {
    const notification = await Notification.create({
      user_id,
      message,
      type,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const user_id = req.user._id;

  const query = { user_id };
  if (type) {
    query.type = type;
  }

  const notifications = await Notification.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const total = await Notification.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Notifications retrieved successfully"
    )
  );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const user_id = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user_id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const user_id = req.user._id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user_id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  const user_id = req.user._id;

  await Notification.deleteMany({ user_id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications cleared successfully"));
});

export {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
};
