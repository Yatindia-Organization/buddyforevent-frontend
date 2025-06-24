// src/components/Admin/EventScreen/Event.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { format } from 'date-fns';
import EventStatsChart from '../../echarts/EventStatsChart';
import { API_FRONTEND, API_ROUTE } from '../../../lib/config';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Event() {
  const { theme } = useTheme();
  const context = useGlobalInfo();
  const id = context.event;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [poll, setPoll] = useState({ question: '', options: [''] });
  const [imageSize, setImageSize] = useState('medium');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const { data } = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handlePollChange = (i, v) => {
    const opts = [...poll.options];
    opts[i] = v;
    setPoll({ ...poll, options: opts });
  };
  const addPollOption = () =>
    setPoll({ ...poll, options: [...poll.options, ''] });
  const handlePollSubmit = async () => {
    const valid = poll.options.filter(o => o.trim());
    if (!poll.question.trim()) return showSnackbar('Poll question cannot be empty', 'error');
    if (valid.length < 2) return showSnackbar('Please add at least two poll options.', 'error');
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/events/${id}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poll, options: valid }),
      });
      if (!res.ok) throw new Error('Failed to create poll');
      showSnackbar('Poll created successfully!');
      setModalOpen(false);
      setPoll({ question: '', options: [''] });
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const getImageHeight = () => {
    if (imageSize === 'small') return 'h-40';
    if (imageSize === 'large') return 'h-96';
    return 'h-64';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-text font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-text" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg text-text-secondary font-sans space-y-4">
        <h1 className="text-2xl font-heading">Event Not Found</h1>
        <p>The event you’re looking for doesn’t exist or has been removed.</p>
      </div>
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
  } = event;

  const formattedDate = `${format(new Date(start_date), 'MMM d, yyyy')} – ${format(new Date(end_date), 'MMM d, yyyy')}`;
  const formattedTime = `${start_time} – ${end_time}`;

  // build the new Live Count URL
  const liveCountPath = `live-count/${id}`;
  const liveCountUrl = `${API_ROUTE}/${liveCountPath}`;

  return (
    <div className="min-h-screen p-8 bg-bg text-text font-sans">
      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="w-full md:w-1/2 space-y-6">
          <img
            src={cover_image}
            alt="Event Cover"
            className={`object-cover rounded ${getImageHeight()} bg-card`}
          />

          <p className="text-center text-sm text-text-secondary font-semibold">
            Please upload a picture of size 1280 × 720 px
          </p>

          <div className="flex justify-between">
            <Link to={`/event-dashboard/eventedit/${id}`} className="flex items-center gap-2 text-primary">
              <img className="w-6" src="/svg/edit.svg" alt="Edit" />
              Edit Event
            </Link>
            <button
            onClick={async () => {
              if (!window.confirm('Are you sure you want to delete this event?')) return;
              try {
                const res = await fetch(`${API_ROUTE}/api/v1/event/userid/${id}`, {
                  method: 'DELETE',
                });
                if (!res.ok) throw new Error('Failed to delete');
                // Optionally notify user
                showSnackbar('Event deleted', 'success');
                // redirect somewhere—e.g. back to admin list
                window.location.href = '/admin/events';
              } catch (err) {
                showSnackbar(err.message, 'error');
              }
            }}
            className="flex items-center gap-2 text-red-500 hover:opacity-80"
          >
            <img className="w-6" src="/svg/icons8-delete-red.svg" alt="Delete" />
            Delete Event
          </button>
          </div>

          <div className="space-y-4 p-3 bg-card rounded-lg">
            {[
              ['Live Count', liveCountPath],
              ['Event Feedback', `feedback-entry/${id}`],
              ['Live Poll', `event/${id}/polls`],
            ].map(([label, path]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-medium">{label} URL</span>
                <a
                  href={`${API_FRONTEND}/${path}`}
                  className="underline text-primary truncate w-40"
                  target={label === 'Live Count' ? '' : '_blank'}
                  rel="noreferrer"
                >
                  {`${API_FRONTEND}/${path}`}
                </a>
                {/* <div className="flex items-center space-x-1">
                  <img src="/svg/copy.svg" alt="Copy" />
                  <span className="font-medium">COPY</span>
                </div>
                <div className="flex items-center space-x-1">
                  <img src="/svg/logo-whatsapp.svg" alt="Share" />
                  <span className="font-medium">SHARE</span>
                </div> */}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="text-3xl font-heading">{name}</h1>

          {/* Status / Actions */}
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-600 text-white rounded">PUBLISHED</span>
            <button className="px-3 py-1 bg-yellow-500 text-white rounded">PAUSE EVENT</button>
            <button className="px-3 py-1 bg-red-500 text-white rounded">CANCEL EVENT</button>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{`EVENT LOGO`}</span>
            <img src={logo_image} alt="Logo" className="w-24 rounded-full shadow" />
          </div>

          {/* Description & Overview */}
          <div className="p-4 bg-card rounded-lg space-y-4 text-text text-sm">
            <div>
              <p className="font-medium">EVENT DESCRIPTION</p>
              <p>{description}</p>
            </div>
            <div>
              <p className="font-medium">EVENT OVERVIEW</p>
              <div className="mt-2 space-y-2 text-text-secondary">
                <div className="flex items-center gap-2">
                  <img className="w-4" src="/svg/location-pin.svg" alt="" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="w-4" src="/svg/calender.svg" alt="" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img className="w-4" src="/svg/timer.svg" alt="" />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Poll & Snackbar */}
          {modalOpen && <div>…modal…</div>}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(o => ({ ...o, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar(o => ({ ...o, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}
