// src/components/Admin/CreatePoll/CreatePolls.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { API_ROUTE } from '../../../lib/config';

export default function CreatePolls() {
  const { event: eventId, userId } = useGlobalInfo();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOptionChange = (idx, value) => {
    const opts = [...options];
    opts[idx] = value;
    setOptions(opts);
  };

  const addOption = () => setOptions(opts => [...opts, '']);

  const removeOption = idx =>
    setOptions(opts => opts.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    const nonEmpty = options.filter(o => o.trim());
    if (!question.trim() || nonEmpty.length < 2) {
      return setSnackbar({
        open: true,
        message: 'Question and at least 2 non-empty options are required.',
        severity: 'error'
      });
    }

    setLoading(true);
    try {
      const payload = {
        event: eventId,
        question: question.trim(),
        options: nonEmpty,
        userId
      };
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/event/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());

      setSnackbar({
        open: true,
        message: 'Poll created!',
        severity: 'success'
      });
      setTimeout(() => navigate(`/admin/event/${eventId}`), 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className="p-6 max-w-xl mx-auto">
      <Typography variant="h5" gutterBottom>
        Create Poll for Event {eventId}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <TextField
          label="Question"
          fullWidth
          required
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <Stack spacing={2}>
          {options.map((opt, i) => (
            <Box
              key={i}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <TextField
                label={`Option #${i + 1}`}
                fullWidth
                required
                value={opt}
                onChange={e =>
                  handleOptionChange(i, e.target.value)
                }
              />
              {options.length > 2 && (
                <IconButton
                  onClick={() => removeOption(i)}
                  aria-label="Remove option"
                  size="large"
                >
                  <RemoveCircleIcon color="error" />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            variant="text"
            startIcon={<AddCircleIcon />}
            onClick={addOption}
          >
            Add option
          </Button>
        </Stack>

        <Box textAlign="right">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Poll'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(s => ({ ...s, open: false }))
        }
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
