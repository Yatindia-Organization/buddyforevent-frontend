import React, { useState } from 'react';
import FormBuilder from '../DynamicFormBuilder/FormBuilder/FormBuilder';
import TicketRegistrationForm from '../TicketRegistration/TicketRegistrationForm';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

export default function ParticipantRegistration() {
    const [formType, setFormType] = useState('ticket'); // 'ticket' or 'user'

    return (
        <div className='flex flex-col gap-[1vw]'>
            <div className='flex justify-between'>
                <div className='w-auto'>
                    <p className='text-[28px] text-[#9A93B3] font-medium'>Event Registration</p>
                    <p className='text-[14px] text-[#494949]'>You can create event registrations form and ticket registration count here for your event.</p>
                </div>
                {/* Toggle for registration type form */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <ToggleButtonGroup
                        value={formType}
                        exclusive
                        onChange={(e, val) => val && setFormType(val)}
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
                        <ToggleButton value="ticket">Ticket Registration</ToggleButton>
                        <ToggleButton value="user">User Registration Form</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </div>

            <div className='w-full h-auto bg-white'>
                {formType === 'ticket' ? <TicketRegistrationForm /> : <FormBuilder />}
            </div>
        </div>
    );
}
