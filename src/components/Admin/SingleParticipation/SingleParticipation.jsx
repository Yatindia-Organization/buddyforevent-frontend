import React, { useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Grid,
    TextField,
    MenuItem,
    Button,
    Paper,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function SingleParticipation() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        mobile: '',
        tickets: 0,
    });

    const ticketOptions = Array.from({ length: 10 }, (_, i) => i); // 0-9

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f9f9f9', borderRadius: 2 }}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold" color="#9A93B3">
                Single Participant Registration
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
                Issue tickets to your Participants without asking them to register online.
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>

                {/* Top Info Row */}
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">Choose Your</Typography>
                    <Grid item display="flex" gap={2} alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">08:00 PM - 08:00 PM</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <EventNoteIcon fontSize="small" color="error" />
                            <Typography variant="body2" color="error">
                                118 TICKET REMAINING
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} color={"#9A93B3"} />

                {/* Ticket Selection */}
                <Grid container alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1" color="text.secondary">
                            Select the number of ticket
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Select"
                            name="tickets"
                            value={form.tickets}
                            onChange={handleChange}
                            sx={{
                                '& fieldset': {
                                    borderColor: 'purple',
                                    borderStyle: 'dashed',
                                },
                            }}
                        >
                            {ticketOptions.map((num) => (
                                <MenuItem key={num} value={num}>
                                    {num}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                {/* Buyer Details */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Buyer Details
                </Typography>

                <Grid spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={8} container sx={{ mb: 4 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            placeholder="any"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={8} container sx={{ mb: 4 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            placeholder="any"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={8} container sx={{ mb: 4 }}>
                        <TextField
                            fullWidth
                            label="Mobile number"
                            name="mobile"
                            placeholder="any"
                            value={form.mobile}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Action Buttons */}
                <Grid container justifyContent="flex-end" spacing={2}>
                    <Grid item>
                        <Button variant="outlined" color="inherit">
                            Cancel
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
                            Proceed
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

        </Box>
    );
}
