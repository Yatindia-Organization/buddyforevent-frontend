import React, { useState } from "react";
import { API_ROUTE } from "../../lib/config";
import { useGlobalInfo } from "../../contexts/globalContext";
import {
  Paper,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Typography,
  Snackbar,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { Turnstile } from "@marsidev/react-turnstile";  // ← commented out

export default function CreateAccountForm() {
  const context = useGlobalInfo();
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    company_name: "",
    company_gst_number: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "admin",
  });
  const [errors, setErrors] = useState({});
  // const [captchaToken, setCaptchaToken] = useState(null); // ← removed
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // const SITE_KEY = import.meta.env.VITE_CLOUDFLARE_SITE_KEY; // ← no longer needed
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => setSnackbar(s => ({ ...s, open: false }));

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === "phone_number" ? value.replace(/\D/g, "") : value,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone_number))
      errs.phone_number = "Enter a 10-digit phone";
    if (!form.company_name) errs.company_name = "Required";
    if (!form.company_gst_number) errs.company_gst_number = "Required";
    if (!form.location) errs.location = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password.match(/^(?=.*[A-Z])(?=.*\d).{8,}$/))
      errs.password = "Min 8 chars, 1 uppercase, 1 number";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords must match";
    // captcha no longer required
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid = () =>
    Object.keys(form).every(k => Boolean(form[k])) &&
    form.password === form.confirmPassword &&
    !loading;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTE}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create account");
      const user = data.data.newUsers[0];
      context.changeLoginFlow(true);
      context.changeUserType(user.user_type);
      context.changeUserId(user._id);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", user.user_type);
      localStorage.setItem("userId", user._id);
      setSnackbar({ open: true, message: "Account created!", severity: "success" });
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          bgcolor: "var(--color-card-bg)",
          color: "var(--color-text)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Create Account
        </Typography>
        <Typography variant="body2" mb={3} color="var(--color-text-secondary)">
          Fill in your details to register.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {[
              { name: "name", label: "Name" },
              { name: "phone_number", label: "Phone Number" },
              { name: "company_name", label: "Company Name" },
              { name: "company_gst_number", label: "Company GST Number" },
              { name: "location", label: "Location" },
              { name: "email", label: "Email", type: "email" },
            ].map(field => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={handleChange}
                variant="standard"
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]}
                size="small"
              />
            ))}

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
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

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
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/*
            <div>
              <Turnstile
                siteKey={SITE_KEY}
                onSuccess={token => { setCaptchaToken(token); setErrors(e => ({ ...e, captcha: undefined })); }}
                onError={() => setCaptchaToken(null)}
              />
              {errors.captcha && (
                <Typography color="error" variant="caption">
                  {errors.captcha}
                </Typography>
              )}
            </div>
            */}

            <Button type="submit" variant="contained" color="primary" disabled={!isFormValid()} fullWidth>
              {loading ? "Submitting..." : "Sign Up"}
            </Button>

            <Typography variant="body2" textAlign="center">
              Already have an account?{" "}
              <MuiLink href="/login" underline="hover" color="primary">
                Login
              </MuiLink>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </>
  );
}
