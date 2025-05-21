import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { uploadToCloudinary } from '../../../lib/utils/cloudinary';


const CreateEvent = () => {

    const navigate = useNavigate();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });


    const [formData, setFormData] = useState({
        name: '',
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        location: "",
        description: '',
        coverImage: null,
        logoImage: null,
        eventImages: [],
        eventType: null,
        foodTracking: true,
        giftTracking: true,
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
        if (name === 'eventImages') {
            setFormData((prev) => ({
                ...prev,
                eventImages: [...prev.eventImages, ...Array.from(files)],
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleRadioChange = (event) => {
        setFormData({
            ...formData,
            eventType: event.target.value,
        });
    };


    const validate = () => {
        const temp = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize time

        if (!formData.name.trim()) temp.name = 'Event name is required';

        if (!formData.location.trim()) temp.location = 'Event location is required';

        if (!formData.description.trim()) temp.description = 'Event description is required';

        if (!formData.coverImage) temp.coverImage = 'Cover image is required';

        if (!formData.logoImage) temp.logoImage = 'Logo image is required';

        if (!formData.startDate) {
            temp.startDate = 'Start date is required';
        } else if (new Date(formData.startDate) <= today) {
            temp.startDate = 'Start date must be after today';
        }

        if (!formData.endDate) {
            temp.endDate = 'End date is required';
        } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            temp.endDate = 'End date must be after start date';
        }

        if (!formData.startTime) {
            temp.startTime = 'Start time is required';
        }

        if (!formData.endTime) {
            temp.endTime = 'End time is required';
        } else if (
            formData.startDate &&
            formData.endDate &&
            new Date(formData.startDate).toDateString() === new Date(formData.endDate).toDateString()
        ) {
            const start = new Date(formData.startDate);
            start.setHours(formData.startTime.getHours(), formData.startTime.getMinutes());

            const end = new Date(formData.endDate);
            end.setHours(formData.endTime.getHours(), formData.endTime.getMinutes());

            if (end <= start) {
                temp.endTime = 'End time must be after start time';
            }
        }

        if (!formData.eventType) temp.eventType = 'Please select an event type';

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Upload images first
            console.log("try");
            const [coverImageUrl] = formData.coverImage
                ? await uploadToCloudinary([formData.coverImage])
                : [''];
            console.log("coverImageUrl", coverImageUrl);
            const [logoImageUrl] = formData.logoImage
                ? await uploadToCloudinary([formData.logoImage])
                : [''];
            const eventImageUrls = formData.eventImages.length
                ? await uploadToCloudinary(formData.eventImages)
                : [];

            // Build final payload
            const finalPayload = {
                ...formData,
                coverImage: coverImageUrl,
                logoImage: logoImageUrl,
                eventImages: eventImageUrls,
                startTime: formData.startTime?.toISOString(),
                endTime: formData.endTime?.toISOString(),
            };


            // Submit event data to your backend
            const response = await fetch('https://your-api.com/api/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Event creation failed');
            }

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



    // const StyledUploadBox = ({ label, name, multiple = false, fileData }) => {
    //     const hasFile =
    //         multiple ? fileData && fileData.length > 0 : fileData instanceof File;

    //     return (
    //         <label
    //             style={{
    //                 width: '100%',
    //                 border: '2px dashed #ccc',
    //                 textAlign: 'center',
    //                 padding: '20px',
    //                 borderRadius: '8px',
    //                 cursor: 'pointer',
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 aligns: 'center',
    //                 gap: '10px',
    //                 backgroundColor: hasFile ? '#e3f2fd' : 'transparent',
    //                 borderColor: hasFile ? '#2196f3' : '#ccc',
    //             }}
    //         >
    //             <CloudUploadIcon
    //                 fontSize="large"
    //                 sx={{ color: hasFile ? '#2196f3' : '#888' }}
    //             />
    //             <Typography variant="body2">
    //                 {hasFile
    //                     ? multiple
    //                         ? `${fileData.length} image(s) uploaded`
    //                         : `Image uploaded: ${fileData.name}`
    //                     : label}
    //             </Typography>
    //             <input
    //                 type="file"
    //                 name={name}
    //                 multiple={multiple}
    //                 accept="image/*"
    //                 onChange={handleFileChange}
    //                 hidden
    //             />
    //         </label>
    //     );
    // };


    const StyledUploadBox = ({ label, name, multiple = false, fileData }) => {
        const hasFile = multiple
            ? fileData && fileData.length > 0
            : fileData instanceof File;

        const inputId = `${name}-upload`;

        return (
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
                <input
                    id={inputId}
                    type="file"
                    name={name}
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                />
            </label>
        );
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Typography variant="h5" gutterBottom>
                Create Event
            </Typography>
            <Box sx={{ maxWidth: 1000, p: 3, bgcolor: "#fff", borderRadius: "1vw" }}>
                <Typography variant="h5" gutterBottom>
                    Event Details
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid xs={12} sx={{ mb: 2 }}>
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
                        <Grid xs={12} md={6}>
                            <DatePicker
                                label="Start Date *"
                                value={formData.startDate}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, startDate: newValue }))
                                }
                                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.startDate}
                                        helperText={errors.startDate}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} md={6}>
                            <DatePicker
                                label="End Date *"
                                value={formData.endDate}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, endDate: newValue }))
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
                                        error={!!errors.endDate}
                                        helperText={errors.endDate}
                                    />
                                )}
                            />

                        </Grid>
                    </Grid>

                    <Grid xs={12} sx={{ mb: 2 }}>
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
                        <Grid xs={12} md={6}>
                            <TimePicker
                                label="Start Time *"
                                value={formData.startTime}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, startTime: newValue }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.startTime}
                                        helperText={errors.startTime}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} md={6}>
                            <TimePicker
                                label="End Time *"
                                value={formData.endTime}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, endTime: newValue }))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.endTime}
                                        helperText={errors.endTime}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>


                    <Grid xs={12} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Event Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid xs={12} md={6}>
                            <StyledUploadBox
                                label="Upload Cover Image"
                                name="coverImage"
                                fileData={formData.coverImage}
                            />
                        </Grid>
                        <Grid xs={12} md={6}>
                            <StyledUploadBox
                                label="Upload Logo Image"
                                name="logoImage"
                                fileData={formData.logoImage}
                            />
                            {errors.coverImage && (
                                <Typography color="error" variant="caption">
                                    {errors.coverImage}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    <Grid xs={12} sx={{ mb: 2 }}>
                        <StyledUploadBox
                            label="Click to upload any Event pictures ( banner )"
                            name="eventImages"
                            multiple
                            fileData={formData.eventImages}
                        />
                    </Grid>



                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid xs={12}>
                            <FormLabel component="legend">Event Type</FormLabel>
                            <RadioGroup
                                row
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleRadioChange}
                            >
                                <FormControlLabel value="public" control={<Radio />} label="Public Event" />
                                <FormControlLabel value="private" control={<Radio />} label="Private Event" />
                            </RadioGroup>
                        </Grid>
                        
                        {errors.eventType && (
                            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                {errors.eventType}
                            </Typography>
                        )}

                    </Grid>

                    <Grid container spacing={2}>
                        {[
                            { label: 'Food Tracking', name: 'foodTracking' },
                            { label: 'Gift Tracking', name: 'giftTracking' },
                        ].map((checkbox, idx) => (
                            <Grid xs={12} sm={6} key={idx}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name={checkbox.name}
                                            checked={formData[checkbox.name]}
                                            onChange={handleCheckbox}
                                        />
                                    }
                                    label={checkbox.label}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Grid xs={12}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
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
