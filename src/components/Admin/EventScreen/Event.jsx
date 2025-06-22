import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { format } from 'date-fns';         // for date formatting
import EventStatsChart from '../../echarts/EventStatsChart';
import { API_ROUTE } from '../../../lib/config';
import { useGlobalInfo } from '../../../contexts/globalContext';

export default function Event() {
  const context = useGlobalInfo();
  const id  = context.event;

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

  // Poll handlers unchanged...
  const handlePollChange = (i, v) => {
    const opts = [...poll.options]; opts[i] = v;
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Destructure exactly the fields your payload provides:
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

  // Format ISO dates into e.g. "Jun 18, 2025"
  const formattedDate = `${format(new Date(start_date), 'MMM d, yyyy')} – ${format(new Date(end_date), 'MMM d, yyyy')}`;
  const formattedTime = `${start_time} – ${end_time}`;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* LEFT */}
      <div className="w-full md:w-1/2 space-y-6">
        {/* Use cover_image from payload */}
        <img
          src={cover_image}
          alt="Event Cover"
          className={`object-cover rounded ${getImageHeight()}`}
        />

        <p className="text-center text-sm text-red-600 font-semibold">
          Please upload a picture of size 1280 × 720 px
        </p>

        <div className="flex justify-between">
          <Link to={`/event/${id}/edit`} className="flex items-center gap-2 text-blue-700">
            <img className="w-6" src="/svg/edit.svg" alt="Edit" />
            Edit Event
          </Link>
          <Link to={`/event/${id}/design`} className="flex items-center gap-2 text-blue-700">
            <img className="w-6" src="/svg/edit-design.svg" alt="Design" />
            Edit Design
          </Link>
          <Link to={`/event/${id}/preview`} className="flex items-center gap-2 text-blue-700">
            <img className="w-6" src="/svg/eye.svg" alt="Preview" />
            Preview
          </Link>
        </div>

        {/* Dynamic URLs using the event id */}
        <div className="space-y-4 p-3 bg-white rounded-lg">
          {[
            ['Live Count', `event/${id}/live-count`],
            ['Event Feedback', `event/${id}/feedback`],
            ['Live Poll', `event/${id}/polls`],
          ].map(([label, path]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="font-medium">{label} URL</span>
              <a
                href={`${API_ROUTE}/${path}`}
                className="underline text-blue-600 truncate w-40"
              >
                {`${API_ROUTE}/${path}`}
              </a>
              <div className="flex items-center space-x-1">
                <img src="/svg/copy.svg" alt="Copy" />
                <span className="font-medium">COPY</span>
              </div>
              <div className="flex items-center space-x-1">
                <img src="/svg/logo-whatsapp.svg" alt="Share" />
                <span className="font-medium">SHARE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 space-y-8">
        {/* Event name */}
        <h1 className="text-3xl font-bold text-indigo-900">{name}</h1>

        {/* Status/actions */}
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-600 text-white rounded">PUBLISHED</span>
          <button className="px-3 py-1 bg-yellow-500 text-white rounded">PAUSE EVENT</button>
          <button className="px-3 py-1 bg-red-500 text-white rounded">CANCEL EVENT</button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-indigo-900">EVENT LOGO</span>
          <img src={logo_image} alt="Logo" className="w-24" />
        </div>

        {/* Description & stats */}
        <div className="p-4 bg-white rounded-lg space-y-4 text-gray-700 text-sm">
          <div>
            <p className="font-medium text-indigo-900">EVENT DESCRIPTION</p>
            <p>{description}</p>
          </div>
          <div>
            <p className="font-medium text-indigo-900">EVENT OVERVIEW</p>
            <div className="mt-2 space-y-2">
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

          {/* Sales overview—replace these numbers with real data when available */}
          {/* <div>
            <p className="font-medium text-indigo-900">SALES OVERVIEW</p>
            <div className="flex justify-around mt-2">
              {[
                ['REGISTERED', event.registered || 0],
                ['GUEST REGISTERED', event.guest_registered || 0],
                ['VIEWS', event.views || 0],
              ].map(([label, val]) => (
                <div key={label} className="text-center">
                  <p className="text-green-600 font-bold">{val}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Stats chart */}
        {/* <EventStatsChart /> */}

        {/* Poll modal & snackbar unchanged */}
        {modalOpen && (
          /* ...modal code here (unchanged) */
          <div>…</div>
        )}
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
  );
}
