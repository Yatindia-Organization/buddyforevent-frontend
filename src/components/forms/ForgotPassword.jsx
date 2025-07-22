import React, { useState } from 'react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email address');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/send-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('OTP sent successfully!');
                setTimeout(() => {
                    window.location.href = '/otp-verification';
                }, 1000);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch {
            setError('Server error. Try again.');
        }
    };

    return (
        <div className=" w-full max-w-md h-[50vh] p-[2vw] rounded">
            <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
            <p className="mb-6 text-sm">Enter your email to receive an OTP.</p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    className="w-full p-2 mb-[3vw] border-b-2 bg-inherit outline-none placeholder-black"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    className="w-full bg-black text-white p-2 rounded"
                >
                    Send OTP
                </button>
            </form>
        </div>
    );
}
