import React, { useState } from 'react';
import {
    Box, Button, Typography, Paper, Snackbar, Alert,
    ToggleButtonGroup, ToggleButton, TextField, Tabs, Tab, Chip, Dialog, DialogTitle, DialogActions
} from '@mui/material';

export default function Email() {
    const [activeTab, setActiveTab] = useState('email');
    const [recipientType, setRecipientType] = useState('single');

    const [singleTo, setSingleTo] = useState('');
    const [multipleTo, setMultipleTo] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState({ type: '', value: '' });

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };


    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

    const clearAll = () => {
        setSingleTo('');
        setMultipleTo([]);
        setInputValue('');
        setSubject('');
        setMessage('');
    };

    const hasInput = () =>
        singleTo || multipleTo.length > 0 || subject || message;

    const handleTabChange = (e, val) => {
        if (val && val !== activeTab) {
            if (hasInput()) {
                setPendingChange({ type: 'tab', value: val });
                setDialogOpen(true);
            } else {
                setActiveTab(val);
                clearAll();
            }
        }
    };

    const handleRecipientTypeChange = (e, val) => {
        if (val && val !== recipientType) {
            if (hasInput()) {
                setPendingChange({ type: 'recipientType', value: val });
                setDialogOpen(true);
            } else {
                setRecipientType(val);
                clearAll();
            }
        }
    };

    const confirmChange = () => {
        const { type, value } = pendingChange;
        if (type === 'tab') setActiveTab(value);
        if (type === 'recipientType') setRecipientType(value);
        clearAll();
        setDialogOpen(false);
    };

    const handleKeyDown = (e) => {
        if (['Enter', ','].includes(e.key)) {
            e.preventDefault();
            const cleaned = inputValue.trim();
            if (cleaned && !multipleTo.includes(cleaned)) {
                setMultipleTo([...multipleTo, cleaned]);
                setInputValue('');
            }
        }
    };

    const removeRecipient = (index) => {
        setMultipleTo(multipleTo.filter((_, i) => i !== index));
    };

    const isValidPhoneNumber = (num) => /^\d{10}$/.test(num);

    const isSendDisabled = () => {
        if (message.trim() === '') return true;

        if (activeTab === 'email') {
            if (subject.trim() === '' || subject.length > 60) return true;

            if (recipientType === 'single') {
                return !isValidEmail(singleTo.trim());
            }

            return multipleTo.length === 0 || !multipleTo.every(isValidEmail);
        } else {
            if (recipientType === 'single') {
                return !isValidPhoneNumber(singleTo.trim());
            }

            return multipleTo.length === 0 || !multipleTo.every(isValidPhoneNumber);
        }
    };


    const handleSend = () => {
        const recipients = recipientType === 'single' ? singleTo : multipleTo.join(', ');
        setSnackbar({
            open: true,
            message: `${activeTab === 'email' ? 'Email' : 'Message'} sent to ${recipientType === 'single' ? `"${singleTo}"` : `${multipleTo.length} recipients`}!`,
            severity: 'success'
        });

        clearAll();
    };

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#5D5C8D' }}>
                Send Ticket Manually
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
                Send an {activeTab === 'email' ? 'email' : 'SMS message'} to participants
            </Typography>

            {/* Tabs for Email / Message */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 3 }}
            >
                <Tab value="email" label="Email" />
                <Tab value="message" label="Message" />
            </Tabs>

            {/* Toggle Single / Multiple */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <ToggleButtonGroup
                    value={recipientType}
                    exclusive
                    onChange={handleRecipientTypeChange}
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
                    <ToggleButton value="single">Single</ToggleButton>
                    <ToggleButton value="multiple">Multiple</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Form */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* To Field */}
                {recipientType === 'single' ? (
                    <TextField
                        label={`To (${activeTab === 'email' ? 'Email' : 'Phone Number'})`}
                        fullWidth
                        variant="standard"
                        value={singleTo}
                        onChange={(e) => setSingleTo(e.target.value)}
                        sx={{ mb: 3 }}
                        error={
                            recipientType === 'single' &&
                            ((activeTab === 'email' && singleTo && !isValidEmail(singleTo)) ||
                                (activeTab === 'message' && singleTo && !isValidPhoneNumber(singleTo)))
                        }
                        helperText={
                            recipientType === 'single' && singleTo && (
                                activeTab === 'email'
                                    ? (!isValidEmail(singleTo) ? 'Invalid email format' : '')
                                    : (!isValidPhoneNumber(singleTo) ? 'Phone number must be 10 digits' : '')
                            )
                        }
                    />
                ) : (
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label={`Add ${activeTab === 'email' ? 'Email' : 'Phone'} and press Enter`}
                            fullWidth
                            variant="standard"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            
                            onKeyDown={(e) => {
                                if (['Enter', ','].includes(e.key)) {
                                    e.preventDefault();
                                    const cleaned = inputValue.trim();
                                    if (!cleaned) return;

                                    const isValid = activeTab === 'email'
                                        ? isValidEmail(cleaned)
                                        : isValidPhoneNumber(cleaned);

                                    if (isValid && !multipleTo.includes(cleaned)) {
                                        setMultipleTo([...multipleTo, cleaned]);
                                        setInputValue('');
                                    }
                                }
                            }}

                            error={
                                activeTab === 'message' &&
                                inputValue &&
                                !/^\d{0,10}$/.test(inputValue)
                            }
                            helperText={
                                activeTab === 'message' &&
                                    inputValue &&
                                    !/^\d{0,10}$/.test(inputValue)
                                    ? 'Phone number must be numeric and up to 10 digits'
                                    : ''
                            }
                        />
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {multipleTo.map((val, index) => {
                                const isInvalid = activeTab === 'email'
                                    ? !isValidEmail(val)
                                    : !isValidPhoneNumber(val);

                                return (
                                    <Chip
                                        key={index}
                                        label={val}
                                        onDelete={() => removeRecipient(index)}
                                        color={isInvalid ? 'error' : 'primary'}
                                        variant={isInvalid ? 'outlined' : 'filled'}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* Subject Field (only for email) */}
                {activeTab === 'email' && (
                    <>
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
                    </>
                )}

                {/* Message */}
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

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSend}
                    disabled={isSendDisabled()}
                    sx={{ textTransform: 'none', px: 4 }}
                >
                    Send
                </Button>
            </Paper>

            {/* Snackbar */}
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

            {/* Dialog for Confirming Mode Change */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Unsaved Input Detected</DialogTitle>
                <Typography sx={{ px: 3 }}>
                    Changing mode will clear all inputs. Are you sure you want to continue?
                </Typography>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmChange} color="error">Yes, Clear</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
