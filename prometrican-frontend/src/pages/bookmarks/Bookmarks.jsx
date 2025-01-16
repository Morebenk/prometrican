import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { getBookmarks } from "../../store/slices/bookmarkSlice";

const Bookmarks = () => {
  const dispatch = useDispatch();
  const { bookmarks, loading, error, pagination } = useSelector(
    (state) => state.bookmark
  );
  const [status, setStatus] = useState("all");

  useEffect(() => {
    dispatch(getBookmarks({ page: 1, status }));
  }, [dispatch, status]);

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
        <Typography variant="h4">Bookmarked Questions</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="bookmarked">Bookmarked</MenuItem>
            <MenuItem value="marked_for_review">Marked for Review</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {bookmarks.map((bookmark) => (
          <Grid item xs={12} key={bookmark._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {bookmark.question.text}
                </Typography>
                {bookmark.question.choices.map((choice) => (
                  <Typography
                    key={choice._id}
                    color={choice.is_correct ? "success.main" : "text.primary"}
                    sx={{ mt: 1 }}
                  >
                    • {choice.text}
                    {choice.is_correct && choice.explanation && (
                      <Typography color="text.secondary" sx={{ ml: 2 }}>
                        Explanation: {choice.explanation}
                      </Typography>
                    )}
                  </Typography>
                ))}
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Category: {bookmark.category.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {bookmarks.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography color="text.secondary">
            No bookmarked questions found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Bookmarks;
