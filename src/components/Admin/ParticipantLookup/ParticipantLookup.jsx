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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
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
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); // For dev mode

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

  const handleSearch = async () => {
    setError('');
    setParticipants([]);
    setQrUrl(null);
    setSelectedParticipant(null);

    if (!searchTerm.trim()) {
      setError('Enter a name, email or ticket number.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams({ q: searchTerm, eventId }).toString();
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/participantSearch/findParticipants?${qs}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 }
      );
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Search failed');
      
      setParticipants(json.participants || []);
      if (json.participants.length === 0) {
        setError('No participants found matching your search.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantSelect = async (participant) => {
    setSelectedParticipant(participant);
    setOtpError('');
    setOtp('');
    setGeneratedOtp('');
    
    // Send OTP
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/event/participantSearch/sendOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          participantId: participant.id,
          eventId: eventId
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send OTP');
      
      // In development, show the OTP
      if (json.otp) {
        setGeneratedOtp(json.otp);
      }
      
      setShowOTPDialog(true);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/event/participantSearch/verifyOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          participantId: selectedParticipant.id,
          otp: otp,
          eventId: eventId
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'OTP verification failed');
      
      setQrUrl(json.qrcodeUrl);
      setShowOTPDialog(false);
      setParticipants([]); // Clear search results
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const formatParticipantDisplay = (participant) => {
    const primaryInfo = [];
    const secondaryInfo = [];
    
    // Add participant name if available
    if (participant.participant) {
      primaryInfo.push(participant.participant);
    }
    
    // Add visitor count if available
    if (participant.visitorCount) {
      secondaryInfo.push(`Ticket #${participant.visitorCount}`);
    }
    
    // Add seat if available
    if (participant.seat) {
      secondaryInfo.push(`Seat: ${participant.seat}`);
    }
    
    // Add relevant responses
    participant.responses.forEach(response => {
      if (response.value && response.value.length > 0) {
        secondaryInfo.push(response.value);
      }
    });
    
    return {
      primary: primaryInfo.join(' - ') || 'Participant',
      secondary: secondaryInfo.join(' | ')
    };
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
            margin: '10px'
          }}
        >
          Participant Lookup
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
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
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        {/* Participant Selection List */}
        {participants.length > 0 && (
          <Box className="mt-6">
            <Typography variant="h6" className="mb-3">
              Select Participant:
            </Typography>
            <List>
              {participants.map((participant, index) => {
                const displayInfo = formatParticipantDisplay(participant);
                return (
                  <ListItem key={participant.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleParticipantSelect(participant)}
                      disabled={otpLoading}
                      className="rounded-lg mb-2 border border-gray-200"
                    >
                      <ListItemText
                        primary={displayInfo.primary}
                        secondary={displayInfo.secondary}
                        primaryTypographyProps={{
                          variant: 'body1',
                          fontWeight: 'medium'
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* QR Code Display */}
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
                className="mt-4"
                style={{
                  width: '100%',
                  height: 'auto',
                  margin: '10px'
                }}
              >
                Download
              </Button>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onClose={() => setShowOTPDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4">
            An OTP has been sent. Please enter it below to access the QR code.
          </Typography>
          
          {/* Development mode: Show generated OTP */}
          {generatedOtp && (
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                <strong>Development Mode:</strong> OTP is {generatedOtp}
              </Typography>
            </Alert>
          )}
          
          <TextField
            label="Enter OTP"
            variant="outlined"
            size="small"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={!!otpError}
            helperText={otpError}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOTPDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleOTPVerification} 
            disabled={otpLoading}
            variant="contained"
          >
            {otpLoading ? <CircularProgress size={20} /> : 'Verify OTP'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}