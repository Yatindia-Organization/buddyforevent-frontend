import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

export default function ToolboxField({ type, icon, onDragStart }) {
  return (
    <Paper
      draggable
      onDragStart={onDragStart}
      sx={{
        p: 1,
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'grab',
        userSelect: 'none',
        bgcolor: 'var(--color-card-bg)',
        '&:hover': { bgcolor: 'var(--color-bg)' }
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography>{icon}</Typography>
        <Typography variant="body2">{type}</Typography>
      </Stack>
    </Paper>
  );
}
