// pages/CreateAdminForm.js
import React, { useState } from 'react';
// import Captcha from '../common/Captcha';

const CreateAccountForm = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    company: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Valid 10-digit mobile required';
    if (!form.company) newErrors.company = 'Company name is required';
    if (!form.location) newErrors.location = 'Company location is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password.match(/^(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      newErrors.password = 'Min 8 chars, 1 uppercase, 1 number';
    }
    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords must match';
    }
    if (!captchaChecked) newErrors.captcha = 'Please verify CAPTCHA';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch('/api/register-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await response.json();

        if (response.ok) {
          setSuccessMessage('Account created successfully!');
          setForm({ name: '', mobile: '', company: '', location: '', email: '', password: '', confirmPassword: '' });
        } else {
          setErrors({ general: data.message || 'Failed to create account' });
        }
      } catch (err) {
        setErrors({ general: 'Server error. Try again later.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-[88vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className=" w-full max-w-md p-[2vw] rounded ">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        {errors.general && <p className="text-red-500 mb-4 text-sm">{errors.general}</p>}
        {successMessage && <p className="text-green-600 mb-4 text-sm">{successMessage}</p>}

        {['name', 'mobile', 'company', 'location', 'email'].map(field => (
          <div className="mb-4" key={field}>
            <input
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-2 border-b-2 bg-inherit outline-none placeholder-black"
            />
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
          </div>
        ))}

        <div className="mb-[2vw]">
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

        <div className="mb-[2vw]">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border-b-2 bg-inherit outline-none placeholder-black"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        {/* <Captcha checked={captchaChecked} onChange={(e) => setCaptchaChecked(e.target.checked)} />
        {errors.captcha && <p className="text-red-500 text-sm">{errors.captcha}</p>} */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded mt-4"
        >
          {loading ? 'Submitting...' : 'Sign Up'}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account? <a href="/login" className="underline">login</a>
        </p>
      </form>
    </div>
  );
};

export default CreateAccountForm;
