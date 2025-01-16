import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const getPerformanceAnalytics = createAsyncThunk(
  "progress/performance",
  async ({ timeframe, subject_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/analytics/performance", {
        params: { timeframe, subject_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch performance analytics"
      );
    }
  }
);

export const getProgressTracking = createAsyncThunk(
  "progress/tracking",
  async ({ subject_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/analytics/progress", {
        params: { subject_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch progress tracking"
      );
    }
  }
);

export const getStudyPatterns = createAsyncThunk(
  "progress/studyPatterns",
  async ({ timeframe }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/analytics/study-patterns", {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch study patterns"
      );
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    performance: null,
    progressTracking: [],
    studyPatterns: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPerformanceAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPerformanceAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.performance = payload.data;
      })
      .addCase(getPerformanceAnalytics.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getProgressTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgressTracking.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.progressTracking = payload.data;
      })
      .addCase(getProgressTracking.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getStudyPatterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudyPatterns.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.studyPatterns = payload.data;
      })
      .addCase(getStudyPatterns.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default progressSlice.reducer;
