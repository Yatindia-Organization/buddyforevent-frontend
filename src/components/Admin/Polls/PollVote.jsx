import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { API_ROUTE } from '../../../lib/config';

export default function PollVote() {
  const { eventId } = useParams();
  const [polls, setPolls] = useState(null);
  const [votes, setVotes] = useState({}); // pollId -> selectedIndex
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });

  // fetch polls once
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/poll/event/${eventId}`);
        if (!res.ok) throw new Error('Failed to load polls');
        const { data } = await res.json();
        setPolls(data);
      } catch (err) {
        setSnackbar({ open:true, message:err.message, severity:'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const handleVote = async (pollId) => {
    const optionIndex = votes[pollId];
    if (optionIndex === undefined) {
      return setSnackbar({ open:true, message:'Select an option first', severity:'error' });
    }
    setSubmitting(s => ({ ...s, [pollId]: true }));
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/event/poll/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      // update poll in-place
      setPolls(ps => ps.map(p => p._id === pollId ? data : p));
      setSnackbar({ open:true, message:'Vote recorded!', severity:'success' });
    } catch (err) {
      setSnackbar({ open:true, message: err.message, severity:'error' });
    } finally {
      setSubmitting(s => ({ ...s, [pollId]: false }));
    }
  };

  if (loading) return <CircularProgress />;

  if (!polls || polls.length === 0) {
    return <Typography>No polls available for this event.</Typography>;
  }

  return (
    <Box className="p-4 space-y-6 max-w-2xl mx-auto">
      <Typography variant="h4" gutterBottom>
        Event Polls
      </Typography>

      {polls.map(poll => (
        <Paper key={poll._id} className="p-4">
          <Typography variant="h6">{poll.question}</Typography>
          <RadioGroup
            value={votes[poll._id] ?? ''}
            onChange={e =>
              setVotes(v => ({ ...v, [poll._id]: Number(e.target.value) }))
            }
          >
            {poll.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                value={i}
                control={<Radio />}
                label={`${opt.text} (${opt.votes} votes)`}
              />
            ))}
          </RadioGroup>
          <Box textAlign="right" mt={1}>
            <Button
              variant="contained"
              disabled={submitting[poll._id]}
              onClick={() => handleVote(poll._id)}
            >
              {submitting[poll._id] ? 'Voting…' : 'Vote'}
            </Button>
          </Box>
        </Paper>
      ))}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={()=>setSnackbar(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
