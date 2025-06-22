import React, { useState } from 'react';
import FormBuilder from '../DynamicFormBuilder/FormBuilder/FormBuilder';
import TicketRegistrationForm from '../TicketRegistration/TicketRegistrationForm';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ParticipantRegistration() {
  const { theme } = useTheme();
  const [formType, setFormType] = useState('ticket'); // 'ticket' or 'user'

  return (
    <div className="min-h-screen p-8 bg-bg text-text font-sans flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-heading">Event Registration</p>
          <p className="text-sm text-text-secondary">
            You can create event registration forms and track ticket counts here.
          </p>
        </div>

        {/* Toggle */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--color-card-bg)',
            borderRadius: '8px',
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              border: 'none',
              px: 2,
            },
            '& .MuiToggleButton-root:hover': {
              backgroundColor: 'var(--color-bg)',
            },
            '& .Mui-selected': {
              borderBottom: '3px solid var(--color-primary)',
              backgroundColor: 'transparent',
            },
          }}
        >
          <ToggleButtonGroup
            value={formType}
            exclusive
            onChange={(_, val) => val && setFormType(val)}
          >
            <ToggleButton value="ticket">Ticket Registration</ToggleButton>
            <ToggleButton value="user">User Registration Form</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </div>

      {/* Form Container */}
      <div className="bg-card rounded-lg p-6 shadow">
        {formType === 'ticket' ? <TicketRegistrationForm /> : <FormBuilder />}
      </div>
    </div>
  );
}
