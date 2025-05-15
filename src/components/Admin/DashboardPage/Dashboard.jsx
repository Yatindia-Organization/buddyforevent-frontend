// import React from 'react';
// import { NavLink, Outlet, useLocation } from 'react-router-dom';

// const dashboardTabs = [
//     { name: "Event Dashboard", route: "event-dashboard" },
//     { name: "Participant Registration", route: "participant-registration" },
//     { name: "Bulk Ticket", route: "bulk-ticket" },
//     { name: "Single Registration", route: "single-registration" },
//     { name: "View Participants", route: "view-participants" },
//     { name: "Payment History", route: "payment-history" },
//     { name: "Email/Message", route: "email-message" },
//     { name: "Reports", route: "reports" },
// ];

// export default function Dashboard() {
//     const location = useLocation();

//     return (
//         <div className='p-4'>
//             {/* Tabs */}
//             <div className='flex space-x-4 border-b pb-2 mb-4'>
//                 {dashboardTabs.map((tab) => (
//                     <NavLink
//                         key={tab.route}
//                         to={`/dashboard/${tab.route}`}
//                         className={({ isActive }) =>
//                             isActive || location.pathname === `/dashboard` && tab.route === 'event-dashboard'
//                                 ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
//                                 : "text-gray-600 hover:text-blue-500"
//                         }
//                         end
//                     >
//                         {tab.name}
//                     </NavLink>
//                 ))}
//             </div>

//             {/* Content */}
//             <Outlet />
//         </div>
//     );
// }



// {/* <a href="/create-event" className='text-blue hover:bg-red-50'>+ create event</a> */ }


import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
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
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const event = [
        {
            coverImage: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723822/xa9ad9tilpzy8kp6lrd9.jpg",
            description: "this is the event description ",
            endDate: "2025-05-10T18:30:00.000Z",
            eventImages: ["https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723824/nionl9y9u6lwdzwl9xmr.jpg", "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723824/xauhjqf3qadb4slcyq4a.jpg"],
            foodTracking: true,
            giftTracking: true,
            logoImage: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1746723823/z4zeg4o6axyte0xf3mkz.jpg",
            name: "event_010",
            eventType: "public",
            startDate: "2025-05-08T18:30:00.000Z",
        },
    ];

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
        // navigate to edit page if needed
    };

    const handleDelete = (eventData) => {
        console.log('Delete', eventData);
        // handle delete logic
    };

    const sortedEvents = event.slice().sort(getComparator(order, orderBy));
    const paginatedEvents = sortedEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div>
            <div className='flex justify-around'>
                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#D1FAE5]'>
                        <img className='w-[2vw]' src="/svg/event-completed.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-bold text-[24px]'>Events completed</p>
                    <p className='text-[#0F172A] font-extrabold text-[20px]'>12</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#D6D1FA]'>
                        <img className='w-[2vw]' src="/svg/total-event.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-bold text-[24px]'>Total Events</p>
                    <p className='text-[#0F172A] font-extrabold text-[20px]'>21</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#FFDFDF]'>
                        <img className='w-[2vw]' src="/svg/mail-open.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-bold text-[24px]'>Total Registration</p>
                    <p className='text-[#0F172A] font-extrabold text-[20px]'>22</p>
                </div>

                <div className='flex flex-col justify-center items-center gap-[0.4vw]'>
                    <div className='w-[4vw] aspect-square flex justify-center items-center  rounded-full bg-[#F8E5DA]'>
                        <img className='w-[2vw]' src="/svg/eye-off.svg" alt="event-completed" />
                    </div>
                    <p className='text-[#0F172A] font-bold text-[24px]'>Total Participants</p>
                    <p className='text-[#0F172A] font-extrabold text-[20px]'>225</p>
                </div>

            </div>
            <div>
                <div className='text-[32px] p-3 font-extrabold text-[#140088]'>
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
                                                { id: 'endDate', label: 'End Date' },
                                                { id: 'privateEvent', label: 'Private' },
                                                { id: 'publicEvent', label: 'Public' },
                                                { id: 'giftTracking', label: 'Gifts' },
                                                { id: 'foodTracking', label: 'Food' },
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
                                        {paginatedEvents.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{new Date(row.startDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(row.endDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{row.privateEvent ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{row.publicEvent ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{row.giftTracking ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{row.foodTracking ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleEdit(row)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(row)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <TablePagination
                                component="div"
                                count={event.length}
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
