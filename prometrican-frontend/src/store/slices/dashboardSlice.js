import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

export const getDashboardStats = createAsyncThunk(
  "dashboard/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/dashboard/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload.data;
      })
      .addCase(getDashboardStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default dashboardSlice.reducer;
