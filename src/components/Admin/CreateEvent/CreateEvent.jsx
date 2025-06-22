// src/components/Admin/CreateEvent/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  Stack,
  Radio,
  RadioGroup,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../../../lib/utils/cloudinary';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { API_ROUTE } from '../../../lib/config';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { userId } = useGlobalInfo();

  const [formData, setFormData] = useState({
    name: '',
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null,
    user: userId,
    location: '',
    description: '',
    cover_image: null,
    logo_image: null,
    event_images: [],
    public_event: null,
    food_tracking: true,
    gift_tracking: true,
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleFileChange = e => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'event_images' ? [...prev.event_images, ...Array.from(files)] : files[0],
    }));
  };

  const validate = () => {
    const temp = {};
    if (!formData.name) temp.name = 'Required';
    if (!formData.location) temp.location = 'Required';
    if (!formData.cover_image) temp.cover_image = 'Required';
    if (!formData.logo_image) temp.logo_image = 'Required';
    if (formData.public_event === null) temp.public_event = 'Select one';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const [coverUrl] = formData.cover_image ? await uploadToCloudinary([formData.cover_image]) : [''];
      const [logoUrl] = formData.logo_image ? await uploadToCloudinary([formData.logo_image]) : [''];
      const eventUrls = formData.event_images.length
        ? await uploadToCloudinary(formData.event_images)
        : [];

      const payload = {
        ...formData,
        cover_image: coverUrl,
        logo_image: logoUrl,
        event_images: eventUrls,
        start_date: formData.start_date?.toISOString().slice(0, 10) || null,
        end_date: formData.end_date?.toISOString().slice(0, 10) || null,
        start_time: formData.start_time?.toTimeString().slice(0, 5) || null,
        end_time: formData.end_time?.toTimeString().slice(0, 5) || null,
      };

      const res = await fetch(`${API_ROUTE}/api/v1/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnackbar({ open: true, message: `Event "${formData.name}" created!`, severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Typography variant="h4" mb={2}>Create Event</Typography>
      <Paper sx={{ p: 4, bgcolor: 'var(--color-card-bg)' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Event Details */}
            <Box>
              <Typography variant="h6" mb={2}>Event Details</Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth label="Name *" name="name"
                  value={formData.name} onChange={handleChange}
                  error={!!errors.name} helperText={errors.name}
                />
                <TextField
                  fullWidth label="Location *" name="location"
                  value={formData.location} onChange={handleChange}
                  error={!!errors.location} helperText={errors.location}
                />
                <TextField
                  fullWidth multiline rows={3}
                  label="Description *" name="description"
                  value={formData.description} onChange={handleChange}
                />
              </Stack>
            </Box>

            {/* Date & Time */}
            <Box>
              <Typography variant="h6" mb={2}>Schedule</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <DatePicker
                  label="Start Date *"
                  value={formData.start_date}
                  onChange={d => setFormData(p => ({ ...p, start_date: d }))}
                  renderInput={params => (
                    <TextField {...params}
                      fullWidth error={!!errors.start_date}
                      helperText={errors.start_date}
                    />
                  )}
                />
                <DatePicker
                  label="End Date *"
                  value={formData.end_date}
                  onChange={d => setFormData(p => ({ ...p, end_date: d }))}
                  renderInput={params => (
                    <TextField {...params}
                      fullWidth error={!!errors.end_date}
                      helperText={errors.end_date}
                    />
                  )}
                />
                <TimePicker
                  label="Start Time *"
                  value={formData.start_time}
                  onChange={d => setFormData(p => ({ ...p, start_time: d }))}
                  renderInput={params => (
                    <TextField {...params}
                      fullWidth error={!!errors.start_time}
                      helperText={errors.start_time}
                    />
                  )}
                />
                <TimePicker
                  label="End Time *"
                  value={formData.end_time}
                  onChange={d => setFormData(p => ({ ...p, end_time: d }))}
                  renderInput={params => (
                    <TextField {...params}
                      fullWidth error={!!errors.end_time}
                      helperText={errors.end_time}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Uploads */}
            <Box>
              <Typography variant="h6" mb={2}>Images</Typography>
              <Stack spacing={2}>
                {['cover_image', 'logo_image', 'event_images'].map(name => (
                  <Box key={name}>
                    <FormLabel>{name.replace('_', ' ').replace(/s$/, ' *')}</FormLabel>
                    <Box
                      component="label"
                      htmlFor={name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        border: '2px dashed var(--color-primary)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'var(--color-primary-hover)' },
                      }}
                    >
                      <CloudUploadIcon sx={{ mr: 1 }} />
                      <Typography>{`Upload ${name.replace('_', ' ')}`}</Typography>
                      <input
                        id={name}
                        type="file"
                        name={name}
                        multiple={name === 'event_images'}
                        accept="image/*"
                        onChange={handleFileChange}
                        hidden
                      />
                    </Box>
                    {errors[name] && (
                      <Typography color="error" variant="caption">
                        {errors[name]}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Settings */}
            <Box>
              <Typography variant="h6" mb={2}>Settings</Typography>
              <Stack spacing={2}>
                <FormLabel>Event Type *</FormLabel>
                <RadioGroup
                  row name="public_event"
                  value={String(formData.public_event)}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Public" />
                  <FormControlLabel value="false" control={<Radio />} label="Private" />
                </RadioGroup>
                {errors.public_event && (
                  <Typography color="error" variant="caption">
                    {errors.public_event}
                  </Typography>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="food_tracking"
                      checked={formData.food_tracking}
                      onChange={handleChange}
                    />
                  }
                  label="Food Tracking"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="gift_tracking"
                      checked={formData.gift_tracking}
                      onChange={handleChange}
                    />
                  }
                  label="Gift Tracking"
                />
              </Stack>
            </Box>

            {/* Submit */}
            <Box textAlign="right">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Submitting...' : 'Create Event'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
