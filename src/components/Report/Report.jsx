// src/components/Admin/Report/Report.jsx
import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  Paper,
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
  const [ticketMap, setTicketMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });

  const showSnackbar = (msg, sev = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
const token = localStorage.getItem('token');
    const sumP = fetch(`${API_ROUTE}/api/v1/event/report/event/${eventId}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 })
      .then(r => r.json()).then(j => {
        if (!j.success) throw new Error(j.message || 'Failed loading summary');
        return j.data;
      });

    const subsP = fetch(
      `${API_ROUTE}/api/v1/event/participantSearch?eventId=${eventId}&page=1&limit=10000`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 }
    ).then(r => r.json()).then(j => j.results || []);

    const ticketsP = fetch(`${API_ROUTE}/api/v1/event/tickets/event/${eventId}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 })
      .then(r => r.json()).then(j => {
        if (!j.success) throw new Error(j.message || 'Failed loading tickets');
        return j.data;
      });

    Promise.all([sumP, subsP, ticketsP])
      .then(([sum, subs, tickets]) => {
        setSummary(sum);
        setSubmissions(subs);
        const m = {};
        tickets.forEach(t => {
          m[t.userSubmissionId] = t.tierName.toUpperCase();
        });
        setTicketMap(m);
      })
      .catch(err => showSnackbar(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!eventId) {
    return <Typography color="error">No event selected.</Typography>;
  }

  // universal display helper
  const displayVal = val => {
    if (typeof val === 'boolean') return val ? 'YES' : 'NO';
    if (typeof val === 'string') return val.toUpperCase();
    if (Array.isArray(val))
      return val
        .map(d =>
          new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        )
        .join(', ');
    if (val instanceof Date)
      return new Date(val)
        .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        .toUpperCase();
    if (val != null && typeof val !== 'object') return String(val).toUpperCase();
    return '';
  };

  // render a single response value, handling {text, hyperlink} objects:
  const renderCell = val => {
    if (val && typeof val === 'object' && 'text' in val && 'hyperlink' in val) {
      return (
        <MuiLink
          href={val.hyperlink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {String(val.text).toUpperCase()}
        </MuiLink>
      );
    }
    return displayVal(val);
  };

  return (
    <Box className="relative p-4 bg-bg text-text min-h-screen">
      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        EVENT REPORT
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

      {/* Summary Metrics */}
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

      {/* Ticket Tiers Detail */}
      {summary?.ticketTiers?.length > 0 && (
        <Box mb={4} p={2} component={Paper}>
          <Typography variant="h6" gutterBottom>
            TICKET TIERS
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>NAME</TableCell>
                <TableCell>PRICE</TableCell>
                <TableCell>CAPACITY</TableCell>
                <TableCell>PERKS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.ticketTiers.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.name.toUpperCase()}</TableCell>
                  <TableCell>{t.price}</TableCell>
                  <TableCell>{t.capacity}</TableCell>
                  <TableCell>{t.perks.join(', ').toUpperCase()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Submissions Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>TIER</TableCell>
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
                <TableCell>{ticketMap[sub._id] || '—'}</TableCell>
                {summary.formSchema.map(fld => {
                  const resp = sub.responses.find(r => r.fieldId === fld.id);
                  return (
                    <TableCell key={fld.id}>
                      {renderCell(resp?.value)}
                    </TableCell>
                  );
                })}
                <TableCell>{displayVal(sub.visitorCount)}</TableCell>
                <TableCell>{renderCell(sub.entryTime)}</TableCell>
                <TableCell>{renderCell(sub.exitTime)}</TableCell>
                <TableCell>{displayVal(sub.food)}</TableCell>
                <TableCell>{renderCell(sub.foodTime)}</TableCell>
                <TableCell>{displayVal(sub.gift)}</TableCell>
                <TableCell>{renderCell(sub.giftTime)}</TableCell>
                <TableCell>{displayVal(sub.submittedAt)}</TableCell>
              </TableRow>
            ))}
            {!loading && submissions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={(summary?.formSchema.length || 0) + 10}
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
