import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Flag as FlagIcon,
  Bookmark as BookmarkIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from "@mui/icons-material";
import {
  startQuiz,
  submitAnswer,
  completeQuiz,
} from "../../store/slices/quizSlice";
import { toggleBookmark } from "../../store/slices/bookmarkSlice";
import { flagQuestion } from "../../store/slices/flag";
import QuizTimer from "./components/QuizTimer";
import FlagQuestionDialog from "./components/FlagQuestionDialog";

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz, currentAttempt, loading } = useSelector(
    (state) => state.quiz
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  useEffect(() => {
    const initQuiz = async () => {
      if (!currentAttempt) {
        await dispatch(startQuiz(quizId));
      }
    };
    initQuiz();
  }, [dispatch, quizId, currentAttempt]);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === currentQuiz?.questions.length - 1;

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleNext = async () => {
    if (selectedAnswer) {
      await dispatch(
        submitAnswer({
          attemptId: currentAttempt._id,
          questionId: currentQuestion._id,
          selectedChoiceId: selectedAnswer,
          timeSpent,
        })
      );

      if (isLastQuestion) {
        setShowConfirmSubmit(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer("");
        setTimeSpent(0);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    await dispatch(completeQuiz(currentAttempt._id));
    navigate("/quizzes/result", { state: { attemptId: currentAttempt._id } });
  };

  const handleBookmark = () => {
    dispatch(toggleBookmark(currentQuestion._id));
  };

  const handleFlag = (reason) => {
    dispatch(flagQuestion({ questionId: currentQuestion._id, reason }));
    setShowFlagDialog(false);
  };

  if (loading || !currentQuestion) {
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
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={
          ((currentQuestionIndex + 1) * 100) / currentQuiz.questions.length
        }
        sx={{ mb: 3 }}
      />

      {/* Timer and Question Counter */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">
          Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
        </Typography>
        <QuizTimer onTimeUpdate={setTimeSpent} />
      </Box>

      {/* Question Card */}
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography variant="h5" gutterBottom>
              {currentQuestion.text}
            </Typography>
            <Box>
              <IconButton onClick={handleBookmark}>
                <BookmarkIcon
                  color={currentQuestion.isBookmarked ? "primary" : "inherit"}
                />
              </IconButton>
              <IconButton onClick={() => setShowFlagDialog(true)}>
                <FlagIcon
                  color={currentQuestion.isFlagged ? "error" : "inherit"}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Answer Choices */}
          <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
            <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
              {currentQuestion.choices.map((choice) => (
                <FormControlLabel
                  key={choice._id}
                  value={choice._id}
                  control={<Radio />}
                  label={choice.text}
                  sx={{
                    marginY: 1,
                    padding: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          disabled={!selectedAnswer}
          onClick={handleNext}
        >
          {isLastQuestion ? "Finish" : "Next"}
        </Button>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
      >
        <DialogTitle>Submit Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your quiz? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmSubmit(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitQuiz}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <FlagQuestionDialog
        open={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        onSubmit={handleFlag}
      />
    </Box>
  );
};

export default QuizAttempt;
