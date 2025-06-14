import React, { useState } from "react";
import { API_ROUTE } from "../../lib/config";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNavigate } from "react-router-dom";
import { useGlobalInfo } from "../../contexts/globalContext";

const CreateAccountForm = () => {
  const context = useGlobalInfo();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    company_name: "",
    company_gst_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "admin"
  });

  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const SITE_KEY = import.meta.env.VITE_CLOUDFLARE_SITE_KEY;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone_number)) newErrors.phone_number = "Valid 10-digit number required";
    if (!form.company_name) newErrors.company_name = "Company name is required";
    if (!form.company_gst_number) newErrors.company_gst_number = "Company GST number is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password.match(/^(?=.*[A-Z])(?=.*\d).{8,}$/)) newErrors.password = "Min 8 chars, 1 uppercase, 1 number";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords must match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned = name === "phone_number" ? value.replace(/[^0-9]/g, "") : value;
    setForm({ ...form, [name]: cleaned });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch(`${API_ROUTE}/api/v1/auth/sign-up`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone_number: form.phone_number,
            company_name: form.company_name,
            company_gst_number: form.company_gst_number,
            user_type: form.user_type
          })
        });

        const data = await response.json();

        if (response.ok) {
          const user = data.data?.newUsers?.[0];
          const token = data.data?.token;
          context.changeLoginFlow(true);
          context.changeUserType(user.user_type);
          context.changeUserId(user._id);

          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userType", user.user_type);
          localStorage.setItem("userId", user._id);

          setSnackbar({ open: true, message: "Account created successfully!", severity: "success" });
          setTimeout(() => {
            navigate("/");
          }, 600);
        } else {
          setSnackbar({ open: true, message: data.message || "Failed to create account", severity: "error" });
        }
      } catch (err) {
        setSnackbar({ open: true, message: "Server error. Try again later.", severity: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const isFormValid = () => {
    const conditions = {
      name: form.name.trim().length > 0,
      phone: /^\d{10}$/.test(form.phone_number),
      company: form.company_name.trim().length > 0,
      gst: form.company_gst_number.trim().length > 0,
      email: /\S+@\S+\.\S+/.test(form.email),
      password: form.password.length > 0,
      confirmMatch: form.password === form.confirmPassword,
      captcha: true,
      loading: !loading
    };
    return Object.values(conditions).every(Boolean);
  };

  return (
    <div className="h-[90vh] overflow-y-auto flex items-center justify-center p-4">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <form onSubmit={handleSubmit} className="w-full max-w-md p-[2vw] rounded">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="mb-6 text-sm">Please fill in your details to get started.</p>

        {["name", "phone_number", "company_name", "company_gst_number", "email"].map((field) => (
          <div className="mb-[2vw]" key={field}>
            <TextField
              fullWidth
              label={field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              name={field}
              type="text"
              inputMode={field === "phone_number" ? "numeric" : undefined}
              value={form[field]}
              onChange={handleChange}
              variant="standard"
              error={Boolean(errors[field])}
              helperText={errors[field]}
            />
          </div>
        ))}

        <div className="mb-[2vw]">
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            variant="standard"
            error={Boolean(errors.password)}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </div>

        <div className="mb-[2vw]">
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            variant="standard"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm((prev) => !prev)} edge="end">
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </div>

        <div className="mb-[2vw]">
          <Turnstile
            siteKey={SITE_KEY}
            onSuccess={(token) => {
              setCaptchaToken(token);
              setErrors((prev) => ({ ...prev, captcha: undefined }));
            }}
            onError={() => setCaptchaToken(null)}
          />
          {errors.captcha && <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>}
        </div>

        <button
          type="submit"
          disabled={!isFormValid()}
          className={`w-full bg-black text-white p-2 rounded mt-[1vw] ${
            !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Sign Up"}
        </button>

        <div className="w-full flex justify-between items-center text-sm mt-4">
          <span>
            Already have an account? <a href="/login" className="underline font-medium">Login</a>
          </span>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountForm;
