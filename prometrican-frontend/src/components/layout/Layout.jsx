import { Box, Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
