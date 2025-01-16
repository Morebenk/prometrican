import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  getAllSubjects,
  getSubjectCategories,
} from "../../store/slices/subjectSlice";

const Subjects = () => {
  const dispatch = useDispatch();
  const { subjects, categories, loading, error } = useSelector(
    (state) => state.subject
  );

  useEffect(() => {
    dispatch(getAllSubjects());
  }, [dispatch]);

  const handleLoadCategories = (subjectId) => {
    if (!categories[subjectId]) {
      dispatch(getSubjectCategories(subjectId));
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
      <Typography variant="h4" gutterBottom>
        Subjects
      </Typography>

      <Grid container spacing={3}>
        {subjects.map((subject) => (
          <Grid item xs={12} md={6} key={subject._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {subject.name}
                </Typography>

                {categories[subject._id] ? (
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Categories:
                    </Typography>
                    {categories[subject._id].map((category) => (
                      <Typography key={category._id} color="text.secondary">
                        • {category.name}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleLoadCategories(subject._id)}
                    sx={{ mt: 2 }}
                  >
                    View Categories
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {subjects.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography color="text.secondary">No subjects available</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Subjects;
