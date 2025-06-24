import React, { useState } from 'react';
import {
  Box, TextField, TextareaAutosize, FormControlLabel, Checkbox, Stack, Button, Typography
} from '@mui/material';

export default function FieldSettings({ field, onSave, onCancel }) {
  const lockedTypes = ['Email', 'Phone Number', 'Custom ID'];

  const [form, setForm] = useState(field);
  const [optionsText, setOptionsText] = useState((field.options || []).join('\n'));

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOptions = e => {
    const text = e.target.value;
    setOptionsText(text);
    const opts = text.split('\n').filter(l => l.trim());
    setForm(f => ({ ...f, options: opts }));
  };

  const save = () => {
    if (!form.label.trim()) {
      alert('Label is required');
      return;
    }
    onSave(form);
  };

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--color-card-bg)', borderRadius: 1 }}>
      <Typography variant="subtitle2" mb={1}>
        Type: {form.type}
      </Typography>

      <Stack spacing={2}>
        {/* LABEL: disabled for locked types */}
        {lockedTypes.includes(form.type) ? (
          <TextField
            label="Label"
            value={form.label}
            size="small"
            disabled
          />
        ) : (
          <TextField
            label="Label"
            name="label"
            value={form.label}
            onChange={handleChange}
            size="small"
          />
        )}

        {'maxLength' in form && (
          <TextField
            label="Max Length"
            name="maxLength"
            value={form.maxLength}
            onChange={handleChange}
            size="small"
          />
        )}

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          size="small"
          multiline
        />

        {/* OPTIONS */}
        {['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) && (
          <>
            <Typography variant="body2">Options (one per line):</Typography>
            <TextareaAutosize
              minRows={3}
              value={optionsText}
              onChange={handleOptions}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                borderColor: 'var(--color-text-secondary)'
              }}
            />
          </>
        )}

        {/* URL pattern */}
        {form.type === 'URL' && (
          <TextField
            label="Validation RegExp"
            name="validationPattern"
            value={form.validationPattern}
            onChange={handleChange}
            size="small"
          />
        )}

        {/* DATE */}
        {form.type === 'Date' && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Date"
              name="minDate"
              type="date"
              value={form.minDate}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Max Date"
              name="maxDate"
              type="date"
              value={form.maxDate}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        )}

        {/* TERMS */}
        {form.type === 'Terms & Condition' && (
          <>
            <TextareaAutosize
              minRows={3}
              name="text"
              value={form.text}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                borderColor: 'var(--color-text-secondary)'
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isCheckedRequired}
                  name="isCheckedRequired"
                  onChange={handleChange}
                />
              }
              label="User must accept"
            />
          </>
        )}

        {/* TOGGLES */}
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={<Checkbox checked={form.mandatory} name="mandatory" onChange={handleChange} />}
            label="Mandatory"
          />
          <FormControlLabel
            control={<Checkbox checked={form.invisible} name="invisible" onChange={handleChange} />}
            label="Invisible"
          />
        </Stack>

        {/* SAVE/CANCEL */}
        <Stack direction="row" spacing={2} mt={1}>
          <Button variant="contained" size="small" onClick={save}>
            Save
          </Button>
          <Button variant="text" size="small" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
