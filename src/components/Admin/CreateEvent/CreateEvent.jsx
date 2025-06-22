import React, { useState } from 'react';
import {
    Box, Button, Checkbox, FormControlLabel, FormLabel, Grid,
    Radio, RadioGroup, TextField, Typography, Snackbar, Alert
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../../../lib/utils/cloudinary';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { API_ROUTE } from '../../../lib/config';

const CreateEvent = () => {
    const navigate = useNavigate();
    const context = useGlobalInfo();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const userId = context.userId ;

    const [formData, setFormData] = useState({
        name: '',
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        user: userId,
        location: "",
        description: '',
        cover_image: null,
        logo_image: null,
        event_images: [],
        public_event: null,
        food_tracking: true,
        gift_tracking: true,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'event_images') {
            setFormData((prev) => ({
                ...prev,
                event_images: [...prev.event_images, ...Array.from(files)],
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleRadioChange = (event) => {
        setFormData({
            ...formData,
            public_event: event.target.value === 'true',
        });
    };

    const pad = (num) => String(num).padStart(2, '0');

    const formatDate = (date) => {
        console.log("formdate")
        const d = new Date(date);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const formatTime = (date) => {
        console.log("formdate")
        const d = new Date(date);
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };


    const validate = () => {
        const temp = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.name.trim()) temp.name = 'Event name is required';
        if (!formData.location.trim()) temp.location = 'Event location is required';
        if (!formData.description.trim()) temp.description = 'Event description is required';
        if (!formData.cover_image) temp.cover_image = 'Cover image is required';
        if (!formData.logo_image) temp.logo_image = 'Logo image is required';

        if (!formData.start_date) {
            temp.start_date = 'Start date is required';
        } else if (new Date(formData.start_date) <= today) {
            temp.start_date = 'Start date must be after today';
        }

        if (!formData.end_date) {
            temp.end_date = 'End date is required';
        } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
            temp.end_date = 'End date must be after start date';
        }

        if (!formData.start_time) temp.start_time = 'Start time is required';
        if (!formData.end_time) {
            temp.end_time = 'End time is required';
        } else if (
            formData.start_date &&
            formData.end_date &&
            new Date(formData.start_date).toDateString() === new Date(formData.end_date).toDateString()
        ) {
            const start = new Date(formData.start_date);
            start.setHours(formData.start_time.getHours(), formData.start_time.getMinutes());

            const end = new Date(formData.end_date);
            end.setHours(formData.end_time.getHours(), formData.end_time.getMinutes());

            if (end <= start) {
                temp.end_time = 'End time must be after start time';
            }
        }

        if (formData.public_event === null) temp.public_event = 'Please select an event type';

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Form Data:", formData);

        if (!validate()) {
            console.log("failed validation")
        };



        try {
            const [coverImageUrl] = formData.cover_image
                ? await uploadToCloudinary([formData.cover_image])
                : [''];

            const [logoImageUrl] = formData.logo_image
                ? await uploadToCloudinary([formData.logo_image])
                : [''];

            const eventImageUrls = formData.event_images.length
                ? await uploadToCloudinary(formData.event_images)
                : [];

            const finalPayload = {
                ...formData,
                cover_image: coverImageUrl,
                logo_image: logoImageUrl,
                event_images: eventImageUrls,
                start_date: formData.start_date ? formatDate(formData.start_date) : null,
                end_date: formData.end_date ? formatDate(formData.end_date) : null,
                start_time: formData.start_time ? formatTime(formData.start_time) : null,
                end_time: formData.end_time ? formatTime(formData.end_time) : null,

            };

            console.log("Final Payload:", finalPayload);

            // Submit event data
            const response = await fetch(`${API_ROUTE}/api/v1/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || `Event creation failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Event submitted successfully:", result);

            setSnackbar({
                open: true,
                message: `Created a new event called "${formData.name}"`,
                severity: 'success',
            });

            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error',
            });
        }
    };

    const StyledUploadBox = ({ label, name, multiple = false, fileData }) => {
        const hasFile = multiple ? fileData && fileData.length > 0 : fileData instanceof File;
        const inputId = `${name}-upload`;

        return (
            <>
                <label htmlFor={inputId} style={{ textDecoration: 'none' }}>
                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: '12px',
                            textAlign: 'center',
                            padding: 3,
                            cursor: 'pointer',
                            transition: 'border-color 0.3s',
                            '&:hover': {
                                borderColor: '#1976d2',
                            },
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 40, color: '#aaa', mb: 1 }} />
                        <Typography variant="body1" sx={{ color: '#1976d2', display: 'inline' }}>
                            {label}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555', display: 'inline' }}>
                            {' '}or drag and drop
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#999' }}>
                            JPG, JPEG, PNG less than 1MB
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#999' }}>
                            {hasFile
                                ? multiple
                                    ? `${fileData.length} image(s) uploaded`
                                    : `Image uploaded: ${fileData.name}`
                                : label}
                        </Typography>
                    </Box>
                </label>
                <input
                    id={inputId}
                    type="file"
                    name={name}
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                />
                {errors[name] && (
                    <Typography color="error" variant="caption">
                        {errors[name]}
                    </Typography>
                )}
            </>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Typography variant="h5" gutterBottom>Create Event</Typography>
            <Box sx={{ maxWidth: 1000, p: 3, bgcolor: "#fff", borderRadius: "1vw" }}>
                <Typography variant="h5" gutterBottom>
                    Event Details
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Event Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>

                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Start Date *"
                                value={formData.start_date}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, start_date: newValue }))
                                }
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.start_date}
                                        helperText={errors.start_date}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="End Date *"
                                value={formData.end_date}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, end_date: newValue }))
                                }
                                minDate={
                                    formData.startDate
                                        ? new Date(new Date(formData.startDate).getTime() + 24 * 60 * 60 * 1000)
                                        : new Date(new Date().setDate(new Date().getDate() + 2))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.end_date}
                                        helperText={errors.end_date}
                                    />
                                )}
                            />
                        </Grid>

                    </Grid>

                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Event Location *"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            error={!!errors.location}
                            helperText={errors.location}
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                            <TimePicker
                                label="Start Time *"
                                value={formData.start_time}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, start_time: newValue }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.start_time}
                                        helperText={errors.start_time}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TimePicker
                                label="End Time *"
                                value={formData.end_time}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, end_time: newValue }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.end_time}
                                        helperText={errors.end_time}
                                    />
                                )}
                            />
                        </Grid>


                    </Grid>


                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Event Description *"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                            <StyledUploadBox
                                label="Upload Cover Image"
                                name="cover_image"
                                fileData={formData.cover_image}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StyledUploadBox
                                label="Upload Logo Image"
                                name="logo_image"
                                fileData={formData.logo_image}
                            />
                        </Grid>

                    </Grid>


                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <StyledUploadBox
                            label="Upload Event Images (optional)"
                            name="event_images"
                            fileData={formData.event_images}
                            multiple
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12}>
                            <FormLabel>Event Type *</FormLabel>
                            <RadioGroup
                                row
                                name="public_event"
                                value={String(formData.public_event)}
                                onChange={handleRadioChange}
                            >
                                <FormControlLabel value="true" control={<Radio />} label="Public Event" />
                                <FormControlLabel value="false" control={<Radio />} label="Private Event" />
                            </RadioGroup>
                            {errors.public_event && (
                                <Typography variant="caption" color="error">
                                    {errors.public_event}
                                </Typography>
                            )}
                        </Grid>

                    </Grid>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="food_tracking"
                                        checked={formData.food_tracking}
                                        onChange={handleCheckbox}
                                    />
                                }
                                label="Food Tracking"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="gift_tracking"
                                        checked={formData.gift_tracking}
                                        onChange={handleCheckbox}
                                    />
                                }
                                label="Gift Tracking"
                            />
                        </Grid>

                    </Grid>

                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" fullWidth>
                            Create Event
                        </Button>
                    </Grid>
                </form>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
};

export default CreateEvent;
