import React, { useState } from 'react';
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    Button
} from '@mui/material';

const participantData = [
    { name: 'Guest 2', entry: '09:00', exit: '18:00', gift: 'YES', food: 'YES' },
    { name: 'Guest', entry: '00:00', exit: '00:00', gift: 'NO', food: 'NO' },
    { name: 'Guest', entry: '10:30', exit: '18:00', gift: 'NO', food: 'NO' },
    { name: 'Guest', entry: '09:00', exit: '18:00', gift: 'YES', food: 'YES' },
    { name: 'Guest', entry: '09:00', exit: '18:00', gift: 'YES', food: 'YES' },
    { name: 'Guest', entry: '09:00', exit: '18:00', gift: 'YES', food: 'YES' }
];

export default function Participants() {
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getBoxStyle = (value) => {
        if (value === 'YES') return { backgroundColor: '#e0f0ff', color: 'green' };
        if (value === 'NO') return { backgroundColor: '#ffecec', color: 'red' };
        return { backgroundColor: '#fff5cc', color: 'orange' };
    };

    const isPresent = (entry, exit) => {
        return entry !== '00:00' && exit !== '00:00';
    };

    const filteredData = participantData.filter((row) => {
        if (filter === 'All') return true;
        if (filter === 'Present') return isPresent(row.entry, row.exit);
        if (filter === 'Not Present') return !isPresent(row.entry, row.exit);
        return true;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <Box p={3}>
            <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
                Event Participant live data
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Participant Overview
            </Typography>

            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(e, val) => val && setFilter(val)}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Present">Present</ToggleButton>
                <ToggleButton value="Not Present">not present</ToggleButton>
            </ToggleButtonGroup>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Entry Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Exit Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Gift</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Food</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.entry}</TableCell>
                                <TableCell>{row.exit}</TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            ...getBoxStyle(row.gift),
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            textAlign: 'center',
                                            width: 'fit-content',
                                        }}
                                    >
                                        {row.gift}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            ...getBoxStyle(row.food),
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            textAlign: 'center',
                                            width: 'fit-content',
                                        }}
                                    >
                                        {row.food}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Box display="flex" alignItems="center">
                    <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                    <Typography variant="body2" sx={{ ml: 1 }}>per page</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Select size="small" value={page} onChange={(e) => setPage(e.target.value)}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                        ))}
                    </Select>
                    <Typography variant="body2">of {totalPages} pages</Typography>
                    <Button size="small" onClick={handlePrevPage}>{'<'}</Button>
                    <Button size="small" onClick={handleNextPage}>{'>'}</Button>
                </Box>
            </Box>
        </Box>
    );
}
