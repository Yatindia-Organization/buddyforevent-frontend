import React, { useState } from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DraggableField({ field, onConfigure, onDelete }) {
  // types whose labels must stay fixed
  const lockedTypes = ['Email', 'Phone Number', 'Custom ID'];

  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(field.label);

  const applyLabel = () => {
    setEditingLabel(false);
    field.label = tempLabel;   // or call a prop to persist this change
  };

  return (
    <Box sx={{ position: 'relative', p: 2, bgcolor: 'var(--color-card-bg)', borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {lockedTypes.includes(field.type) ? (
          // locked: just render the label
          <Typography variant="subtitle2" sx={{ color: 'var(--color-text)' }}>
            {field.label}
          </Typography>
        ) : editingLabel ? (
          <TextField
            value={tempLabel}
            onChange={e => setTempLabel(e.target.value)}
            onBlur={applyLabel}
            size="small"
            sx={{ flexGrow: 1 }}
            autoFocus
          />
        ) : (
          <Typography
            variant="subtitle2"
            onClick={() => setEditingLabel(true)}
            sx={{ cursor: 'pointer', color: 'var(--color-text)' }}
          >
            {field.label || field.type}
          </Typography>
        )}

        <Box>
          <IconButton size="small" onClick={() => onConfigure(field.id)}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(field.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
        {field.description || 'Field description…'}
      </Typography>
    </Box>
  );
}
