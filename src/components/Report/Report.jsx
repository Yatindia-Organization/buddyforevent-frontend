import React from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const urlItems = [
    { label: 'LIVE UPDATE URL', url: 'https://in.explara.com/e/abc-event-qeajeyfepdf92ob5' },
    { label: 'EVENT FEEDBACK URL', url: 'https://in.explara.com/e/abc-event-qeajeyfepdf92ob5' },
    { label: 'LIVE POLL URL', url: 'https://in.explara.com/e/abc-event-qeajeyfepdf92ob5' }
];

const tableData = [
    { id: '#15267', date: 'Mar 1, 2023', participant: 100, details: 1 },
    { id: '#153587', date: 'Jan 26, 2023', participant: 300, details: 3 },
    { id: '#12436', date: 'Feb 12, 2033', participant: 100, details: 1 },
    { id: '#16879', date: 'Feb 12, 2033', participant: 500, details: 5 },
    { id: '#16378', date: 'Feb 28, 2033', participant: 500, details: 5 },
    { id: '#16609', date: 'March 13, 2033', participant: 100, details: 1 },
    { id: '#16907', date: 'March 18, 2033', participant: 100, details: 1 },
];

export default function Report() {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleShare = (url) => {
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Event Report
            </Typography>

            {/* URL Sections */}
            <Box sx={{ mb: 4 }}>
                {urlItems.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ width: 180 }}>
                            {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0066cc', mr: 2 }}>
                            <Link href={item.url} target="_blank" underline="hover">{item.url}</Link>
                        </Typography>
                        <IconButton onClick={() => handleCopy(item.url)}><ContentCopyIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => handleShare(item.url)}><WhatsAppIcon fontSize="small" color="success" /></IconButton>
                        <Typography variant="caption" sx={{ ml: 1 }}>COPY</Typography>
                        <Typography variant="caption" sx={{ ml: 2 }}>SHARE</Typography>
                    </Box>
                ))}
            </Box>

            {/* Tabs-like Links */}
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Link href="#" underline="hover" sx={{ fontWeight: 'bold', color: '#0066cc' }}>
                    View Live Count
                </Link>
                <Link href="#" underline="hover" sx={{ fontWeight: 'bold', color: '#0066cc' }}>
                    Event FeedBack
                </Link>
                <Link href="/event-dashboard/create-poll" underline="hover" sx={{ fontWeight: 'bold', color: '#0066cc' }}>
                    Add Live Poll
                </Link>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Participant</TableCell>
                            <TableCell>Event Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.participant}</TableCell>
                                <TableCell>{row.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination UI (static) */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Box display="flex" alignItems="center">
                    <Select size="small" value={10}>
                        <MenuItem value={10}>10</MenuItem>
                    </Select>
                    <Typography variant="body2" sx={{ ml: 1 }}>per page</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Select size="small" value={1}>
                        <MenuItem value={1}>1</MenuItem>
                    </Select>
                    <Typography variant="body2">of 1 pages</Typography>
                    <Button size="small">{'<'}</Button>
                    <Button size="small">{'>'}</Button>
                </Box>
            </Box>
        </Box>
    );
}
