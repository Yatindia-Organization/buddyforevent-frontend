import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const mockData = [
    { id: '#15267', date: 'Mar 1, 2023', amount: 100, questions: 1, status: 'Success' },
    { id: '#153587', date: 'Jan 26, 2023', amount: 300, questions: 3, status: 'Success' },
    { id: '#12436', date: 'Feb 12, 2033', amount: 100, questions: 1, status: 'Success' },
    { id: '#16879', date: 'Feb 12, 2033', amount: 500, questions: 5, status: 'Success' },
    { id: '#16378', date: 'Feb 28, 2033', amount: 500, questions: 5, status: 'Rejected' },
    { id: '#16609', date: 'March 13, 2033', amount: 100, questions: 1, status: 'Success' },
    { id: '#16907', date: 'March 18, 2033', amount: 100, questions: 1, status: 'Pending' },
];

export default function PaymentHistory() {
    const [filter, setFilter] = useState('All');

    const filteredData = mockData.filter(item => {
        if (filter === 'All') return true;
        return item.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'green';
            case 'Pending': return 'blue';
            case 'Rejected': return 'red';
            default: return 'inherit';
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Payment History
            </Typography>

            {/* Earnings Summary */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Paper sx={{ p: 2, minWidth: 250, flex: 1, bgcolor: '#e9fef3' }}>
                    <Typography variant="subtitle2">Total Earnings</Typography>
                    <Typography variant="h6" sx={{ color: 'green' }}>₹430.00</Typography>
                    <Typography variant="caption">as of 1-December 2022</Typography>
                </Paper>
                <Paper sx={{ p: 2, minWidth: 250, flex: 1, bgcolor: '#f0f7ff' }}>
                    <Typography variant="subtitle2">Pending Payments</Typography>
                    <Typography variant="h6" sx={{ color: 'blue' }}>₹100.00</Typography>
                    <Typography variant="caption">as of 1-December 2022</Typography>
                </Paper>
                <Paper sx={{ p: 2, minWidth: 250, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Withdrawal Method</Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">
                            🏦 1502********4832
                        </Typography>
                        <Box>
                            <IconButton size="small" color="success">
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Filter Buttons */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Payment History
            </Typography>
            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(e, val) => val && setFilter(val)}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Complete">Complete</ToggleButton>
                <ToggleButton value="Pending">Pending</ToggleButton>
                <ToggleButton value="Rejected">Rejected</ToggleButton>
            </ToggleButtonGroup>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Total Questions</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.amount}</TableCell>
                                <TableCell>{row.questions}</TableCell>
                                <TableCell sx={{ color: getStatusColor(row.status), fontWeight: 500 }}>
                                    {row.status}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination UI (Visual Only) */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Box display="flex" alignItems="center">
                    <Select size="small" value={10}>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
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
