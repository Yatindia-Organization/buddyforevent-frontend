// src/components/Admin/Dashboard/Dashboard.jsx
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
import { useTheme } from '../../../contexts/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const context = useGlobalInfo();
  const userId = context?.userId;
  const { theme } = useTheme();

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/userid/${userId}`);
        const json = await res.json();
        setEvents(json?.data || []);
      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    })();
  }, [userId]);

  const handleRequestSort = (prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };
  const handleClick = (id) => {
    context.changeEvent(id);
    navigate(`/event-dashboard/event/${id}`);
  };

  const sorted = events.slice().sort((a, b) => {
    if (order === 'asc') return a[orderBy] < b[orderBy] ? -1 : 1;
    return a[orderBy] > b[orderBy] ? -1 : 1;
  });
  const pageSlice = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // summary cards data
  const stats = [
    ['Events completed', events.filter(e => e.status === 'completed').length],
    ['Total Events', events.length],
    ['Total Registration', events.reduce((sum, e) => sum + (e.registrations || 0), 0)],
    ['Total Participants', events.reduce((sum, e) => sum + (e.participants || 0), 0)],
  ];

  return (
    <div className="min-h-screen p-6 bg-bg text-text font-sans">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="bg-card p-6 rounded-xl shadow-md text-center"
          >
            <p className="text-sm uppercase text-text-secondary mb-2">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Latest Events table */}
      <h2 className="text-2xl font-heading text-text mb-4">Latest Events</h2>
      <div className="p-3">
        <Paper className="bg-card">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-primary">
                  {[
                    { id: 'name', label: 'Name' },
                    { id: 'start_date', label: 'Start Date' },
                    { id: 'end_date', label: 'End Date' },
                    { id: 'privateEvent', label: 'Private' },
                    { id: 'publicEvent', label: 'Public' },
                    { id: 'gift_tracking', label: 'Gifts' },
                    { id: 'food_tracking', label: 'Food' },
                  ].map((col) => (
                    <TableCell
                      key={col.id}
                      className="text-text font-medium"
                      sortDirection={orderBy === col.id ? order : false}
                    >
                      {col.id !== 'actions' ? (
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={() => handleRequestSort(col.id)}
                          className="text-text"
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageSlice.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-text-secondary">
                      No events available.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageSlice.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell
                        onClick={() => handleClick(row._id)}
                        className="cursor-pointer text-text"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell className="text-text">
                        {new Date(row.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-text">
                        {new Date(row.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-text">
                        {row.privateEvent ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-text">
                        {row.publicEvent ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-text">
                        {row.gift_tracking ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-text">
                        {row.food_tracking ? 'Yes' : 'No'}
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
            className="bg-card text-text"
          />
        </Paper>
      </div>

      {/* Chart */}
      <div className="p-4 bg-bg">
        {/* <EventStatsChart /> */}
      </div>
    </div>
  );
};

export default Dashboard;
