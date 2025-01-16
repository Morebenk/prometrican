import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Quiz,
  Subject,
  Bookmark,
  Flag,
  Assessment,
  Subscriptions,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Quizzes", icon: <Quiz />, path: "/quizzes" },
  { text: "Subjects", icon: <Subject />, path: "/subjects" },
  { text: "Bookmarks", icon: <Bookmark />, path: "/bookmarks" },
  { text: "Flagged", icon: <Flag />, path: "/flagged" },
  { text: "Progress", icon: <Assessment />, path: "/progress" },
  { text: "Subscriptions", icon: <Subscriptions />, path: "/subscriptions" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          top: 64,
          height: "calc(100% - 64px)",
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
