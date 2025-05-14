import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    Box,
    Button,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Stack,
    IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function AddParticipants() {
    const [excelData, setExcelData] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [columnName] = useState({
        eventId: "475asdfasdfa46d1fa78sd7f",
        userId: "798465sdfa6sdf6as",
        fields: [
            { label: "Name" },
            { label: "Email" },
            { label: "City", options: ["Hyd", "Chennai", "Delhi"] },
            { label: "Gender", options: ["Male", "Female"] }
        ]
    });

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showToast = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file || !/\.(xls|xlsx)$/i.test(file.name)) {
            showToast("Invalid file format. Please upload an Excel file (.xls or .xlsx)", 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const headers = data[0];
            const rows = data.slice(1);
            const json = rows.map((row) =>
                headers.reduce((acc, header, i) => {
                    acc[header] = row[i];
                    return acc;
                }, {})
            );

            setExcelData(json);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            fetch('/api/upload-participants', {
                method: 'POST',
                headers: { 'Content-Type': 'text/csv' },
                body: csv,
            })
                .then(res => {
                    if (res.ok) {
                        showToast("File uploaded successfully!", 'success');
                    } else {
                        showToast("Upload failed. Please try again.", 'error');
                    }
                })
                .catch(() => showToast("Upload failed. Server error.", 'error'));
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const headers = columnName.fields?.map(f => f.label.toLowerCase());
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, "participants_template.xlsx");
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Add Participants
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <label htmlFor="upload-excel">
                    <input
                        accept=".xlsx,.xls"
                        id="upload-excel"
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Upload Excel File
                    </Button>
                </label>

                <Button variant="contained" color="primary" onClick={handleDownloadTemplate}>
                    Download Template
                </Button>
            </Stack>

            {excelData.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Uploaded Preview:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: 300, overflow: 'auto' }}>
                        <pre>{JSON.stringify(excelData, null, 2)}</pre>
                    </Paper>
                </Box>
            )}

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
