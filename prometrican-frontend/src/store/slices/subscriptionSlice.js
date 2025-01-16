import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const createSubscription = createAsyncThunk(
  "subscription/create",
  async ({ subject_id, plan_duration }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/subscriptions", {
        subject_id,
        plan_duration,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  }
);

export const getUserSubscriptions = createAsyncThunk(
  "subscription/getAll",
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/subscriptions", {
        params: { status },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const renewSubscription = createAsyncThunk(
  "subscription/renew",
  async ({ subscription_id, plan_duration }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/subscriptions/renew", {
        subscription_id,
        plan_duration,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to renew subscription"
      );
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancel",
  async (subscription_id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/v1/subscriptions/${subscription_id}/cancel`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subscriptions.push(payload.data);
      })
      .addCase(createSubscription.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSubscriptions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subscriptions = payload.data;
      })
      .addCase(getUserSubscriptions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(renewSubscription.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(
          (s) => s._id === payload.data._id
        );
        if (index !== -1) {
          state.subscriptions[index] = payload.data;
        }
      })
      .addCase(cancelSubscription.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(
          (s) => s._id === payload.data._id
        );
        if (index !== -1) {
          state.subscriptions[index] = payload.data;
        }
      });
  },
});

export default subscriptionSlice.reducer;
