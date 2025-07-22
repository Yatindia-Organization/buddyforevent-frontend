// src/components/Admin/EventScreen/EditEvent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadToCloudinary } from '../../../lib/utils/cloudinary';
import { API_ROUTE } from '../../../lib/config';

export default function EditEvent() {
  const { event: eventId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    start_date: null,   
    end_date: null,     
    start_time: null,   
    end_time: null,     
  });

  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [eventImages, setEventImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // helper to format a Date → "HH:mm"
  const timeString = date =>
    date
      ? `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
      : '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    async function load() {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
        if (!res.ok) throw new Error('Event not found');
        const { data } = await res.json();

        const [sh, sm] = data.start_time.split(':').map(Number);
        const [eh, em] = data.end_time.split(':').map(Number);

        setForm({
          name: data.name,
          location: data.location || '',
          description: data.description || '',
          start_date: new Date(data.start_date),
          end_date:   new Date(data.end_date),
          start_time: new Date(0,0,0, sh, sm),
          end_time:   new Date(0,0,0, eh, em),
        });

        if (data.cover_image) setCoverImage({ url: data.cover_image });
        if (data.logo_image)  setLogoImage({ url: data.logo_image });
        if (Array.isArray(data.event_images)) {
          setEventImages(data.event_images.map(u => ({ url: u })));
        }
      } catch (err) {
        setSnackbar({ open:true, message: err.message, severity:'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const handleField = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSelectFile = useCallback((files, target) => {
    if (target === 'cover') {
      setCoverImage({ file: files[0] });
    } else if (target === 'logo') {
      setLogoImage({ file: files[0] });
    } else if (target === 'gallery') {
      const newOnes = Array.from(files).map(f => ({ file: f }));
      setEventImages(imgs => [...imgs, ...newOnes]);
    }
  }, []);

  const removeImage = (target, idx) => {
    if (target === 'cover') setCoverImage(null);
    else if (target === 'logo') setLogoImage(null);
    else setEventImages(imgs => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const uploads = [];
      if (coverImage?.file) uploads.push(coverImage.file);
      if (logoImage?.file)  uploads.push(logoImage.file);
      eventImages.forEach(img => img.file && uploads.push(img.file));

      const uploadResults = uploads.length
        ? await uploadToCloudinary(uploads)
        : [];

      let idx = 0;
      const coverUrl   = coverImage?.url || uploadResults[idx++];
      const logoUrl    = logoImage?.url  || uploadResults[idx++];
      const galleryUrls = eventImages.map(img =>
        img.url ? img.url : uploadResults[idx++]
      );

      const payload = {
        ...form,
        cover_image:   coverUrl,
        logo_image:    logoUrl,
        event_images:  galleryUrls,
        start_date:    form.start_date.toISOString().slice(0,10),
        end_date:      form.end_date.toISOString().slice(0,10),
        start_time:    timeString(form.start_time),
        end_time:      timeString(form.end_time),
      };
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_ROUTE}/api/v1/event/userid/${eventId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error(await res.text());

      setSnackbar({ open:true, message:'Event updated!', severity:'success' });
      setTimeout(() => navigate(`/event/${eventId}`), 800);
    } catch (err) {
      setSnackbar({ open:true, message: err.message, severity:'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper className="p-6 max-w-3xl mx-auto">
      <Typography variant="h4" gutterBottom>Edit Event</Typography>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic fields */}
        <TextField
          fullWidth label="Name" name="name"
          value={form.name} onChange={handleField} required
        />
        <TextField
          fullWidth label="Location" name="location"
          value={form.location} onChange={handleField}
        />
        <TextField
          fullWidth multiline rows={3}
          label="Description" name="description"
          value={form.description} onChange={handleField}
        />

        {/* Date & Time */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box display="flex" gap={2}>
            <DatePicker
              label="Start Date"
              value={form.start_date}
              onChange={d => setForm(f => ({ ...f, start_date: d }))}
              slotProps={{ textField: { fullWidth:true, required:true } }}
            />
            <DatePicker
              label="End Date"
              value={form.end_date}
              onChange={d => setForm(f => ({ ...f, end_date: d }))}
              slotProps={{ textField: { fullWidth:true, required:true } }}
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TimePicker
              label="Start Time"
              value={form.start_time}
              onChange={t => setForm(f => ({ ...f, start_time: t }))}
              slotProps={{ textField: { fullWidth:true, required:true } }}
            />
            <TimePicker
              label="End Time"
              value={form.end_time}
              onChange={t => setForm(f => ({ ...f, end_time: t }))}
              slotProps={{ textField: { fullWidth:true, required:true } }}
            />
          </Box>
        </LocalizationProvider>

        {/* Images */}
        <Box>
          <Typography variant="h6">Images</Typography>
          <Box className="grid grid-cols-1 gap-6 mt-2">
            <ImagePicker
              label="Cover Image"
              image={coverImage}
              onSelect={files => onSelectFile(files, 'cover')}
              onRemove={() => removeImage('cover')}
              accept="image/*"
              multiple={false}
              previewStyle={{ width: '100%', height: 'auto' }}
            />
            <ImagePicker
              label="Logo Image"
              image={logoImage}
              onSelect={files => onSelectFile(files, 'logo')}
              onRemove={() => removeImage('logo')}
              accept="image/*"
              multiple={false}
              previewStyle={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <ImagePicker
              label="Event Gallery"
              images={eventImages}
              onSelect={files => onSelectFile(files, 'gallery')}
              onRemove={i => removeImage('gallery', i)}
              accept="image/*"
              multiple
               previewStyle={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
          </Box>
        </Box>

        <Box textAlign="right">
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={20} />}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open:false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open:false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}


function ImagePicker({
  label,
  image,      
  images,    
  onSelect,
  onRemove,
  accept,
  multiple,
    previewStyle = {},
}) {
  const list = images ?? (image ? [image] : []);

  return (
    <Box>
      <Typography className="font-medium mb-1">{label}</Typography>
      <Box
        component="label"
        sx={{
          display: 'block',
          p: 2,
          border: '2px dashed var(--mui-palette-primary-main)',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <CloudUploadIcon fontSize="large" />
        <Typography>Click or drag here to select</Typography>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={e => onSelect(e.target.files)}
        />
      </Box>

  <Box mt={2} display="flex" flexDirection="column" gap={2}>
        {list.map((img, i) => {
          const src = img.url ? img.url : URL.createObjectURL(img.file);

          return (
            <Box key={i} position="relative">
              <img
                src={src}
                alt=""
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  display: 'block',
                    ...previewStyle,
                }}
              />
              <IconButton
                size="small"
                onClick={() => onRemove(i)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
