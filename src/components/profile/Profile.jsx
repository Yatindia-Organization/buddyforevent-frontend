// src/components/Admin/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useGlobalInfo } from '../../contexts/globalContext';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function Profile() {
  const token = localStorage.getItem('token');
  const { changeUserId, changeUserType } = useGlobalInfo();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    company_name: '',
    company_gst_number: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      password: '',
      phone_number: userData.phone_number?.toString() || '',
      company_name: userData.company_name || '',
      company_gst_number: userData.company_gst_number || ''
    });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData._id;
    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      const res = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        // Update localStorage & context
        localStorage.setItem('user', JSON.stringify(result.data));
        changeUserId(result.data._id);
        changeUserType(result.data.user_type);
        setFormData(p => ({ ...p, password: '' }));
        alert('Profile updated successfully');
      } else {
        alert(result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--color-bg)',
        p: 2
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 600,
          width: '100%',
          bgcolor: 'var(--color-card-bg)'
        }}
      >
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              bgcolor: 'var(--color-primary)',
              width: 80,
              height: 80,
              mx: 'auto',
              fontSize: 32
            }}
          >
            {formData.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h6" mt={1} sx={{ color: 'var(--color-text)' }}>
            {formData.name || 'User'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            Edit your profile details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            ['Name', 'name', 'text'],
            ['Email', 'email', 'email'],
            ['Phone Number', 'phone_number', 'text'],
            ['Password', 'password', 'password'],
            ['Company Name', 'company_name', 'text'],
            ['Company GST Number', 'company_gst_number', 'text']
          ].map(([label, key, type]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={label}
                name={key}
                type={type}
                value={formData[key]}
                onChange={handleChange}
                placeholder={
                  key === 'password' ? 'Change Password' : undefined
                }
                variant="outlined"
                InputProps={{
                  sx: {
                    bgcolor: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--color-text-secondary)' }
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 5,
              py: 1.5,
              fontSize: 16,
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-hover)' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
