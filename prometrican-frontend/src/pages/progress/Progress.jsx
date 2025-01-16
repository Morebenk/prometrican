import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  getPerformanceAnalytics,
  getProgressTracking,
  getStudyPatterns,
} from "../../store/slices/progressSlice";
import { getAllSubjects } from "../../store/slices/subjectSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Progress = () => {
  const dispatch = useDispatch();
  const { performance, progressTracking, studyPatterns, loading } = useSelector(
    (state) => state.progress
  );
  const { subjects } = useSelector((state) => state.subject);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [timeframe, setTimeframe] = useState("week");

  useEffect(() => {
    dispatch(getAllSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSubject) {
      dispatch(
        getPerformanceAnalytics({ timeframe, subject_id: selectedSubject })
      );
      dispatch(getProgressTracking({ subject_id: selectedSubject }));
    }
    dispatch(getStudyPatterns({ timeframe }));
  }, [dispatch, selectedSubject, timeframe]);

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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Progress Analytics</Typography>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              {performance && (
                <Box height={300}>
                  <Bar
                    data={{
                      labels: performance.categoryPerformance.map(
                        (cat) => cat.categoryName
                      ),
                      datasets: [
                        {
                          label: "Accuracy (%)",
                          data: performance.categoryPerformance.map(
                            (cat) => cat.accuracy
                          ),
                          backgroundColor: "rgba(75, 192, 192, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Study Patterns */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Study Patterns
              </Typography>
              {studyPatterns && (
                <Box height={300}>
                  <Line
                    data={{
                      labels: studyPatterns.dailyPatterns.map((day) => day._id),
                      datasets: [
                        {
                          label: "Time Spent (minutes)",
                          data: studyPatterns.dailyPatterns.map(
                            (day) => day.totalTime / 60
                          ),
                          borderColor: "rgb(75, 192, 192)",
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Tracking */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress by Category
              </Typography>
              <Grid container spacing={3}>
                {progressTracking.map((category) => (
                  <Grid item xs={12} md={4} key={category.category_id}>
                    <Typography variant="subtitle1" gutterBottom>
                      {category.categoryName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">
                          {category.attemptedQuestions} /{" "}
                          {category.totalQuestions} questions completed
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={category.progressPercentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Typography variant="h6">
                        {Math.round(category.progressPercentage)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Progress;
