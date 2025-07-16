import React, { useState } from 'react';
import {
    Box, Button, Typography, Paper, Snackbar, Alert,
    ToggleButtonGroup, ToggleButton, TextField, Tabs, Tab, Chip, Dialog, DialogTitle, DialogActions, DialogContent
} from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Email() {
    const { theme } = useTheme();
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
        <Box 
            className="min-h-screen p-6 bg-bg text-text font-sans"
            sx={{ maxWidth: 1000 }}
        >
            <Typography 
                variant="h5" 
                className="font-heading text-text mb-4"
                sx={{ fontWeight: 'bold' }}
            >
                Send Ticket Manually
            </Typography>
            <Typography 
                variant="body2" 
                className="text-text-secondary mb-6"
            >
                Send an {activeTab === 'email' ? 'email' : 'SMS message'} to participants
            </Typography>

            {/* Tabs for Email / Message */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ 
                    mb: 3,
                    '& .MuiTab-root': {
                        color: 'var(--color-text-secondary)',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        '&.Mui-selected': {
                            color: 'var(--color-primary)',
                        }
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: 'var(--color-primary)',
                    }
                }}
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
                        backgroundColor: 'var(--color-card-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-text-secondary)',
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: 'medium',
                            border: 'none',
                            px: 3,
                            py: 1,
                            color: 'var(--color-text-secondary)',
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'var(--color-primary-hover)',
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'var(--color-card-bg)',
                            }
                        }
                    }}
                >
                    <ToggleButton value="single">Single</ToggleButton>
                    <ToggleButton value="multiple">Multiple</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Form */}
            <Paper 
                className="bg-card p-6 rounded-xl shadow-md"
                elevation={3}
            >
                {/* To Field */}
                {recipientType === 'single' ? (
                    <TextField
                        label={`To (${activeTab === 'email' ? 'Email' : 'Phone Number'})`}
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={singleTo}
                        onChange={(e) => setSingleTo(e.target.value)}
                        sx={{ 
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--color-bg)',
                                '& fieldset': {
                                    borderColor: 'var(--color-text-secondary)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'var(--color-primary)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--color-primary)',
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'var(--color-text-secondary)',
                                '&.Mui-focused': {
                                    color: 'var(--color-primary)',
                                }
                            },
                            '& .MuiOutlinedInput-input': {
                                color: 'var(--color-text)',
                            }
                        }}
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
                            variant="outlined"
                            size="small"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'var(--color-bg)',
                                    '& fieldset': {
                                        borderColor: 'var(--color-text-secondary)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--color-primary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--color-primary)',
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--color-text-secondary)',
                                    '&.Mui-focused': {
                                        color: 'var(--color-primary)',
                                    }
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: 'var(--color-text)',
                                }
                            }}
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
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {multipleTo.map((val, index) => {
                                const isInvalid = activeTab === 'email'
                                    ? !isValidEmail(val)
                                    : !isValidPhoneNumber(val);

                                return (
                                    <Chip
                                        key={index}
                                        label={val}
                                        onDelete={() => removeRecipient(index)}
                                        sx={{
                                            backgroundColor: isInvalid ? 'var(--color-error)' : 'var(--color-primary)',
                                            color: '#fff',
                                            '& .MuiChip-deleteIcon': {
                                                color: '#fff',
                                                '&:hover': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                }
                                            }
                                        }}
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
                            variant="outlined"
                            size="small"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            sx={{ 
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'var(--color-bg)',
                                    '& fieldset': {
                                        borderColor: 'var(--color-text-secondary)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--color-primary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--color-primary)',
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--color-text-secondary)',
                                    '&.Mui-focused': {
                                        color: 'var(--color-primary)',
                                    }
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: 'var(--color-text)',
                                }
                            }}
                        />
                        <Typography 
                            variant="caption" 
                            className="text-text-secondary mb-4 block"
                        >
                            Subject should be maximum 60 characters ({subject.length}/60)
                        </Typography>
                    </>
                )}

                {/* Message */}
                <TextField
                    label="Message"
                    fullWidth
                    multiline
                    minRows={4}
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ 
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'var(--color-bg)',
                            '& fieldset': {
                                borderColor: 'var(--color-text-secondary)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'var(--color-primary)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'var(--color-primary)',
                            }
                        },
                        '& .MuiInputLabel-root': {
                            color: 'var(--color-text-secondary)',
                            '&.Mui-focused': {
                                color: 'var(--color-primary)',
                            }
                        },
                        '& .MuiOutlinedInput-input': {
                            color: 'var(--color-text)',
                        }
                    }}
                />

                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={isSendDisabled()}
                    sx={{ 
                        textTransform: 'none', 
                        px: 4,
                        py: 1.5,
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff',
                        fontWeight: 'medium',
                        '&:hover': {
                            backgroundColor: 'var(--color-primary-hover)',
                        },
                        '&:disabled': {
                            backgroundColor: 'var(--color-text-secondary)',
                            color: 'var(--color-bg)',
                        }
                    }}
                >
                    Send {activeTab === 'email' ? 'Email' : 'Message'}
                </Button>
            </Paper>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity} 
                    sx={{ 
                        width: '100%',
                        backgroundColor: 'var(--color-card-bg)',
                        color: 'var(--color-text)',
                        '& .MuiAlert-icon': {
                            color: 'var(--color-primary)',
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Dialog for Confirming Mode Change */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--color-card-bg)',
                        color: 'var(--color-text)',
                    }
                }}
            >
                <DialogTitle className="text-text">
                    Unsaved Input Detected
                </DialogTitle>
                <DialogContent>
                    <Typography className="text-text-secondary">
                        Changing mode will clear all inputs. Are you sure you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDialogOpen(false)}
                        sx={{
                            color: 'var(--color-text-secondary)',
                            '&:hover': {
                                backgroundColor: 'var(--color-bg)',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmChange}
                        sx={{
                            color: 'var(--color-error)',
                            '&:hover': {
                                backgroundColor: 'var(--color-bg)',
                            }
                        }}
                    >
                        Yes, Clear
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}