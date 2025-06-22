import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    TablePagination,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventStatsChart from '../../echarts/EventStatsChart';
import { useGlobalInfo } from '../../../contexts/globalContext';
import { API_ROUTE } from '../../../lib/config';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const Dashboard = () => {
    const navigate = useNavigate();
    const context = useGlobalInfo();
    const userId = context?.userId;
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [events, setEvents] = useState([]);
    

    

    useEffect(() => {
        if (!userId) return;

        const fetchEvents = async () => {
            
            try {
                const response = await fetch(`${API_ROUTE}/api/v1/event/userid/${userId}`);
                console.log(response, "this is dashboard")
                const result = await response.json();
                setEvents(result?.data || eventPayload);
            } catch (error) {
                console.error('Failed to fetch events', error);
            }
        };

        fetchEvents();
    }, [userId]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (eventData) => {
        console.log('Edit', eventData);
        
    };

    const handleDelete = (eventData) => {
        console.log('Delete', eventData);
        
    };
      useEffect(() => {
    console.log("Global event is now:", context.event);
  }, [context.event]);

    const handleClick = (id) => {
        context.changeEvent(id);
        navigate(`/event-dashboard/event/${id}`)
    };

    const sortedEvents = events.slice().sort(getComparator(order, orderBy));
    const paginatedEvents = sortedEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div>
            <div className='flex justify-around'>
                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#D1FAE5]'>
                        <img className='w-[2vw]' src="/svg/event-completed.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-medium text-[24px]'>Events completed</p>
                    <p className='text-[#0F172A] font-semibold text-[20px]'>12</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#D6D1FA]'>
                        <img className='w-[2vw]' src="/svg/total-event.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-medium text-[24px]'>Total Events</p>
                    <p className='text-[#0F172A] font-semibold text-[20px]'>21</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#FFDFDF]'>
                        <img className='w-[2vw]' src="/svg/mail-open.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-medium text-[24px]'>Total Registration</p>
                    <p className='text-[#0F172A] font-semibold text-[20px]'>22</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#F8E5DA]'>
                        <img className='w-[2vw]' src="/svg/eye-off.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-medium text-[24px]'>Total Participants</p>
                    <p className='text-[#0F172A] font-semibold text-[20px]'>225</p>
                </div>

            </div>
            <div>
                <div className='text-[32px] p-3 font-bold text-[#140088]'>
                    Latest Events
                </div>

                <div>
                    <Box sx={{ p: 3 }}>
                        <Paper>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#75b8f0' }}>
                                            {[
                                                { id: 'name', label: 'Name' },
                                                { id: 'startDate', label: 'Start Date' },
                                                { id: 'end_date', label: 'End Date' },
                                                { id: 'privateEvent', label: 'Private' },
                                                { id: 'publicEvent', label: 'Public' },
                                                { id: 'gift_tracking', label: 'Gifts' },
                                                { id: 'food_tracking', label: 'Food' },
                                                { id: 'actions', label: 'Actions' },
                                            ].map((headCell) => (
                                                <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
                                                    {headCell.id !== 'actions' ? (
                                                        <TableSortLabel
                                                            active={orderBy === headCell.id}
                                                            direction={orderBy === headCell.id ? order : 'asc'}
                                                            onClick={() => handleRequestSort(headCell.id)}
                                                        >
                                                            {headCell.label}
                                                        </TableSortLabel>
                                                    ) : (
                                                        headCell.label
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
    {paginatedEvents.length === 0 ? (
        <TableRow>
            <TableCell colSpan={8} align="center">
                No events available.
            </TableCell>
        </TableRow>
    ) : (
        paginatedEvents.map((row, index) => (
            <TableRow key={index}>
                <TableCell onClick={() => handleClick(row._id)} className='cursor-pointer'>{row.name}</TableCell>
                <TableCell>{new Date(row.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(row.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{row.privateEvent ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.publicEvent ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.gift_tracking ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.food_tracking ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row)}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
        ))
    )}
</TableBody>

                                </Table>
                            </TableContainer>

                      
                            <TablePagination
                                component="div"
                                count={events.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </Paper>
                    </Box>
                </div>

            </div>
            <div className='p-2'>
                <EventStatsChart />
            </div>

        </div>

    );
};

export default Dashboard;
