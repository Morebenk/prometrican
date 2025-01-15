import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
} from "@mui/material";
import { useState } from "react";

const flagReasons = [
  { value: "Question", label: "Unclear or incorrect question" },
  { value: "Answer", label: "Incorrect answer or explanation" },
  { value: "Image", label: "Problem with image" },
  { value: "Other", label: "Other issue" },
];

const FlagQuestionDialog = ({ open, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = () => {
    onSubmit(reason === "Other" ? otherReason : reason);
    setReason("");
    setOtherReason("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Flag Question</DialogTitle>
      <DialogContent>
        <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
          {flagReasons.map((flagReason) => (
            <FormControlLabel
              key={flagReason.value}
              value={flagReason.value}
              control={<Radio />}
              label={flagReason.label}
            />
          ))}
        </RadioGroup>
        {reason === "Other" && (
          <Box mt={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Please specify the issue"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!reason || (reason === "Other" && !otherReason)}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlagQuestionDialog;
