import SignupForm from "./components/SignupForm";
import { CssBaseline, Box } from "@mui/material";

const App = () => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(167.96deg, #F4F9FF 0%, #E0EDFB 100%)",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SignupForm />
      </Box>
    </>
  );
};

export default App;
