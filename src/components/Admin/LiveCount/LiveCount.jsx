import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_ROUTE } from '../../../lib/config';

export default function EventLiveCount() {
  const { id } = useParams();
  const [metrics, setMetrics] = useState(null);
  const [eventInfo, setEventInfo] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/liveCount/metrics?eventId=${id}`
      );
      if (!res.ok) throw new Error('Failed to load live count');
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch event details
  const fetchEventInfo = async () => {
    try {
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/eventid/${id}`
      );
      if (!res.ok) throw new Error('Failed to load event details');
      const { data } = await res.json();
      setEventInfo({ name: data.name, location: data.location });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchEventInfo();
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-red-500">
        <p className="text-xl">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  // Metrics items
  const items = [
    ['Total Participants', metrics.totalParticipants],
    ['Expected Visitors', metrics.totalExpectedVisitors],
    ['Entries', metrics.entryCount],
    ['Exits', metrics.exitCount],
    ['Currently Inside', metrics.currentlyInside],
    ['Food Given', metrics.foodGivenCount],
    ['Gifts Given', metrics.giftGivenCount],
    ['QR Scanned', metrics.qrScannedCount],
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      {/* Event header */}
      <div className="mb-6">
        <h1 className="text-5xl font-bold text-center mx-auto w-full">{eventInfo.name.toUpperCase()}</h1>
        <p className="text-xl text-gray-400 text-center mx-auto w-full">{eventInfo.location.toUpperCase()}</p>
      </div>

      {/* Refresh control */}
      <div className="flex justify-end mb-6">
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Refresh Now
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="bg-gray-800 p-6 rounded-xl shadow-lg text-center"
          >
            <p className="text-sm uppercase text-gray-400 mb-2">{label}</p>
            <p className="text-5xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* Last update timestamp */}
      <p className="mt-8 text-right text-xs text-gray-500">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
