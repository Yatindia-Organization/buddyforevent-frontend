// src/components/Admin/CreateEvent/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

  // form data
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
  // validation errors
  const [errors, setErrors] = useState({});
  // feedback/snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // uploading/loading?
  const [loading, setLoading] = useState(false);
  // previews: object URLs
  const [previews, setPreviews] = useState({
    cover: null,
    logo: null,
    gallery: [],
  });

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previews.cover) URL.revokeObjectURL(previews.cover);
      if (previews.logo)  URL.revokeObjectURL(previews.logo);
      previews.gallery.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // handle text/checkbox/radio fields
  const handleChange = e => {
    const { name, value, checked, type } = e.target;
    setFormData(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // handle file inputs + generate previews
  const handleFileChange = e => {
    const { name, files } = e.target;

    if (name === 'cover_image') {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setFormData(f => ({ ...f, cover_image: file }));
      setPreviews(p => {
        if (p.cover) URL.revokeObjectURL(p.cover);
        return { ...p, cover: url };
      });
    }

    if (name === 'logo_image') {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setFormData(f => ({ ...f, logo_image: file }));
      setPreviews(p => {
        if (p.logo) URL.revokeObjectURL(p.logo);
        return { ...p, logo: url };
      });
    }

    if (name === 'event_images') {
      const fileArray = Array.from(files);
      const newUrls = fileArray.map(f => URL.createObjectURL(f));
      setFormData(f => ({
        ...f,
        event_images: [...f.event_images, ...fileArray]
      }));
      setPreviews(p => {
        p.gallery.forEach(url => URL.revokeObjectURL(url));
        return { ...p, gallery: [...p.gallery, ...newUrls] };
      });
    }
  };

  // basic validation
  const validate = () => {
    const temp = {};
    if (!formData.name.trim()) temp.name = 'Required';
    if (!formData.location.trim()) temp.location = 'Required';
    if (!formData.cover_image) temp.cover_image = 'Required';
    if (!formData.logo_image) temp.logo_image = 'Required';
    if (formData.public_event === null) temp.public_event = 'Select one';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // format helpers
  const fmtDate = d => d?.toISOString().slice(0, 10) || null;
  const fmtTime = d => d?.toTimeString().slice(0, 5) || null;

  // handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // upload files in one batch
      const toUpload = [];
      if (formData.cover_image) toUpload.push(formData.cover_image);
      if (formData.logo_image)  toUpload.push(formData.logo_image);
      toUpload.push(...formData.event_images);

      const urls = toUpload.length ? await uploadToCloudinary(toUpload) : [];

      // assign returned URLs
      let idx = 0;
      const coverUrl = urls[idx++];
      const logoUrl  = urls[idx++];
      const galleryUrls = formData.event_images.map((_, i) => urls[idx + i]);

      // build payload
      const payload = {
        ...formData,
        cover_image:  coverUrl,
        logo_image:   logoUrl,
        event_images: galleryUrls,
        start_date:   fmtDate(formData.start_date),
        end_date:     fmtDate(formData.end_date),
        start_time:   fmtTime(formData.start_time),
        end_time:     fmtTime(formData.end_time),
      };

      // call API
      const res = await fetch(`${API_ROUTE}/api/v1/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      setSnackbar({ open: true, message: `Event "${formData.name}" created!`, severity: 'success' });
      // navigate after brief pause
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* loading backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h4" mb={2}>Create Event</Typography>
      <Paper sx={{ p: 4, bgcolor: 'var(--color-card-bg)' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>

            {/** Event Details **/}
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
                  label="Description" name="description"
                  value={formData.description} onChange={handleChange}
                />
              </Stack>
            </Box>

            {/** Schedule **/}
            <Box>
              <Typography variant="h6" mb={2}>Schedule</Typography>
              <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
                <DatePicker
                  label="Start Date *"
                  value={formData.start_date}
                  onChange={d => setFormData(f => ({ ...f, start_date: d }))}
                  slotProps={{ textField: {
                    fullWidth: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date
                  } }}
                />
                <DatePicker
                  label="End Date *"
                  value={formData.end_date}
                  onChange={d => setFormData(f => ({ ...f, end_date: d }))}
                  slotProps={{ textField: {
                    fullWidth: true,
                    error: !!errors.end_date,
                    helperText: errors.end_date
                  } }}
                />
                <TimePicker
                  label="Start Time *"
                  value={formData.start_time}
                  onChange={t => setFormData(f => ({ ...f, start_time: t }))}
                  slotProps={{ textField: {
                    fullWidth: true,
                    error: !!errors.start_time,
                    helperText: errors.start_time
                  } }}
                />
                <TimePicker
                  label="End Time *"
                  value={formData.end_time}
                  onChange={t => setFormData(f => ({ ...f, end_time: t }))}
                  slotProps={{ textField: {
                    fullWidth: true,
                    error: !!errors.end_time,
                    helperText: errors.end_time
                  } }}
                />
              </Stack>
            </Box>

            {/** Image Uploads + Previews **/}
            <Box>
              <Typography variant="h6" mb={2}>Images</Typography>
              <Stack spacing={4}>

                {/** Cover **/}
                <Box>
                  <FormLabel>Cover Image *</FormLabel>
                  <Box
                    component="label"
                    sx={{
                      display: 'flex', alignItems:'center',
                      p:2, border:'2px dashed var(--color-primary)',
                      borderRadius:2, cursor:'pointer',
                      '&:hover':{ borderColor:'var(--color-primary-hover)' }
                    }}
                  >
                    <CloudUploadIcon sx={{ mr:1 }} />
                    <Typography>Upload Cover</Typography>
                    <input
                      type="file"
                      name="cover_image"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Box>
                  {errors.cover_image && (
                    <Typography color="error" variant="caption">
                      {errors.cover_image}
                    </Typography>
                  )}
                  {previews.cover && (
                    <Box position="relative" mt={2}>
                      <img
                        src={previews.cover}
                        alt="Cover preview"
                        style={{ width:'100%', height:'auto', borderRadius:4 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          URL.revokeObjectURL(previews.cover);
                          setPreviews(p => ({ ...p, cover: null }));
                          setFormData(f => ({ ...f, cover_image: null }));
                        }}
                        sx={{ position:'absolute', top:8, right:8, bgcolor:'rgba(255,255,255,0.8)' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/** Logo **/}
                <Box>
                  <FormLabel>Logo Image *</FormLabel>
                  <Box
                    component="label"
                    sx={{
                      display: 'flex', alignItems:'center',
                      p:2, border:'2px dashed var(--color-primary)',
                      borderRadius:2, cursor:'pointer',
                      '&:hover':{ borderColor:'var(--color-primary-hover)' }
                    }}
                  >
                    <CloudUploadIcon sx={{ mr:1 }} />
                    <Typography>Upload Logo</Typography>
                    <input
                      type="file"
                      name="logo_image"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Box>
                  {errors.logo_image && (
                    <Typography color="error" variant="caption">
                      {errors.logo_image}
                    </Typography>
                  )}
                  {previews.logo && (
                    <Box position="relative" mt={2}>
                      <img
                        src={previews.logo}
                        alt="Logo preview"
                        style={{
                          width:120,
                          height:120,
                          objectFit:'cover',
                          borderRadius:'50%'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          URL.revokeObjectURL(previews.logo);
                          setPreviews(p => ({ ...p, logo: null }));
                          setFormData(f => ({ ...f, logo_image: null }));
                        }}
                        sx={{ position:'absolute', top:4, right:4, bgcolor:'rgba(255,255,255,0.8)' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/** Gallery **/}
                <Box>
                  <FormLabel>Event Images</FormLabel>
                  <Box
                    component="label"
                    sx={{
                      display: 'flex', alignItems:'center',
                      p:2, border:'2px dashed var(--color-primary)',
                      borderRadius:2, cursor:'pointer',
                      '&:hover':{ borderColor:'var(--color-primary-hover)' }
                    }}
                  >
                    <CloudUploadIcon sx={{ mr:1 }} />
                    <Typography>Upload Gallery</Typography>
                    <input
                      type="file"
                      name="event_images"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      hidden
                    />
                  </Box>
                  <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                    {previews.gallery.map((url, i) => (
                      <Box key={i} position="relative">
                        <img
                          src={url}
                          alt={`Preview ${i}`}
                          style={{
                            width:100, height:100,
                            objectFit:'cover',
                            borderRadius:4
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            URL.revokeObjectURL(url);
                            setPreviews(p => ({
                              ...p,
                              gallery: p.gallery.filter((_, idx) => idx !== i)
                            }));
                            setFormData(f => ({
                              ...f,
                              event_images: f.event_images.filter((_, idx) => idx !== i)
                            }));
                          }}
                          sx={{ position:'absolute', top:4, right:4, bgcolor:'rgba(255,255,255,0.8)' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/** Settings **/}
            <Box>
              <Typography variant="h6" mb={2}>Settings</Typography>
              <FormControl error={!!errors.public_event} component="fieldset">
                <FormLabel component="legend">Event Type *</FormLabel>
                <RadioGroup
                  row
                  name="public_event"
                  value={String(formData.public_event)}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true"  control={<Radio />} label="Public" />
                  <FormControlLabel value="false" control={<Radio />} label="Private" />
                </RadioGroup>
                {errors.public_event && (
                  <Typography color="error" variant="caption">
                    {errors.public_event}
                  </Typography>
                )}
              </FormControl>
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
            </Box>

            {/** Submit **/}
            <Box textAlign="right">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Submitting…' : 'Create Event'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/** Snackbar **/}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width:'100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
