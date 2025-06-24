import React, { useState, useEffect } from 'react';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { API_ROUTE } from '../../../lib/config';
import {
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PollResultsChart from '../../echarts/PollResultsChart';

export default function Polls() {
  const { event: eventId, userId } = useGlobalInfo();

  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState('');
  const [pollData, setPollData] = useState({ total: 0, options: [] });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Fetch polls on mount or when eventId changes
  useEffect(() => {
    if (!eventId) return;
    const controller = new AbortController();

    async function loadPolls() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_ROUTE}/api/v1/event/poll/event/${eventId}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to load polls');

        setPolls(json.data);

        if (json.data.length > 0) {
          const first = json.data[0];
          setSelectedPollId(first._id);
          setPollData({
            total: first.options.reduce((sum, o) => sum + o.votes, 0),
            options: first.options,
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          showSnackbar(err.message, 'error');
        }
      } finally {
        setLoading(false);
      }
    }

    loadPolls();
    return () => controller.abort();
  }, [eventId]);

  const handleQuestionSelect = e => {
    const pid = e.target.value;
    setSelectedPollId(pid);
    const poll = polls.find(p => p._id === pid);
    if (poll) {
      setPollData({
        total: poll.options.reduce((sum, o) => sum + o.votes, 0),
        options: poll.options,
      });
    }
  };

  // New-poll form handlers
  const handleNewQuestion = e =>
    setNewPoll(p => ({ ...p, question: e.target.value }));
  const handleNewOptionChange = (i, v) => {
    setNewPoll(p => {
      const opts = [...p.options];
      opts[i] = v;
      return { ...p, options: opts };
    });
  };
  const addNewOption = () =>
    setNewPoll(p => ({ ...p, options: [...p.options, ''] }));

  const handleNewSubmit = async () => {
    const valid = newPoll.options.filter(o => o.trim());
    if (!newPoll.question.trim()) {
      return showSnackbar('Question cannot be empty', 'error');
    }
    if (valid.length < 2) {
      return showSnackbar('At least two options required', 'error');
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_ROUTE}/api/v1/event/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventId,
          question: newPoll.question.trim(),
          options: valid,
          userId,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create poll');
      }

      showSnackbar('Poll created!', 'success');
      setModalOpen(false);
      setNewPoll({ question: '', options: ['', ''] });

      // Refresh polls
      const freshRes = await fetch(
        `${API_ROUTE}/api/v1/event/poll/event/${eventId}`
      );
      const freshJson = await freshRes.json();
      if (freshJson.success) {
        setPolls(freshJson.data);
        if (freshJson.data.length > 0) {
          const f = freshJson.data[0];
          setSelectedPollId(f._id);
          setPollData({
            total: f.options.reduce((sum, o) => sum + o.votes, 0),
            options: f.options,
          });
        }
      }
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart input
  const chartData = Array.isArray(pollData.options)
    ? pollData.options.map(opt => ({
        label: opt.text,
        value: opt.votes,
      }))
    : [];

  return (
    <div className="relative p-4 bg-bg text-text min-h-screen">
      {/* Loading backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <h2 className="text-2xl font-semibold mb-4">Polls</h2>

      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <select
          value={selectedPollId || ''}
          onChange={handleQuestionSelect}
          className="p-2 border rounded bg-card text-text flex-1"
        >
          {polls.map(p => (
            <option key={p._id} value={p._id}>
              {p.question}
            </option>
          ))}
        </select>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
        >
          Create Poll
        </button>
      </div>

      {chartData.length > 0 ? (
        <PollResultsChart data={chartData} total={pollData.total} />
      ) : (
        <p className="text-text-secondary">No poll data to display.</p>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-card p-6 rounded w-full max-w-lg text-text">
            <h3 className="text-xl font-semibold mb-4">New Poll</h3>
            <input
              type="text"
              value={newPoll.question}
              onChange={handleNewQuestion}
              placeholder="Question"
              className="w-full mb-3 p-2 border rounded bg-card text-text"
            />
            {newPoll.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={e => handleNewOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="w-full mb-2 p-2 border rounded bg-card text-text"
              />
            ))}
            <button
              onClick={addNewOption}
              className="text-primary text-sm mb-4"
            >
              + Add Option
            </button>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1 border rounded hover:bg-card"
              >
                Cancel
              </button>
              <button
                onClick={handleNewSubmit}
                className="bg-primary text-white px-4 py-1 rounded hover:bg-primary-hover"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
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
    </div>
  );
}
