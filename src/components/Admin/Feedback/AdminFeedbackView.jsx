import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_ROUTE } from '../../../lib/config';
import { useTheme } from '../../../contexts/ThemeContext';
import { Paper, Typography, Container, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@mui/material';
import { format } from 'date-fns';
import { useGlobalInfo } from '../../../contexts/globalContext';

const FeedbackAdmin = () => {
    const context = useGlobalInfo();
    const eventId = context.event;
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/event/feedback/event/${eventId}`);
      if (!res.ok) throw new Error('Failed to fetch feedbacks');
      const { data } = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    const intervalId = setInterval(fetchFeedbacks, 10000); // Fetch feedback every 10 seconds

    return () => clearInterval(intervalId);
  }, [eventId]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <div className="text-center mt-10">Loading feedback...</div>;

  return (
    <Container maxWidth="lg" className="min-h-screen py-8 bg-bg text-text">
      <Typography variant="h4" gutterBottom>
        Event Feedback
      </Typography>

      <TableContainer component={Paper} className="bg-card rounded-lg shadow">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Submitted At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((feedback) => (
              <TableRow key={feedback._id}>
              <TableCell>
   { typeof feedback.user === 'string'
       ? feedback.user
       : feedback.user.name || JSON.stringify(feedback.user)
   }
 </TableCell>
                <TableCell>{feedback.rating}</TableCell>
                <TableCell>{feedback.comment}</TableCell>
                <TableCell>{format(new Date(feedback.createdAt), 'PPPp')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={feedbacks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default FeedbackAdmin;
