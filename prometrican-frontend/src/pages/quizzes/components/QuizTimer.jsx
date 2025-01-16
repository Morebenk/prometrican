import { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";

const QuizTimer = ({ onTimeUpdate }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
      onTimeUpdate(seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onTimeUpdate]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <AccessTimeIcon color="action" />
      <Typography variant="h6">{formatTime(seconds)}</Typography>
    </Box>
  );
};

export default QuizTimer;
