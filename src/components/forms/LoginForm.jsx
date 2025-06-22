// src/components/forms/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalInfo } from "../../contexts/globalContext";
import { API_ROUTE } from "../../lib/config";
import {
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Stack,
  Button,
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginForm() {
  const context = useGlobalInfo();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const validate = () => {
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const user = data.data.existingUser;
        const token = data.data.token;
        context.changeLoginFlow(true);
        context.changeUserType(user.user_type);
        context.changeUserId(user._id);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", user.user_type);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setSnackbar({
          open: true,
          message: "Login successful!",
          severity: "success",
        });
        setTimeout(() => navigate("/"), 1000);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Invalid credentials",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Server error. Try again later.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    /\S+@\S+\.\S+/.test(form.email) && form.password && !loading;

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
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Welcome back,
        </Typography>
        <Typography variant="body2" mb={3} color="var(--color-text-secondary)">
          Please enter your details to log in.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
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
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="flex justify-end">
              <MuiLink
                component="a"
                href="/forgot-password"
                underline="hover"
                color="primary"
              >
                Forgot Password?
              </MuiLink>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isFormValid()}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <Typography variant="body2" textAlign="center">
              Don't have an account?{" "}
              <MuiLink component="a" href="/create-account" underline="hover">
                Sign up for free
              </MuiLink>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </>
  );
}