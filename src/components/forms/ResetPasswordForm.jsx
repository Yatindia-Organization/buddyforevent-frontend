import React, { useState } from 'react';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const evaluateStrength = (pwd) => {
        if (pwd.length < 6) return 'Weak';
        if (/\d/.test(pwd) && /[A-Z]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) return 'Strong';
        return 'Medium';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Password reset successfully');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch {
            setError('Server error. Try again.');
        };
    };

    const handleChange = (e) => {
        const pwd = e.target.value;
        setPassword(pwd);
        setStrength(evaluateStrength(pwd));
    };

    return (
        <div className=" w-full max-w-md p-[2vw] rounded ">
            <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
            <p className="mb-4 text-sm">Choose a new secure password.</p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-2  mb-[3vw] border-b-2 bg-inherit outline-none placeholder-black"
                    value={password}
                    onChange={handleChange}
                />
                {password && (
                    <p className={`text-sm mb-4 ${strength === 'Strong' ? 'text-green-600' : strength === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                        Strength: {strength}
                    </p>
                )}
                <button type="submit" className="w-full bg-black text-white p-2 rounded">
                    Reset Password
                </button>
            </form>
        </div>
    );
};
