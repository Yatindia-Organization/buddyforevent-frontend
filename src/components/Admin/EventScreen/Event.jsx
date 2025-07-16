// src/components/Admin/EventScreen/Event.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Snackbar,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { green, orange, red, grey } from '@mui/material/colors';
import { format } from 'date-fns';
import { API_FRONTEND, API_ROUTE } from '../../../lib/config';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Event() {
  const { theme } = useTheme();
  const { event: eventId } = useGlobalInfo();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imgIndex, setImgIndex] = useState(0);

  // map each status to a color
  const colorMap = {
    published: green[700],
    pause:    orange[800],
    cancelled:red[700],
    end:      grey[600],
  };

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const { data } = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  const showSnackbar = (msg, sev = 'success') => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const handleStatusChange = async e => {
    const newStatus = e.target.value;
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/event/userid/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setEvent(evt => ({ ...evt, status: newStatus }));
      showSnackbar(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, 'error');
    }
  };

  const prevImage = () => setImgIndex(i => Math.max(0, i - 1));
  const nextImage = () =>
    setImgIndex(i =>
      event && event.event_images
        ? Math.min(event.event_images.length - 1, i + 1)
        : i
    );

  if (loading) {
    return (
      <Box
        className="flex items-center justify-center h-screen bg-bg text-text font-sans"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box
        className="flex flex-col items-center justify-center h-screen bg-bg text-text-secondary font-sans space-y-4"
      >
        <Typography variant="h4">Event Not Found</Typography>
        <Typography>The event you’re looking for doesn’t exist or has been removed.</Typography>
      </Box>
    );
  }

  const {
    name,
    cover_image,
    logo_image,
    description,
    location,
    start_date,
    end_date,
    start_time,
    end_time,
    status,
    event_images = [],
  } = event;

  const formattedDate = `${format(new Date(start_date), 'MMM d, yyyy')} – ${format(
    new Date(end_date),
    'MMM d, yyyy'
  )}`;
  const formattedTime = `${start_time} – ${end_time}`;

  // shareable & live‐count links
  const liveCountPath = `#/live-count/${eventId}`;
  const shareable = [
    ['Shareable Link', `#/participant-lookup?eventId=${eventId}`],
    ['Live Count', liveCountPath],
    ['Event Feedback', `#/feedback-entry/${eventId}`],
    ['Live Poll', `#/event/${eventId}/polls`],
  ];

  return (
    <Box className="min-h-screen p-8 bg-bg text-text font-sans">
      <Box className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <Box className="w-full md:w-1/2 space-y-6">
          <img
            src={cover_image}
            alt="Event Cover"
            className="object-cover rounded h-64 bg-card w-full"
          />
          <Typography variant="caption" className="text-center block text-text-secondary">
            Please upload a picture of size 1280 × 720 px
          </Typography>

          <Box className="flex justify-between">
            <Link to={`/event-dashboard/eventedit/${eventId}`} className="text-primary flex items-center gap-2">
              <img src="/svg/edit.svg" alt="Edit" className="w-6" />
              Edit Event
            </Link>
            <button
              className="text-red-500 flex items-center gap-2 hover:opacity-80"
              onClick={async () => {
                if (!window.confirm('Delete this event?')) return;
                try {
                  const res = await fetch(`${API_ROUTE}/api/v1/event/userid/${eventId}`, {
                    method: 'DELETE',
                  });
                  if (!res.ok) throw new Error('Failed to delete');
                  showSnackbar('Event deleted');
                  window.location.href = '/admin/events';
                } catch (err) {
                  console.error(err);
                  showSnackbar(err.message, 'error');
                }
              }}
            >
              <img src="/svg/icons8-delete-red.svg" alt="Delete" className="w-6" />
              Delete Event
            </button>
          </Box>

          <Box className="space-y-4 p-3 bg-card rounded-lg">
            {shareable.map(([label, path]) => (
              <Box key={label} className="flex justify-between items-center">
                <Typography className="font-medium">{label} URL</Typography>
                <a
                  href={`${API_FRONTEND}/${path}`}
                  target={label === 'Live Count' ? undefined : '_blank'}
                  rel="noreferrer"
                  className="underline text-primary truncate w-40"
                >
                  {`${API_FRONTEND}/${path}`}
                </a>
              </Box>
            ))}
          </Box>
        </Box>

        {/* RIGHT COLUMN */}
        <Box className="w-full md:w-1/2 space-y-6">
          <Typography variant="h3" className="font-heading">{name}</Typography>

          {/* ——— STATUS ——— */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>Status:</Typography>

            {status === 'end' ? (
              <Typography
                sx={{
                  color: colorMap.end,
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}
              >
                Ended
              </Typography>
            ) : (
              <Select
                value={status}
                onChange={handleStatusChange}
                size="small"
                renderValue={val => (
                  <Typography sx={{
                    color: colorMap[val],
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {val}
                  </Typography>
                )}
                sx={{
                  '& .MuiSelect-select': {
                    color: colorMap[status],
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }
                }}
              >
                <MenuItem value="published">
                  <Typography sx={{ color: colorMap.published }}>Published</Typography>
                </MenuItem>
                <MenuItem value="pause">
                  <Typography sx={{ color: colorMap.pause }}>Pause</Typography>
                </MenuItem>
                <MenuItem value="cancelled">
                  <Typography sx={{ color: colorMap.cancelled }}>Cancelled</Typography>
                </MenuItem>
              </Select>
            )}
          </Box>

          {/* ——— LOGO ——— */}
          <Box className="flex items-center justify-between">
            <Typography variant="h6">EVENT LOGO</Typography>
            <img src={logo_image} alt="Logo" className="w-24 rounded-full shadow" />
          </Box>

          {/* ——— DESCRIPTION & OVERVIEW ——— */}
          <Box className="p-4 bg-card rounded-lg space-y-4 text-sm text-text">
            <Box>
              <Typography variant="subtitle1">EVENT DESCRIPTION</Typography>
              <Typography>{description}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">EVENT OVERVIEW</Typography>
              <Box className="mt-2 space-y-2 text-text-secondary">
                <Box className="flex items-center gap-2">
                  <img src="/svg/location-pin.svg" alt="" className="w-4" />
                  <Typography>{location}</Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <img src="/svg/calender.svg" alt="" className="w-4" />
                  <Typography>{formattedDate}</Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <img src="/svg/timer.svg" alt="" className="w-4" />
                  <Typography>{formattedTime}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ——— IMAGE CAROUSEL ——— */}
          <Typography className="font-medium">EVENT IMAGES</Typography>
          {event_images.length > 0 && (
            <Box className="relative">
              <img
                src={event_images[imgIndex]}
                alt={`Slide ${imgIndex + 1}`}
                className="w-full rounded bg-card object-contain"
                style={{ maxHeight: '400px' }}
              />
              <IconButton
                onClick={prevImage}
                disabled={imgIndex === 0}
                sx={{ position: 'absolute', top: '50%', left: 8 }}
              >
                <ArrowBackIos />
              </IconButton>
              <IconButton
                onClick={nextImage}
                disabled={imgIndex === event_images.length - 1}
                sx={{ position: 'absolute', top: '50%', right: 8 }}
              >
                <ArrowForwardIos />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* ——— GLOBAL SNACKBAR ——— */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
