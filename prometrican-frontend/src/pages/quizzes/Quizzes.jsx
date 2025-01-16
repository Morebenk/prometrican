import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { fetchQuizzes } from "../../store/slices/quizSlice";
import QuizHistoryDialog from "./components/QuizHistoryDialog";
import QuizFilterDialog from "./components/QuizFilterDialog";

const Quizzes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    category: "",
    difficulty: "",
  });

  useEffect(() => {
    dispatch(fetchQuizzes(filters));
  }, [dispatch, filters]);

  const handleStartQuiz = async (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Available Quizzes</Typography>
        <Box>
          <Tooltip title="View History">
            <IconButton onClick={() => setHistoryOpen(true)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Quizzes">
            <IconButton onClick={() => setFilterOpen(true)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {quiz.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {quiz.questionCount} Questions
                </Typography>
                <Box
                  mt={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleStartQuiz(quiz._id)}
                  >
                    Start Quiz
                  </Button>
                  <Typography variant="caption" color="textSecondary">
                    {quiz.estimatedTime} mins
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <QuizHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <QuizFilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </Box>
  );
};

export default Quizzes;
