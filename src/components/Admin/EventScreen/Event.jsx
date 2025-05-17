import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventStatsChart from '../../echarts/EventStatsChart';

const API_ROUTE = 'https://your-api-url.com'; // Update to your real API

export default function Event() {
    const { id } = useParams();
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
            // try {
            //     const res = await fetch(`${API_ROUTE}/api/v1/events/${id}`);
            //     if (!res.ok) throw new Error('Event not found');
            //     const data = await res.json();
            //     setEvent(data);
            // } catch (err) {
            //     console.error(err);
            //     setEvent(null);
            // } finally {
            //     setLoading(false);
            // }
            setEvent({
                coverImage: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723822/xa9ad9tilpzy8kp6lrd9.jpg",
                description: "this is the event description ",
                endDate: "2025-05-10T18:30:00.000Z",
                eventImages: ["https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723824/nionl9y9u6lwdzwl9xmr.jpg", "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723824/xauhjqf3qadb4slcyq4a.jpg"],
                foodTracking: true,
                giftTracking: true,
                logoImage: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723823/z4zeg4o6axyte0xf3mkz.jpg",
                name: "event_010",
                eventType: "public",
                startDate: "2025-05-08T18:30:00.000Z",
            });
            setLoading(false);
        };
        fetchEvent();
    }, [id]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
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


    const getImageHeight = () => {
        switch (imageSize) {
            case 'small': return 'h-40';
            case 'large': return 'h-96';
            default: return 'h-64';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
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

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT */}
            <div className="w-full md:w-1/2 space-y-6">
                <img
                    src={event.coverImage}
                    alt="Cover"
                    className={`h-[30vw] object-cover rounded ${getImageHeight()}`}
                />

                <p className=' flex justify-center text-[14px] text-[#C11215] font-semibold'>Please enter a picture of size 1280 x 720 px</p>

                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-[0.8vw]'>
                        <img className='w-[2vw]' src="/svg/edit.svg" alt="icons" />
                        <p className='text-[16px] text-[#140088] font-medium'>Edit Event</p>
                    </div>
                    <div className='flex items-center gap-[0.8vw]'>
                        <img className='w-[2vw]' src="/svg/edit-design.svg" alt="icons" />
                        <p className='text-[16px] text-[#140088] font-medium'>Edit Design</p>
                    </div>
                    <div className='flex items-center gap-[0.8vw]'>
                        <img className='w-[2vw]' src="/svg/eye.svg" alt="icons" />
                        <p className='text-[16px] text-[#140088] font-medium'>Preview</p>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <a href="live-count" className='text-[#2A8BF2] text-[24px] underline'>View Live Count</a>
                    <a href="live-count" className='text-[#2A8BF2] text-[24px] underline'>Event FeedBack</a>
                    <a href="live-count" className='text-[#2A8BF2] text-[24px] underline'>Add Live Poll</a>
                </div>

                <div className='p-3 flex flex-col gap-[1vw] rounded-[15px] bg-white'>
                    <div className='flex justify-between items-center'>
                        <p className='text-[#000000] text-[14px] font-medium'>Live Update URL</p>
                        <a href="" className='w-[16vw] text-[13px] text-[#2A8BF2] underline'>https://in.explara.com/e/abc-event-oejqyfepdf92ob5</a>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/copy.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>COPY</p>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/logo-whatsapp.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>SHARE</p>
                        </div>
                    </div>
                    <div className='flex justify-between items-center'>
                        <p className='text-[#000000] text-[14px] font-medium'>EVENT FEEDBACK URL</p>
                        <a href="" className='w-[16vw] text-[13px] text-[#2A8BF2] underline'>https://in.explara.com/e/abc-event-oejqyfepdf92ob5</a>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/copy.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>COPY</p>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/logo-whatsapp.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>SHARE</p>
                        </div>
                    </div>
                    <div className='flex justify-between items-center'>
                        <p className='text-[#000000] text-[14px] font-medium'>LIVE POLL URL</p>
                        <a href="" className='w-[16vw] text-[13px] text-[#2A8BF2] underline'>https://in.explara.com/e/abc-event-oejqyfepdf92ob5</a>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/copy.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>COPY</p>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <img src="/svg/logo-whatsapp.svg" alt="image" />
                            <p className='text-[#000000] text-[14px] font-medium'>SHARE</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT */}
            <div className="w-full md:w-1/2 space-y-8">

                <div className='flex gap-[1vw] *:px-[1.4vw] *:py-[0.4vw] *:text-white *:text-[14px] *:rounded-[10px]'>
                    <div className='bg-[#419B01]'> PUBLISHED</div>
                    <div className='bg-[#2C96FF]'> PAUSE EVENT</div>
                    <div className='bg-[#2C96FF]'> CANCEL EVENT</div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-[0.4vw]'>
                        <p className='text-[16px] text-[#140088]'>EVENT LOGO</p>
                        <img className='w-[2vw]' src="/svg/edit.svg" alt="image" />
                    </div>
                    <div>
                        <img className='w-[6vw]' src="/images/logo-compony.svg" alt="image" />
                    </div>
                </div>

                <div className='p-4 flex flex-col gap-[1vw] rounded-[15px] bg-white text-[#424242] text-[14px]'>
                    <div>
                        <p className='text-[#140088] font-medium'>EVENT DESCRIPTION</p>
                        <p className="">{event.description}</p>
                    </div>
                    <div className='flex flex-col gap-[0.8vw]'>
                        <p className='text-[#140088] font-medium'>SALES OVERVIEW</p>
                        <div className='flex justify-around items-center'>
                            <div className='flex flex-col items-center justify-center'>
                                <p className='text-[#0CA31D]'>23</p>
                                <p>REGISTERED</p>
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                <p className='text-[#0CA31D]'>23</p>
                                <p>GUEST REGISTERED</p>
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                <p className='text-[#0CA31D]'>23</p>
                                <p>VIEWS</p>
                            </div>

                        </div>
                    </div>
                    <div className='flex flex-col gap-[0.8vw]'>
                        <p className='text-[#140088] font-medium'>EVENT OVERVIEW</p>
                        <div className='ml-[1vw] flex gap-[1vw]'>
                            <img className='w-[1vw]' src="/svg/location-pin.svg" alt="location-pin" />
                            <p>CHENNAI</p>
                        </div>
                        <div className='ml-[1vw] flex gap-[1vw]'>
                            <img className='w-[1vw]' src="/svg/calender.svg" alt="calender" />
                            <p>CHENNAI</p>
                        </div>
                        <div className='ml-[1vw] flex gap-[1vw]'>
                            <img className='w-[1vw]' src="/svg/timer.svg" alt="timer" />
                            <p>CHENNAI</p>
                        </div>
                    </div>
                </div>

                {/* Size Selector */}
                <div className="">
                    <EventStatsChart />
                </div>

                {/* Action Buttons */}
                {/* <div className="flex flex-wrap gap-3">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">Live Count</button>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded">Feedback Form</button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Create Poll
                    </button>
                </div> */}
            </div>

            {/* MODAL */}
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

            {/* SNACKBAR */}
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
