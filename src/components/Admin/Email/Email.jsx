import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Snackbar,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
} from '@mui/material';

export default function Email() {
    const [participantType, setParticipantType] = useState('all');
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleSend = () => {
        if ((participantType === 'all' || to.trim()) && subject.trim() && message.trim()) {
            setSnackbar({
                open: true,
                message: `Ticket sent to ${participantType === 'single' ? `"${to}"` : 'all participants'}!`,
                severity: 'success'
            });
            setTo("");
            setSubject("");
            setMessage("");

            // Add the api once done foem the backend--  
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const isSendDisabled =
        subject.trim() === '' ||
        message.trim() === '' ||
        subject.length > 60 ||
        (participantType === 'single' && to.trim() === '');

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#5D5C8D' }}>
                Send Ticket manually
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
                Send email or message to Participants for the event
            </Typography>

            {/* Toggle for Participant Type */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <ToggleButtonGroup
                    value={participantType}
                    exclusive
                    onChange={(e, val) => val && setParticipantType(val)}
                    sx={{
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: 'bold',
                            border: 'none',
                            px: 2
                        },
                        '& .Mui-selected': {
                            borderBottom: '3px solid #4CAF50',
                            backgroundColor: 'transparent'
                        }
                    }}
                >
                    <ToggleButton value="single">Single Participant</ToggleButton>
                    <ToggleButton value="all">All Participant</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* TO Field (only for single participant) */}
                {participantType === 'single' && (
                    <TextField
                        label="To"
                        fullWidth
                        variant="standard"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                )}

                {/* Subject Field */}
                <TextField
                    label="Subject"
                    fullWidth
                    variant="standard"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    sx={{ mb: 1 }}
                />
                <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'gray' }}>
                    Subject should be maximum 60 characters
                </Typography>

                {/* Message Field */}
                <TextField
                    label="Message"
                    fullWidth
                    multiline
                    minRows={4}
                    variant="standard"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                />

                {/* Send Button */}
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    sx={{ textTransform: 'none', px: 4 }}
                >
                    Send
                </Button>
            </Paper>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
