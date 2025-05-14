import React, { useState } from 'react';
import { useGlobalInfo } from '../../contexts/globalContext';
import { redirect } from 'react-router-dom';
import { API_ROUTE } from '../../lib/config';

const LoginForm = () => {
    const context = useGlobalInfo();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
        if (!form.password) newErrors.password = 'Password is required';
        // if (!captchaChecked) newErrors.captcha = 'Please verify CAPTCHA';
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (validate()) {

            setLoading(true);
            try {
                const response = await fetch(`${API_ROUTE}/api/v1/auth/sign-in`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                console.log("login validated - clicked ", `${API_ROUTE}/api/v1/auth/sign-in`);
                const data = await response.json();

                if (response.ok) {
                    setLoginSuccess('Login successful!');

                } else {
                    setErrors({ general: data.message || 'Invalid login credentials' });
                }
            } catch (err) {
                setErrors({ general: 'Server error. Please try again later.' });
            } finally {
                setLoading(false);
                context.changeLoginFlow(false);
                redirect("/dashboard")
            }
        }
    };

    return (
        <div className="h-[80vh] flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-[2vw] rounded ">
                <h2 className="text-2xl font-bold mb-2">Welcome back,</h2>
                <p className="mb-6 text-sm">Please enter your details.</p>

                {errors.general && <p className="text-red-500 text-sm mb-2">{errors.general}</p>}
                {loginSuccess && <p className="text-green-600 text-sm mb-2">{loginSuccess}</p>}

                <div className="mb-[2vw]">
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border-b-2 bg-inherit outline-none placeholder-black"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border-b-2 bg-inherit outline-none placeholder-black"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                {/* 
        <Captcha checked={captchaChecked} onChange={(e) => setCaptchaChecked(e.target.checked)} />
        {errors.captcha && <p className="text-red-500 text-sm">{errors.captcha}</p>} */}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-2 rounded mt-[4vw]"
                >
                    {loading ? 'Logging in...' : 'Log in'}
                </button>

                <div className="flex justify-between text-sm mt-4">
                    <a href="/forgot-password" className="underline">Forgot Password</a>
                    <span>
                        Don’t have an account? <a href="/create-account" className="underline">Sign up for free</a>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
