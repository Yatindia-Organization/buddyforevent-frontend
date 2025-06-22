// src/pages/FeedbackForm.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_ROUTE } from '../../../lib/config';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from '@mui/material';

const FeedbackForm = () => {
  const { eventId } = useParams();
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/event/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventId, user, rating, comment }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      alert('Feedback submitted successfully');
      setRating(1);
      setComment('');
      setUser('');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submit Feedback
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Your Name"
            variant="outlined"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
          <TextField
            label="Rating (1-5)"
            type="number"
            inputProps={{ min: 1, max: 5 }}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
          <TextField
            label="Comment"
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" onClick={submitFeedback} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeedbackForm;
