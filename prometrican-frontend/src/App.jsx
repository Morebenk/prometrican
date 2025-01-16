import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";

// Layouts
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/common/PrivateRoute";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
// import Quizzes from "./pages/quizzes/Quizzes";
// import QuizAttempt from "./pages/quizzes/QuizAttempt";
import Subjects from "./pages/subjects/Subjects";
import Bookmarks from "./pages/bookmarks/Bookmarks";
import Flagged from "./pages/flagged/Flagged";
import Progress from "./pages/progress/Progress";
import Subscriptions from "./pages/subscriptions/Subscriptions";
// import Profile from "./pages/profile/Profile";
import Notifications from "./pages/notifications/Notifications";

function App() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/quizzes" element={<Quizzes />} /> */}
                {/* <Route path="/quizzes/:quizId" element={<QuizAttempt />} /> */}
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/flagged" element={<Flagged />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
