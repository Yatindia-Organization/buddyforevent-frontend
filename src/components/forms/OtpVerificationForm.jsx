import React, { useState } from 'react';

export default function OtpVerificationForm() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');

    const handleChange = (value, index) => {
        const updated = [...otp];
        updated[index] = value.slice(-1); // Only last digit
        setOtp(updated);
        // Move focus
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (value && nextInput) nextInput.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 4) {
            setError('Please enter the complete OTP');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp: enteredOtp }),
            });
            const data = await res.json();

            if (res.ok) {
                window.location.href = '/reset-password';
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch {
            setError('Server error. Try again.');
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded ">
            <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
            <p className="mb-4 text-sm">A 4-digit code was sent to your email.</p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="flex justify-between gap-2 mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            className="w-12 h-12 p-2 flex items-center justify-center border-b-2 bg-inherit outline-none placeholder-black"
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                        />
                    ))}
                </div>
                <button type="submit" className="w-full bg-black text-white p-2 rounded">
                    Verify OTP
                </button>
            </form>
        </div>
    );
}
