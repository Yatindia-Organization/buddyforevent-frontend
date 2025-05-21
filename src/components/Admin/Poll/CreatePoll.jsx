import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import PollResultsChart from '../../echarts/PollResultsChart';

export default function CreatePoll() {
    const [modalOpen, setModalOpen] = useState(false);
    const [poll, setPoll] = useState({ question: '', options: [''] });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Simulated list of poll questions and results
    const questions = [
        {
            id: 1,
            question: 'Which feature do you like most?',
            results: [
                { label: 'Option A', count: 74779 },
                { label: 'Option B', count: 56565 },
                { label: 'Option C', count: 43837 },
                { label: 'Option D', count: 19027 },
            ],
            total: 507
        },
        {
            id: 2,
            question: 'What is your preferred tool?',
            results: [
                { label: 'Tool X', count: 30567 },
                { label: 'Tool Y', count: 25000 },
                { label: 'Tool Z', count: 21000 },
                { label: 'Tool W', count: 12765 },
            ],
            total: 415
        },
        {
            id: 3,
            question: 'Your go-to programming language?',
            results: [
                { label: 'Python', count: 60000 },
                { label: 'JavaScript', count: 58000 },
                { label: 'Java', count: 30000 },
                { label: 'C++', count: 20000 },
            ],
            total: 600
        },
    ];

    const [selectedQuestionId, setSelectedQuestionId] = useState(questions[0].id);
    const [pollData, setPollData] = useState({
        total: questions[0].total,
        options: questions[0].results
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleQuestionSelect = (e) => {
        const id = parseInt(e.target.value);
        setSelectedQuestionId(id);
        const selected = questions.find(q => q.id === id);
        if (selected) {
            setPollData({ total: selected.total, options: selected.results });
        }
    };

    const handlePollChange = (index, value) => {
        const newOptions = [...poll.options];
        newOptions[index] = value;
        setPoll({ ...poll, options: newOptions });
    };

    const addPollOption = () => {
        setPoll({ ...poll, options: [...poll.options, ''] });
    };

    const handlePollSubmit = async () => {
        const validOptions = poll.options.filter(opt => opt.trim() !== '');
        if (!poll.question.trim()) {
            showSnackbar('Poll question cannot be empty', 'error');
            return;
        }
        if (validOptions.length < 2) {
            showSnackbar('Please add at least two poll options.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_ROUTE}/api/v1/events/${id}/polls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...poll, options: validOptions }),
            });

            if (res.ok) {
                showSnackbar('Poll created successfully!', 'success');
                setModalOpen(false);
                setPoll({ question: '', options: [''] });
            } else {
                throw new Error('Failed to create poll');
            }
        } catch (err) {
            showSnackbar(err.message, 'error');
        }
    };

    return (
        <div className="p-4">
            <div className="text-xl font-semibold mb-4">Event Name</div>

            <div className="flex justify-between mb-4">
                <div>
                    <select
                        value={selectedQuestionId}
                        onChange={handleQuestionSelect}
                        className="p-2 border rounded"
                    >
                        {questions.map((q) => (
                            <option key={q.id} value={q.id}>
                                {q.question}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Create Poll
                    </button>
                </div>
            </div>

            <PollResultsChart data={pollData} />

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create a Poll</h2>
                        <input
                            type="text"
                            value={poll.question}
                            onChange={(e) => setPoll({ ...poll, question: e.target.value })}
                            placeholder="Enter your question"
                            className="w-full mb-3 p-2 border rounded"
                        />
                        {poll.options.map((option, idx) => (
                            <input
                                key={idx}
                                type="text"
                                value={option}
                                onChange={(e) => handlePollChange(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="w-full mb-2 p-2 border rounded"
                            />
                        ))}
                        <button onClick={addPollOption} className="text-blue-500 text-sm mb-4">+ Add Option</button>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-1 border rounded">Cancel</button>
                            <button onClick={handlePollSubmit} className="bg-green-600 text-white px-4 py-1 rounded">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
