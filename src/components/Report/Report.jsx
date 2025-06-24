// src/components/Admin/Report/Report.jsx
import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert
} from '@mui/material';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function Report() {
  const { event: eventId } = useGlobalInfo();
  const [summary, setSummary] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });

  const showSnackbar = (msg, sev = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);

    const sumP = fetch(`${API_ROUTE}/api/v1/event/report/event/${eventId}`)
      .then(r => r.json())
      .then(j => {
        if (!j.success) throw new Error(j.message || 'Error loading summary');
        return j.data;
      });

    const subsP = fetch(
      `${API_ROUTE}/api/v1/event/participantSearch?eventId=${eventId}&page=1&limit=10000`
    ).then(r => r.json()).then(j => j.results || []);

    Promise.all([sumP, subsP])
      .then(([sum, subs]) => {
        setSummary(sum);
        setSubmissions(subs);
      })
      .catch(err => showSnackbar(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!eventId) {
    return <Typography color="error">No event selected.</Typography>;
  }

  // helper to display any value:
  const displayVal = val => {
    if (typeof val === 'boolean') {
      return val ? 'YES' : 'NO';
    }
    if (typeof val === 'string') {
      return val.toUpperCase();
    }
    if (Array.isArray(val)) {
      return val
        .map(d =>
          new Date(d)
            .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        )
        .join(', ');
    }
    if (val instanceof Date) {
      return val
        .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        .toUpperCase();
    }
    if (val != null) {
      // object or number
      return String(val).toUpperCase();
    }
    return '';
  };

  return (
    <Box className="relative p-4 bg-bg text-text min-h-screen">
      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Event Report
      </Typography>

      {/* Download */}
      <Box mb={2}>
        <MuiLink
          href={`${API_ROUTE}/api/v1/event/report/event/${eventId}/export`}
          underline="none"
        >
          <Button variant="contained">DOWNLOAD AS EXCEL</Button>
        </MuiLink>
      </Box>

      {/* Metrics */}
      {summary && (
        <Box mb={4} p={2} component={Paper}>
          <Typography variant="h6">SUMMARY</Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(160px,1fr))"
            gap={2}
            mt={1}
          >
            {Object.entries(summary.metrics).map(([k, v]) => (
              <Box
                key={k}
                p={1}
                bgcolor="var(--color-card-bg)"
                borderRadius={1}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  {k.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </Typography>
                <Typography variant="h6">{v ?? '—'}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Submissions Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {summary?.formSchema.map(f => (
                <TableCell key={f.id}>{f.label.toUpperCase()}</TableCell>
              ))}
              <TableCell>VISITORS</TableCell>
              <TableCell>ENTRY TIMES</TableCell>
              <TableCell>EXIT TIMES</TableCell>
              <TableCell>FOOD</TableCell>
              <TableCell>FOOD TIMES</TableCell>
              <TableCell>GIFT</TableCell>
              <TableCell>GIFT TIMES</TableCell>
              <TableCell>SUBMITTED AT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map(sub => (
              <TableRow key={sub._id}>
                {summary.formSchema.map(fld => {
                  const resp = sub.responses.find(r => r.fieldId === fld.id);
                  return (
                    <TableCell key={fld.id}>
                      {displayVal(resp?.value)}
                    </TableCell>
                  );
                })}

                <TableCell>
                  {displayVal(sub.visitorCount)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.entryTime)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.exitTime)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.food)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.foodTime)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.gift)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.giftTime)}
                </TableCell>
                <TableCell>
                  {displayVal(sub.submittedAt)}
                </TableCell>
              </TableRow>
            ))}

            {!loading && submissions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={
                    (summary?.formSchema.length || 0) + /* meta cols */ 8
                  }
                  align="center"
                >
                  NO SUBMISSIONS
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
