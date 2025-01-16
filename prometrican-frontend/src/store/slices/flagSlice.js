import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const flagQuestion = createAsyncThunk(
  "flag/flagQuestion",
  async ({ question_id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/flags", {
        question_id,
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to flag question"
      );
    }
  }
);

export const getFlaggedQuestions = createAsyncThunk(
  "flag/getAll",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/v1/flags?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch flagged questions"
      );
    }
  }
);

export const removeFlag = createAsyncThunk(
  "flag/remove",
  async (flagId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/v1/flags/${flagId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove flag"
      );
    }
  }
);

const flagSlice = createSlice({
  name: "flag",
  initialState: {
    flaggedQuestions: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 1,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(flagQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(flagQuestion.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getFlaggedQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlaggedQuestions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.flaggedQuestions = payload.data.flags;
        state.pagination = payload.data.pagination;
      })
      .addCase(getFlaggedQuestions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(removeFlag.fulfilled, (state, { payload }) => {
        state.flaggedQuestions = state.flaggedQuestions.filter(
          (q) => q._id !== payload.data._id
        );
      });
  },
});

export default flagSlice.reducer;
