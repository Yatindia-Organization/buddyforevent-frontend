import React, { useState } from 'react';
import {
  Box, TextField, TextareaAutosize, FormControlLabel, Checkbox, Stack, Button, Typography
} from '@mui/material';

export default function FieldSettings({ field, onSave, onCancel }) {
  const lockedTypes = ['Email', 'Phone Number', 'Custom ID']; // Custom ID label is locked

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
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        ) : (
          <TextField
            label="Label"
            name="label"
            value={form.label}
            onChange={handleChange}
            size="small"
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        )}

        {/* MAX LENGTH - for Input, Email, Phone, Textarea, Number */}
        {['Input Field', 'Email', 'Phone Number', 'Textarea', 'Number Field'].includes(form.type) && (
          <TextField
            label="Max Length"
            name="maxLength"
            value={form.maxLength || ''}
            onChange={handleChange}
            size="small"
            type="number"
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        )}

        {/* DESCRIPTION */}
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          size="small"
          multiline
          sx={{
            '& .MuiInputBase-input': { color: 'var(--color-text)' },
            '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
          }}
        />

        {/* NUMBER FIELD - Min/Max values */}
        {form.type === 'Number Field' && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Value"
              name="minValue"
              type="number"
              value={form.minValue || ''}
              onChange={handleChange}
              size="small"
              sx={{
                '& .MuiInputBase-input': { color: 'var(--color-text)' },
                '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
              }}
            />
            <TextField
              label="Max Value"
              name="maxValue"
              type="number"
              value={form.maxValue || ''}
              onChange={handleChange}
              size="small"
              sx={{
                '& .MuiInputBase-input': { color: 'var(--color-text)' },
                '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
              }}
            />
          </Stack>
        )}

        {/* OPTIONS - for Select, Radio, Checkbox */}
        {['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
              Options (one per line):
            </Typography>
            <TextareaAutosize
              minRows={3}
              value={optionsText}
              onChange={handleOptions}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid var(--color-text-secondary)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </>
        )}

        {/* URL VALIDATION PATTERN */}
        {form.type === 'URL' && (
          <TextField
            label="Validation RegExp"
            name="validationPattern"
            value={form.validationPattern || ''}
            onChange={handleChange}
            size="small"
            helperText="Optional regex pattern for URL validation"
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        )}

        {/* DATE - Min/Max dates */}
        {form.type === 'Date' && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Date"
              name="minDate"
              type="date"
              value={form.minDate || ''}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-input': { color: 'var(--color-text)' },
                '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
              }}
            />
            <TextField
              label="Max Date"
              name="maxDate"
              type="date"
              value={form.maxDate || ''}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-input': { color: 'var(--color-text)' },
                '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
              }}
            />
          </Stack>
        )}

        {/* LABEL CONTENT */}
        {form.type === 'Label' && (
          <TextField
            label="Label Content"
            name="text"
            value={form.text || ''}
            onChange={handleChange}
            size="small"
            multiline
            rows={2}
            helperText="The text to display for this label"
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        )}

        {/* TERMS & CONDITIONS */}
        {form.type === 'Terms & Condition' && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
              Terms & Conditions Text:
            </Typography>
            <TextareaAutosize
              minRows={3}
              name="text"
              value={form.text || ''}
              onChange={handleChange}
              placeholder="Enter your terms and conditions text..."
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid var(--color-text-secondary)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isCheckedRequired || false}
                  name="isCheckedRequired"
                  onChange={handleChange}
                  sx={{ color: 'var(--color-text)' }}
                />
              }
              label="User must accept"
              sx={{ color: 'var(--color-text)' }}
            />
          </>
        )}

        {/* CUSTOM ID - Only value editable, not label */}
        {form.type === 'Custom ID' && (
          <TextField
            label="Custom ID Value"
            name="customValue"
            value={form.customValue || ''}
            onChange={handleChange}
            size="small"
            helperText="Enter the custom ID value/format"
            sx={{
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
              '& .MuiInputBase-root': { bgcolor: 'var(--color-card-bg)' }
            }}
          />
        )}

        {/* TOGGLES */}
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={form.mandatory || false} 
                name="mandatory" 
                onChange={handleChange}
                sx={{ color: 'var(--color-text)' }}
              />
            }
            label="Mandatory"
            sx={{ color: 'var(--color-text)' }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={form.invisible || false} 
                name="invisible" 
                onChange={handleChange}
                sx={{ color: 'var(--color-text)' }}
              />
            }
            label="Invisible"
            sx={{ color: 'var(--color-text)' }}
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