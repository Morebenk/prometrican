import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  getUserSubscriptions,
  createSubscription,
  renewSubscription,
  cancelSubscription,
} from "../../store/slices/subscriptionSlice";
import { getAllSubjects } from "../../store/slices/subjectSlice";
import { toast } from "react-toastify";

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading } = useSelector((state) => state.subscription);
  const { subjects } = useSelector((state) => state.subject);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [planDuration, setPlanDuration] = useState(1);

  useEffect(() => {
    dispatch(getUserSubscriptions({ status: "active" }));
    dispatch(getAllSubjects());
  }, [dispatch]);

  const handleCreateSubscription = async () => {
    try {
      await dispatch(
        createSubscription({
          subject_id: selectedSubject,
          plan_duration: planDuration,
        })
      ).unwrap();
      toast.success("Subscription created successfully");
      setOpenDialog(false);
      setSelectedSubject("");
      setPlanDuration(1);
    } catch (error) {
      toast.error(error || "Failed to create subscription");
    }
  };

  const handleRenewSubscription = async (subscription_id) => {
    try {
      await dispatch(
        renewSubscription({
          subscription_id,
          plan_duration: 1,
        })
      ).unwrap();
      toast.success("Subscription renewed successfully");
    } catch (error) {
      toast.error(error || "Failed to renew subscription");
    }
  };

  const handleCancelSubscription = async (subscription_id) => {
    try {
      await dispatch(cancelSubscription(subscription_id)).unwrap();
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      toast.error(error || "Failed to cancel subscription");
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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Subscriptions</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          New Subscription
        </Button>
      </Box>

      <Grid container spacing={3}>
        {subscriptions.map((subscription) => (
          <Grid item xs={12} md={6} key={subscription._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {subscription.subject.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Status: {subscription.status}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Days Remaining: {subscription.daysRemaining}
                </Typography>
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleRenewSubscription(subscription._id)}
                  >
                    Renew
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelSubscription(subscription._id)}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>New Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Duration (months)</InputLabel>
            <Select
              value={planDuration}
              label="Duration (months)"
              onChange={(e) => setPlanDuration(e.target.value)}
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSubscription}
            variant="contained"
            disabled={!selectedSubject || !planDuration}
          >
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>

      {subscriptions.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography color="text.secondary" gutterBottom>
            No active subscriptions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Get Started
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Subscriptions;
