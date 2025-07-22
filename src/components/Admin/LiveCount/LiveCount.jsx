// src/components/Admin/LiveCount/LiveCount.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_ROUTE } from '../../../lib/config';
import { useTheme } from '../../../contexts/ThemeContext';

export default function EventLiveCount() {
  const { id } = useParams();
  const { theme, setTheme } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [eventInfo, setEventInfo] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live metrics; showLoader controls full-page spinner
  const fetchMetrics = async (showLoader = false) => {
    try {
      const token = localStorage.getItem('token');
      if (showLoader) setLoading(true);
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/liveCount/metrics?eventId=${id}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 }
      );
      if (!res.ok) throw new Error('Failed to load live count');
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Fetch event name and location once
  const fetchEventInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
      if (!res.ok) throw new Error('Failed to load event details');
      const { data } = await res.json();
      setEventInfo({ name: data.name, location: data.location });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchEventInfo();
    fetchMetrics(true);                         // first load shows spinner
    const iv = setInterval(() => fetchMetrics(false), 10000);
    return () => clearInterval(iv);
  }, [id]);

  // Initial loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-text font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-text" />
      </div>
    );
  }

  // Error fallback
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg text-primary font-sans">
        <p className="text-xl">{error}</p>
        <button
          onClick={() => fetchMetrics(true)}
          className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const items = [
    ['Total Participants', metrics.totalParticipants],
    ['Entries', metrics.entryCount],
    ['Exits', metrics.exitCount],
    ['Currently Inside the Hall', metrics.currentlyInside],
    ['Food Given', metrics.foodGivenCount],
    ['Gifts Given', metrics.giftGivenCount],
  ];

  return (
    <div className="min-h-screen p-8 bg-bg text-text font-sans relative">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 px-3 py-1 border rounded"
      >
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-heading">
          {eventInfo.name.toUpperCase()}
        </h1>
        <p className="text-xl text-text-secondary">
          {eventInfo.location.toUpperCase()}
        </p>
      </div>

      {/* Manual refresh */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => fetchMetrics(false)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded"
        >
          Refresh Now
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="bg-card p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-sm uppercase text-text-secondary mb-2">
              {label}
            </p>
            <p className="text-5xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* Timestamp */}
      <p className="mt-8 text-right text-xs text-text-secondary">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
