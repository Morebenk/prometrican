import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { parseFormData } from "./middlewares/multer.middlewares.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(parseFormData);

// import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import categoryRouter from "./routes/category.routes.js";
import questionRouter from "./routes/question.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import attemptRouter from "./routes/attempt.routes.js";
import bookmarkRouter from "./routes/bookmark.routes.js";
import flagRouter from "./routes/flag.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import wrongAnswerRouter from "./routes/wrong-answer.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

// routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/attempts", attemptRouter);
app.use("/api/v1/bookmarks", bookmarkRouter);
app.use("/api/v1/flags", flagRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/wrong-answers", wrongAnswerRouter);

// Error handling middleware should be last
app.use(errorHandler);

export { app };
