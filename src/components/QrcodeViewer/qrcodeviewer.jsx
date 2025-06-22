import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { API_ROUTE } from '../../lib/config';

export default function QRDisplay() {
  const { submissionId } = useParams();
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [qrcodeUrl, setQrcodeUrl] = useState('');

  useEffect(() => {
    if (!submissionId) {
      setError('No submission ID provided');
      setLoading(false);
      return;
    }

    fetch(`${API_ROUTE}/api/v1/event/form-submission/${submissionId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setQrcodeUrl(data.qrcodeUrl);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [submissionId]);

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box textAlign="center" mt={4}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" mt={4} px={2}>
      <Box
        component="img"
        src={qrcodeUrl}
        alt="QR Code"
        sx={{
          width: '100%',
          maxWidth: 300,    // <-- shrink the max width
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}
