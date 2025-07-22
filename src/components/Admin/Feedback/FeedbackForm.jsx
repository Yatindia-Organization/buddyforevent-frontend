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
  Rating,
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/event/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
 },
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
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Submit Feedback
        </Typography>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Your Name"
            variant="outlined"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="feedback-rating"
              value={rating}
              onChange={(_, newValue) => {
                if (newValue !== null) setRating(newValue);
              }}
              precision={1}
            />
          </Box>

          <TextField
            label="Comment"
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <Button
            variant="contained"
            color="primary"
            onClick={submitFeedback}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeedbackForm;
