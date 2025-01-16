import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

const ActiveSubscriptions = ({ subscriptions }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Subscriptions
        </Typography>
        {subscriptions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              No active subscriptions
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/subscriptions")}
            >
              View Plans
            </Button>
          </Box>
        ) : (
          <List>
            {subscriptions.map((subscription) => {
              const daysRemaining = differenceInDays(
                new Date(subscription.end_date),
                new Date()
              );

              return (
                <ListItem key={subscription._id}>
                  <ListItemText
                    primary={subscription.subject.name}
                    secondary={`${daysRemaining} days remaining`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/subscriptions/${subscription._id}`)
                      }
                    >
                      Manage
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSubscriptions;
