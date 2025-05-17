import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Grid,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

export default function Profile() {

    const [formData, setFormData] = useState({
        firstName: 'Yash',
        lastName: 'Ghori',
        email: 'yghori@asite.com',
        password: '',
        phone: '9172048144030',
        nationality: 'India',
        designation: 'UI Intern',
        countryCode: 'in'
    });


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value, data) => {
        setFormData({
            ...formData,
            phone: value,
            countryCode: data.countryCode
        });
    };


    return (
        <Box sx={{ p: 4, display: 'flex', gap: 4, bgcolor: '#f5f9ff', minHeight: '100vh' }}>
            {/* Left Profile Info */}
            <Paper elevation={3} sx={{ p: 3, width: 300, borderRadius: 2 }}>
                <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar sx={{ width: 100, height: 100, border: '3px solid #f50057' }} />
                </Box>
                <Typography variant="h6" align="center">Super Admin</Typography>
                <Typography variant="body2" align="center">Chennai</Typography>
                <Typography variant="body2" align="center" mb={2}>India</Typography>

                <Box sx={{ borderTop: '1px solid #ccc', pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img src="/svg/person.svg" alt="Role" style={{ marginRight: 8 }} />
                        <Typography variant="body2">UI - Intern</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img src="/svg/timer.svg" alt="Status" style={{ marginRight: 8 }} />
                        <Typography variant="body2">on-teak</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img src="/svg/phone.svg" alt="Phone" style={{ marginRight: 8 }} />
                        <Typography variant="body2">+91 7048144030</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img src="/svg/mail.svg" alt="Email" style={{ marginRight: 8 }} />
                        <Typography variant="body2">abcdij@asite.com</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/svg/folder.svg" alt="Department" style={{ marginRight: 8 }} />
                        <Typography variant="body2">PDT - I</Typography>
                    </Box>
                </Box>

            </Paper>

            {/* Right Edit Form */}
            <Paper elevation={3} sx={{ p: 4, flex: 1, borderRadius: 2 }}>
                <Typography variant="h6" mb={3}>Edit Profile</Typography>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <PhoneInput
                            country={'in'} // default to India
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            inputStyle={{ width: '100%' }}
                            specialLabel="Phone Number"
                            enableSearch
                        />
                    </Grid>

                </Grid>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Change Password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="India">India</MenuItem>
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="Nigeria">Nigeria</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <TextField
                        select
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="UI Intern">UI Intern</MenuItem>
                        <MenuItem value="Developer">Developer</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                    </TextField>
                </Grid>

                <Box mt={4} textAlign="center">
                    <Button variant="contained" sx={{ px: 6, py: 1.5, bgcolor: '#3f51b5' }}>
                        Save
                    </Button>
                </Box>
            </Paper>
        </Box >
    );
}
