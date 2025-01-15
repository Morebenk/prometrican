import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import quizReducer from "./slices/quizSlice";
import subjectReducer from "./slices/subjectSlice";
import notificationReducer from "./slices/notificationSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import progressReducer from "./slices/progressSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    subject: subjectReducer,
    notification: notificationReducer,
    subscription: subscriptionReducer,
    progress: progressReducer,
  },
});
