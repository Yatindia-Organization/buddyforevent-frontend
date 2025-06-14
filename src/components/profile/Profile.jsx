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
import { deepPurple } from '@mui/material/colors';
import { API_ROUTE } from '../../lib/config';
import { useGlobalInfo } from '../../contexts/globalContext';

export default function Profile() {
    const token = localStorage.getItem('token');
    const context = useGlobalInfo();

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData._id;

        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        try {
            const response = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alert('Profile updated successfully');

                // update localStorage and context
                const updatedUser = result.data;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                context.changeUserId(updatedUser._id);
                context.changeUserType(updatedUser.user_type);

                setFormData(prev => ({ ...prev, password: '' }));
            } else {
                alert(result.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update failed:', err);
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
                bgcolor: '#f0f4f8',
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
                    bgcolor: '#fff'
                }}
            >
                <Box textAlign="center" mb={4}>
                    <Avatar
                        sx={{
                            bgcolor: deepPurple[500],
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            fontSize: 32
                        }}
                    >
                        {formData.name?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Typography variant="h6" mt={1}>
                        {formData.name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Edit your profile details
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Change Password"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Company Name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Company GST Number"
                            name="company_gst_number"
                            value={formData.company_gst_number}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Box mt={4} textAlign="center">
                    <Button
                        variant="contained"
                        sx={{
                            px: 5,
                            py: 1.5,
                            fontSize: 16,
                            bgcolor: '#3f51b5',
                            '&:hover': {
                                bgcolor: '#2c387e'
                            }
                        }}
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
