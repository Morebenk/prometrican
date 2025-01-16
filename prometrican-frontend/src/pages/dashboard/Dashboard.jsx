import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  Timeline as TimelineIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { getDashboardStats } from "../../store/slices/dashboardSlice.js";
import RecentActivity from "./components/RecentActivity.jsx";
import PerformanceChart from "./components/PerformanceChart.jsx";
import WeakAreasChart from "./components/WeakAreasChart.jsx";
import ActiveSubscriptions from "./components/ActiveSubscriptions.jsx";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: "Total Quizzes",
      value: stats?.performanceSummary?.totalAttempts || 0,
      icon: <QuizIcon fontSize="large" color="primary" />,
      action: () => navigate("/quizzes"),
    },
    {
      title: "Average Score",
      value: `${Math.round(stats?.performanceSummary?.averageScore || 0)}%`,
      icon: <TimelineIcon fontSize="large" color="secondary" />,
      action: () => navigate("/progress"),
    },
    {
      title: "Bookmarked",
      value: stats?.bookmarkedCount || 0,
      icon: <BookmarkIcon fontSize="large" color="info" />,
      action: () => navigate("/bookmarks"),
    },
    {
      title: "Time Spent",
      value: `${Math.round((stats?.performanceSummary?.totalTimeSpent || 0) / 60)} mins`,
      icon: <AccessTimeIcon fontSize="large" color="success" />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: card.action ? "pointer" : "default",
                "&:hover": card.action
                  ? {
                      transform: "translateY(-4px)",
                      transition: "transform 0.2s ease-in-out",
                    }
                  : {},
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {card.icon}
                  <Typography variant="h4" component="div">
                    {card.value}
                  </Typography>
                </Box>
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={stats?.recentActivity || []} />
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <PerformanceChart data={stats?.performanceSummary || {}} />
        </Grid>

        {/* Weak Areas */}
        <Grid item xs={12} md={6}>
          <WeakAreasChart weakAreas={stats?.weakAreas || []} />
        </Grid>

        {/* Active Subscriptions */}
        <Grid item xs={12} md={6}>
          <ActiveSubscriptions
            subscriptions={stats?.activeSubscriptions || []}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
