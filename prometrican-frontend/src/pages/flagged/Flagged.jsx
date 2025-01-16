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
import { Delete as DeleteIcon } from "@mui/icons-material";
import { getFlaggedQuestions, removeFlag } from "../../store/slices/flagSlice";
import { toast } from "react-toastify";

const Flagged = () => {
  const dispatch = useDispatch();
  const { flaggedQuestions, loading, error } = useSelector(
    (state) => state.flag
  );
  const [reason, setReason] = useState("all");

  useEffect(() => {
    dispatch(
      getFlaggedQuestions({
        page: 1,
        reason: reason !== "all" ? reason : undefined,
      })
    );
  }, [dispatch, reason]);

  const handleRemoveFlag = async (flagId) => {
    try {
      await dispatch(removeFlag(flagId)).unwrap();
      toast.success("Flag removed successfully");
    } catch (error) {
      toast.error(error || "Failed to remove flag");
    }
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
        <Typography variant="h4">Flagged Questions</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Reason</InputLabel>
          <Select
            value={reason}
            label="Filter by Reason"
            onChange={(e) => setReason(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Question">Unclear Question</MenuItem>
            <MenuItem value="Answer">Incorrect Answer</MenuItem>
            <MenuItem value="Image">Problem with Image</MenuItem>
            <MenuItem value="Other">Other Issues</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {flaggedQuestions.map((flag) => (
          <Grid item xs={12} key={flag._id}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Typography variant="h6" gutterBottom>
                    {flag.question.text}
                  </Typography>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleRemoveFlag(flag._id)}
                  >
                    Remove Flag
                  </Button>
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  Reason: {flag.reason}
                </Typography>
                {flag.question.choices.map((choice) => (
                  <Typography
                    key={choice._id}
                    color={choice.is_correct ? "success.main" : "text.primary"}
                    sx={{ mt: 1 }}
                  >
                    • {choice.text}
                  </Typography>
                ))}
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Category: {flag.category.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {flaggedQuestions.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography color="text.secondary">
            No flagged questions found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Flagged;
