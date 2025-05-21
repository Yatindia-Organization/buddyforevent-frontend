import React, { useState } from 'react';
import {
    TextField,
    Grid,
    Switch,
    FormControlLabel,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function TicketRegistrationForm() {
    const [formData, setFormData] = useState({
        registrationName: '',
        quantity: '',
        minQty: '',
        maxQty: '',
        description: '',
        startDate: null,
        endDate: null,
        showRemaining: true,
        teamRegistration: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name) => (e) => {
        setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    };

    const minStartDate = new Date(new Date().setDate(new Date().getDate() + 1));
    const minEndDate = formData.startDate
        ? new Date(new Date(formData.startDate).getTime() + 24 * 60 * 60 * 1000)
        : new Date(new Date().setDate(new Date().getDate() + 2));

    const Label = ({ text }) => (
        <Typography variant="body2" fontWeight={500} sx={{ minWidth: '150px' }}>
            {text}
        </Typography>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2 }}>
                <Typography variant="body2" color="#E36A6C" mb={3}>
                    Please note that the participants will be receiving email, SMS, and WhatsApp messages after the registration.
                </Typography>

                <Grid spacing={3}>
                    {/* Registration Name */}

                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Registration Name *" /></Grid>
                        <Grid item xs={12} md={9}>
                            <TextField
                                fullWidth
                                name="registrationName"
                                placeholder="e.g. Event 001"
                                value={formData.registrationName}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Registration Quantity */}
                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Registration Quantity *" /></Grid>
                        <Grid item xs={12} md={9}>
                            <TextField
                                fullWidth
                                name="quantity"
                                placeholder="e.g. total ticket quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Min and Max Qty */}
                    <Grid item xs={12} container sx={{ mb: 2 }} alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Min. Qty. *" /></Grid>
                        <Grid item xs={6} md={4}>
                            <TextField
                                fullWidth
                                name="minQty"
                                placeholder="e.g. 1"
                                value={formData.minQty}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={2} sx={{ ml: 8 }} ><Label text="Max. Qty. *" /></Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                name="maxQty"
                                placeholder="e.g. 10"
                                value={formData.maxQty}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Description *" /></Grid>
                        <Grid item xs={12} md={9}>
                            <TextField
                                fullWidth
                                name="description"
                                placeholder="Enter ticket description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Start and End Date */}
                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Start Date *" /></Grid>
                        <Grid item xs={12} md={4}>
                            <DatePicker
                                value={formData.startDate}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, startDate: newValue }))
                                }
                                minDate={minStartDate}
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
                        <Grid item xs={12} md={2} sx={{ ml: 8 }} ><Label text="End Date *" /></Grid>
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                value={formData.endDate}
                                onChange={(newValue) =>
                                    setFormData((prev) => ({ ...prev, endDate: newValue }))
                                }
                                minDate={minEndDate}
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

                    {/* Show Remaining Qty */}
                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Show Remaining Qty" /></Grid>
                        <Grid item xs={12} md={9}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.showRemaining}
                                        onChange={handleToggle('showRemaining')}
                                    />
                                }
                                label=""
                            />
                        </Grid>
                    </Grid>

                    {/* Team Registration */}
                    <Grid item xs={12} sx={{ mb: 2 }} container alignItems="center">
                        <Grid item xs={12} md={3}><Label text="Team Registration" /></Grid>
                        <Grid item xs={12} md={9}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.teamRegistration}
                                        onChange={handleToggle('teamRegistration')}
                                    />
                                }
                                label=""
                            />
                        </Grid>
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12} container alignItems="center" gap={8} mt={2} borderTop={1} borderColor={"#E9EAEB"} paddingTop={2} >
                        <Button variant="outlined" color="inherit" minWidth={"14vw"}>
                            Cancel
                        </Button>
                        <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }} minWidth={"14vw"}>
                            Next
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
}
