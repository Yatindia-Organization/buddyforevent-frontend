// src/components/Admin/ParticipantLookup/ParticipantLookup.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useLocation } from 'react-router-dom';
import { API_ROUTE } from '../../../lib/config';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ParticipantLookup() {
  const { theme } = useTheme();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const eventId = params.get('eventId') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <Paper className="bg-card p-8 rounded-xl shadow-md text-center max-w-sm">
          <Typography variant="h6" className="mb-4">
            No event specified.
          </Typography>
          <Typography variant="body2">
            Add <code>?eventId=YOUR_EVENT_ID</code> to the URL.
          </Typography>
        </Paper>
      </div>
    );
  }

  const handleLookup = async () => {
    setError('');
    setQrUrl(null);

    if (!searchTerm.trim()) {
      setError('Enter a name, email or ticket number.');
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({ q: searchTerm, eventId }).toString();
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/participantSearch/participantLookup?${qs}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lookup failed');
      setQrUrl(json.qrcodeUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-bg text-text font-sans flex flex-col items-center">
      <Paper className="bg-card p-6 rounded-xl shadow-md w-full max-w-md">
        <Typography
          variant="h5"
          className="font-heading text-text mb-4 text-center"
           style={{
                  width: '100%',
                  height: 'auto',
                  margin:'10px'
                }}
        >
          Participant Lookup
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col gap-4"
        >
          <TextField
            label="Name, Email or Ticket #"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Button
            variant="contained"
            size="medium"
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={20} /> : 'Search'}
          </Button>
        </form>

        {error && (
          <Typography
            variant="body2"
            className="text-red-500 mt-4 text-center"
          >
            {error}
          </Typography>
        )}

        {qrUrl && (
          <Box className="mt-8 flex flex-col items-center">
            <Paper
              elevation={3}
              className="p-6 rounded-xl bg-white flex flex-col items-center"
              sx={{ width: '100%', maxWidth: { xs: 300, md: 400 } }}
            >
              <Typography
                variant="subtitle1"
                className="mb-4 text-text-secondary"
              >
                Your QR Code
              </Typography>

              <img
                src={qrUrl}
                alt="Participant QR Code"
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                href={qrUrl}
                download={`participant-${eventId}.png`}
                className="mt-10"
                 style={{
                  width: '100%',
                  height: 'auto',
                  margin:'10px'
                }}
              >
                Download
              </Button>
            </Paper>
          </Box>
        )}
      </Paper>
    </div>
  );
}
