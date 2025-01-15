import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

const RecentActivity = ({ activities }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "in_progress":
        return <PlayArrowIcon color="warning" />;
      default:
        return <CancelIcon color="error" />;
    }
  };

  const getStatusText = (activity) => {
    switch (activity.status) {
      case "completed":
        return `Completed with score ${activity.score}%`;
      case "in_progress":
        return "In progress";
      default:
        return "Not started";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {activities.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="textSecondary">
              No recent activity to display
            </Typography>
          </Box>
        ) : (
          <List>
            {activities.map((activity) => (
              <ListItem key={activity._id}>
                <ListItemIcon>{getStatusIcon(activity.status)}</ListItemIcon>
                <ListItemText
                  primary={activity.quiz.name}
                  secondary={`${getStatusText(activity)} • ${format(
                    new Date(activity.createdAt),
                    "MMM d, yyyy"
                  )}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
