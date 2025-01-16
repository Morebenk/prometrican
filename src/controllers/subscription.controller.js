import { Subscription } from "../models/subscriptions.model.js";
import { Subject } from "../models/subjects.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addNotification } from "./notification.controller.js";

const createSubscription = asyncHandler(async (req, res) => {
  const { subject_id, plan_duration } = req.body;
  const user_id = req.user._id;

  // Validate subject exists
  const subject = await Subject.findById(subject_id);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Check for existing active subscription
  const existingSubscription = await Subscription.findOne({
    user_id,
    subject_id,
    end_date: { $gt: new Date() },
  });

  if (existingSubscription) {
    throw new ApiError(
      400,
      "Active subscription already exists for this subject"
    );
  }

  // Calculate dates
  const start_date = new Date();
  const end_date = new Date();
  end_date.setMonth(end_date.getMonth() + plan_duration);

  const subscription = await Subscription.create({
    user_id,
    subject_id,
    plan_duration,
    start_date,
    end_date,
  });

  // Create notification for new subscription
  await addNotification({
    user_id,
    message: `Your subscription for ${subject.name} has been activated`,
    type: "subscription_reminder",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, subscription, "Subscription created successfully")
    );
});

const getUserSubscriptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const user_id = req.user._id;
  const currentDate = new Date();

  let query = { user_id };

  if (status === "active") {
    query.end_date = { $gt: currentDate };
  } else if (status === "expired") {
    query.end_date = { $lte: currentDate };
  }

  const subscriptions = await Subscription.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "subjects",
        localField: "subject_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    { $unwind: "$subject" },
    {
      $addFields: {
        status: {
          $cond: {
            if: { $gt: ["$end_date", currentDate] },
            then: "active",
            else: "expired",
          },
        },
        daysRemaining: {
          $ceil: {
            $divide: [
              { $subtract: ["$end_date", currentDate] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },
    { $sort: { start_date: -1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscriptions retrieved successfully"
      )
    );
});

const renewSubscription = asyncHandler(async (req, res) => {
  const { subscription_id, plan_duration } = req.body;
  const user_id = req.user._id;

  const subscription = await Subscription.findOne({
    _id: subscription_id,
    user_id,
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  const newEndDate = new Date(Math.max(subscription.end_date, new Date()));
  newEndDate.setMonth(newEndDate.getMonth() + plan_duration);

  subscription.end_date = newEndDate;
  subscription.plan_duration += plan_duration;
  await subscription.save();

  // Create renewal notification
  const subject = await Subject.findById(subscription.subject_id);
  await addNotification({
    user_id,
    message: `Your subscription for ${subject.name} has been renewed`,
    type: "subscription_reminder",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscription, "Subscription renewed successfully")
    );
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const { subscription_id } = req.params;
  const user_id = req.user._id;

  const subscription = await Subscription.findOne({
    _id: subscription_id,
    user_id,
    end_date: { $gt: new Date() },
  });

  if (!subscription) {
    throw new ApiError(404, "Active subscription not found");
  }

  subscription.end_date = new Date();
  await subscription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscription, "Subscription cancelled successfully")
    );
});

export {
  createSubscription,
  getUserSubscriptions,
  renewSubscription,
  cancelSubscription,
};
