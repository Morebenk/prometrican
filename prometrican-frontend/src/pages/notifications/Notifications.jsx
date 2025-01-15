import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  fetchNotifications,
  markNotificationAsRead,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { format } from "date-fns";

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications({}));
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Notifications</Typography>
        {notifications.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearAll}
            startIcon={<DeleteIcon />}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Paper elevation={2}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="textSecondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
                <ListItem
                  secondaryAction={
                    !notification.read && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )
                  }
                  sx={{
                    backgroundColor: notification.read
                      ? "transparent"
                      : "action.hover",
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={format(
                      new Date(notification.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;
