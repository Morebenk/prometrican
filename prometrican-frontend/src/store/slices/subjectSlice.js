import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const getAllSubjects = createAsyncThunk(
  "subject/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/subjects");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects"
      );
    }
  }
);

export const getSubjectCategories = createAsyncThunk(
  "subject/getCategories",
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/v1/categories/subject/${subjectId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

const subjectSlice = createSlice({
  name: "subject",
  initialState: {
    subjects: [],
    categories: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSubjects.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subjects = payload.data;
      })
      .addCase(getAllSubjects.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getSubjectCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubjectCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories[payload.data.subject_id] = payload.data.categories;
      })
      .addCase(getSubjectCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default subjectSlice.reducer;
