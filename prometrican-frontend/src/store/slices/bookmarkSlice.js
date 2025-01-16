import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const toggleBookmark = createAsyncThunk(
  "bookmark/toggle",
  async ({ question_id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/bookmarks", {
        question_id,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle bookmark"
      );
    }
  }
);

export const getBookmarks = createAsyncThunk(
  "bookmark/getAll",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/v1/bookmarks?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookmarks"
      );
    }
  }
);

const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState: {
    bookmarks: [],
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
      .addCase(toggleBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookmark.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleBookmark.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookmarks.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bookmarks = payload.data.bookmarks;
        state.pagination = payload.data.pagination;
      })
      .addCase(getBookmarks.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default bookmarkSlice.reducer;
