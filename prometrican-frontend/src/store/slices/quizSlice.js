import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  loading: false,
  error: null,
};

export const fetchQuizzes = createAsyncThunk(
  "quiz/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/quizzes");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quizzes"
      );
    }
  }
);

export const startQuiz = createAsyncThunk(
  "quiz/startQuiz",
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/attempts", {
        quiz_id: quizId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start quiz"
      );
    }
  }
);

export const submitAnswer = createAsyncThunk(
  "quiz/submitAnswer",
  async (
    { attemptId, questionId, selectedChoiceId, timeSpent },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post("/api/v1/attempts/answer", {
        attempt_id: attemptId,
        question_id: questionId,
        selected_choice_id: selectedChoiceId,
        time_spent: timeSpent,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit answer"
      );
    }
  }
);

export const completeQuiz = createAsyncThunk(
  "quiz/completeQuiz",
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/v1/attempts/${attemptId}/complete`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete quiz"
      );
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
      state.currentAttempt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = payload.data.quizzes;
      })
      .addCase(fetchQuizzes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Start Quiz
      .addCase(startQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startQuiz.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentAttempt = payload.data;
      })
      .addCase(startQuiz.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Submit Answer
      .addCase(submitAnswer.fulfilled, (state, { payload }) => {
        state.currentAttempt = payload.data.attempt;
      })
      // Complete Quiz
      .addCase(completeQuiz.fulfilled, (state, { payload }) => {
        state.currentAttempt = payload.data;
        state.currentQuiz = null;
      });
  },
});

export const { setCurrentQuiz, clearCurrentQuiz } = quizSlice.actions;

export default quizSlice.reducer;
