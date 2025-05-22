import React, { useState } from 'react';
import { useGlobalInfo } from '../../contexts/globalContext';
import { redirect } from 'react-router-dom';
import { API_ROUTE } from '../../lib/config';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Turnstile } from "@marsidev/react-turnstile"; // Cloudflare CAPTCHA

const LoginForm = () => {
    const context = useGlobalInfo();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const validate = () => {
        const newErrors = {};
        if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
        if (!form.password) newErrors.password = 'Password is required';
        if (!captchaToken) newErrors.captcha = 'Please complete the CAPTCHA';
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
                    body: JSON.stringify({ ...form, captchaToken }),
                });

                const data = await response.json();

                if (response.ok) {
                    const userRole = data?.user_type;
                    context.changeLoginFlow(true);
                    context.changeUserType(userRole);
                    context.changeUserId(data?._id || "681bc76f713723b2769a6bf5")


                    setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
                    setTimeout(() => {
                        context.changeLoginFlow(true);
                        redirect("/");
                    }, 1000);
                } else {
                    setSnackbar({ open: true, message: data.message || 'Invalid login credentials', severity: 'error' });
                }
            } catch (err) {
                setSnackbar({ open: true, message: 'Server error. Please try again later.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    const isFormValid = () => {
        return (
            /\S+@\S+\.\S+/.test(form.email) &&
            form.password.length > 0 &&
            captchaToken &&
            !loading
        );
    };

    return (
        <div className="h-[80vh] flex items-center justify-center">
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <form onSubmit={handleSubmit} className="w-full max-w-md p-[2vw] rounded ">
                <h2 className="text-2xl font-bold mb-2">Welcome back,</h2>
                <p className="mb-6 text-sm">Welcome back! Please enter your details.</p>

                <div className="mb-[2vw]">
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        variant="standard"
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                </div>

                <div className="mb-[2vw]">
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        variant="standard"
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>

                <div className="mb-[2vw]">
                    <Turnstile
                        siteKey="YOUR_CLOUDFLARE_SITE_KEY"
                        onSuccess={(token) => {
                            setCaptchaToken(token);
                            setErrors(prev => ({ ...prev, captcha: undefined }));
                        }}
                        onError={() => setCaptchaToken(null)}
                    />
                    {errors.captcha && <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>}
                </div>

                <div className="my-[2vw] flex justify-end">
                    <a href="/forgot-password" className="underline font-medium">Forgot Password</a>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid()}
                    className={`w-full bg-black text-white p-2 rounded mt-[1vw] ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Logging in...' : 'Log in'}
                </button>

                <div className="w-full flex justify-between items-center text-sm mt-4">
                    <span>
                        Don’t have an account? <a href="/create-account" className="underline font-medium">Sign up for free</a>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
