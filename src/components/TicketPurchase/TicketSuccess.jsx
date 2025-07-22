import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Grid,
  Chip,
  Stack,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import { 
  CheckCircle,
  Download,
  Email,
  Share,
  Home,
  Person,
  EventSeat,
  GetApp
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketSuccess() {
  const { eventId, orderId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_ROUTE}/api/v1/ticket-orders/${orderId}`);
      if (!response.ok) throw new Error('Order not found');
      
      const data = await response.json();
      setOrder(data.data);
      
      // Extract ticket information from order data
      const ticketInfo = [];
      data.data.ticketDetails.forEach((tierGroup, tierIndex) => {
        tierGroup.participantForms.forEach((form, formIndex) => {
          ticketInfo.push({
            id: `${tierIndex}_${formIndex}`,
            participantName: form.participantName || `Guest ${ticketInfo.length + 1}`,
            tierName: tierGroup.tierName,
            seat: form.seat,
            qrCodeUrl: null // This would be populated from the completion response
          });
        });
      });
      setTickets(ticketInfo);
      
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (ticketUrl, filename) => {
    try {
      const response = await fetch(ticketUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadAllTickets = async () => {
    setDownloading(true);
    try {
      // In a real implementation, you'd create a ZIP file
      // For now, download each ticket individually
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.qrCodeUrl) {
          await downloadTicket(ticket.qrCodeUrl, `ticket_${ticket.participantName.replace(/\s+/g, '_')}.png`);
          // Add delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Bulk download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Event Tickets',
        text: `I just got tickets for ${order?.eventId?.name}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'var(--font-base)'
    }}>
      {/* Success Header */}
      <Box sx={{ 
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)'
         : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
       py: 8,
       textAlign: 'center'
     }}>
       <Container maxWidth="lg">
         <Box sx={{ 
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
           animation: 'fadeInUp 0.8s ease-out'
         }}>
           <CheckCircle sx={{ 
             fontSize: 100, 
             color: 'white',
             mb: 3,
             filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
           }} />
           <Typography variant="h2" sx={{ 
             color: 'white', 
             fontFamily: 'var(--font-heading)',
             fontWeight: 800,
             mb: 2,
             fontSize: { xs: '2rem', md: '3rem' }
           }}>
             Payment Successful!
           </Typography>
           <Typography variant="h5" sx={{ 
             color: 'rgba(255,255,255,0.9)',
             mb: 4,
             maxWidth: '600px'
           }}>
             Your tickets have been generated and are ready for download
           </Typography>
           
           {/* Quick stats */}
           <Grid container spacing={4} sx={{ maxWidth: '600px' }}>
             <Grid item xs={4}>
               <Box sx={{ textAlign: 'center' }}>
                 <Typography variant="h4" sx={{ 
                   color: 'white',
                   fontWeight: 700,
                   fontFamily: 'var(--font-heading)'
                 }}>
                   {tickets.length}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                   Tickets
                 </Typography>
               </Box>
             </Grid>
             <Grid item xs={4}>
               <Box sx={{ textAlign: 'center' }}>
                 <Typography variant="h4" sx={{ 
                   color: 'white',
                   fontWeight: 700,
                   fontFamily: 'var(--font-heading)'
                 }}>
                   ₹{order?.totalAmount?.toLocaleString()}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                   Total Paid
                 </Typography>
               </Box>
             </Grid>
             <Grid item xs={4}>
               <Box sx={{ textAlign: 'center' }}>
                 <Typography variant="h4" sx={{ 
                   color: 'white',
                   fontWeight: 700,
                   fontFamily: 'var(--font-heading)'
                 }}>
                   <CheckCircle sx={{ fontSize: 'inherit' }} />
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                   Confirmed
                 </Typography>
               </Box>
             </Grid>
           </Grid>
         </Box>
       </Container>
     </Box>

     <Container maxWidth="lg" sx={{ py: 6 }}>
       <Grid container spacing={6}>
         {/* Tickets Display */}
         <Grid item xs={12} md={8}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
             <Typography variant="h5" sx={{ 
               fontFamily: 'var(--font-heading)',
               fontWeight: 700,
               color: 'var(--color-text)'
             }}>
               Your Tickets
             </Typography>
             <Button
               variant="contained"
               startIcon={downloading ? <CircularProgress size={20} /> : <GetApp />}
               onClick={downloadAllTickets}
               disabled={downloading}
               sx={{
                 borderRadius: '50px',
                 background: 'var(--gradient-primary)',
                 '&:hover': {
                   background: 'var(--gradient-primary)',
                   transform: 'translateY(-2px)'
                 }
               }}
             >
               {downloading ? 'Downloading...' : 'Download All'}
             </Button>
           </Box>

           <Stack spacing={3}>
             {tickets.map((ticket, index) => (
               <Card key={ticket.id} sx={{ 
                 borderRadius: 4,
                 border: '1px solid var(--border-color)',
                 background: 'var(--color-card-bg)',
                 transition: 'all 0.3s ease',
                 '&:hover': {
                   borderColor: 'var(--color-primary)',
                   transform: 'translateY(-2px)',
                   boxShadow: 'var(--shadow-lg)'
                 }
               }}>
                 <CardContent sx={{ p: 4 }}>
                   <Grid container spacing={3} alignItems="center">
                     <Grid item xs={12} md={3}>
                       {/* QR Code placeholder - in real implementation, this would show the actual QR */}
                       <Box sx={{
                         width: '120px',
                         height: '120px',
                         background: 'var(--gradient-primary)',
                         borderRadius: 3,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontWeight: 700,
                         fontSize: '0.9rem',
                         textAlign: 'center',
                         mx: 'auto'
                       }}>
                         QR CODE
                         <br />
                         #{index + 1}
                       </Box>
                     </Grid>
                     
                     <Grid item xs={12} md={6}>
                       <Stack spacing={2}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Person sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
                           <Typography variant="h6" sx={{ 
                             fontFamily: 'var(--font-heading)',
                             fontWeight: 600
                           }}>
                             {ticket.participantName}
                           </Typography>
                         </Box>
                         
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                           <Chip 
                             label={ticket.tierName}
                             sx={{ 
                               background: 'var(--color-primary)',
                               color: 'white',
                               fontWeight: 600
                             }}
                           />
                           {ticket.seat && (
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                               <EventSeat sx={{ fontSize: 16, color: 'var(--color-text-secondary)' }} />
                               <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                 Seat: {ticket.seat}
                               </Typography>
                             </Box>
                           )}
                         </Box>
                         
                         <Typography variant="body2" sx={{ 
                           color: 'var(--color-text-secondary)',
                           fontFamily: 'monospace',
                           fontSize: '0.85rem'
                         }}>
                           Ticket ID: TKT-{orderId?.slice(-8).toUpperCase()}-{index + 1}
                         </Typography>
                       </Stack>
                     </Grid>
                     
                     <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
                       <Button
                         variant="outlined"
                         startIcon={<Download />}
                         onClick={() => ticket.qrCodeUrl && downloadTicket(
                           ticket.qrCodeUrl, 
                           `ticket_${ticket.participantName.replace(/\s+/g, '_')}.png`
                         )}
                         disabled={!ticket.qrCodeUrl}
                         sx={{
                           borderColor: 'var(--color-primary)',
                           color: 'var(--color-primary)',
                           borderRadius: '50px',
                           '&:hover': {
                             borderColor: 'var(--color-primary)',
                             background: 'var(--color-primary)',
                             color: 'white'
                           }
                         }}
                       >
                         Download
                       </Button>
                     </Grid>
                   </Grid>
                 </CardContent>
               </Card>
             ))}
           </Stack>

           <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
             <Typography variant="body2">
               <strong>Important:</strong> Please save your tickets and bring them (printed or on mobile) to the event. 
               Each QR code will be scanned for entry verification.
             </Typography>
           </Alert>
         </Grid>

         {/* Order Details Sidebar */}
         <Grid item xs={12} md={4}>
           <Card sx={{ 
             borderRadius: 4,
             background: 'var(--color-card-bg)',
             border: '1px solid var(--border-color)',
             position: 'sticky',
             top: 24
           }}>
             <CardContent sx={{ p: 4 }}>
               <Typography variant="h6" sx={{ 
                 fontFamily: 'var(--font-heading)',
                 fontWeight: 700,
                 color: 'var(--color-text)',
                 mb: 3
               }}>
                 Order Details
               </Typography>

               {/* Event Info */}
               <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: 'var(--color-bg-secondary)' }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                   {order?.eventId?.name}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
                   {order?.eventId?.start_date && format(new Date(order.eventId.start_date), 'MMM d, yyyy')}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                   {order?.eventId?.location}
                 </Typography>
               </Box>

               <Divider sx={{ my: 3 }} />

               {/* Customer Info */}
               <Stack spacing={2} sx={{ mb: 3 }}>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                     Customer Name
                   </Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
                     {order?.customerName}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                     Email
                   </Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
                     {order?.customerEmail}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                     Phone
                   </Typography>
                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
                     {order?.customerPhone}
                   </Typography>
                 </Box>
               </Stack>

               <Divider sx={{ my: 3 }} />

               {/* Payment Summary */}
               <Stack spacing={1} sx={{ mb: 3 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="body2">Subtotal:</Typography>
                   <Typography variant="body2">₹{order?.originalAmount?.toLocaleString()}</Typography>
                 </Box>
                 
                 {order?.discountAmount > 0 && (
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                       Discount:
                     </Typography>
                     <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                       -₹{order.discountAmount.toLocaleString()}
                     </Typography>
                   </Box>
                 )}
                 
                 <Divider />
                 
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="h6" sx={{ fontWeight: 700 }}>
                     Total Paid:
                   </Typography>
                   <Typography variant="h6" sx={{ 
                     fontWeight: 700,
                     color: 'var(--color-primary)'
                   }}>
                     ₹{order?.totalAmount?.toLocaleString()}
                   </Typography>
                 </Box>
               </Stack>

               <Divider sx={{ my: 3 }} />

               {/* Actions */}
               <Stack spacing={2}>
                 <Button
                   variant="outlined"
                   fullWidth
                   startIcon={<Share />}
                   onClick={shareOrder}
                   sx={{
                     borderColor: 'var(--color-primary)',
                     color: 'var(--color-primary)',
                     '&:hover': {
                       borderColor: 'var(--color-primary)',
                       background: 'var(--color-primary)',
                       color: 'white'
                     }
                   }}
                 >
                   Share Order
                 </Button>
                 
                 <Button
                   variant="contained"
                   fullWidth
                   startIcon={<Home />}
                   onClick={() => navigate('/events')}
                   sx={{
                     background: 'var(--gradient-primary)',
                     '&:hover': {
                       background: 'var(--gradient-primary)',
                       transform: 'translateY(-2px)'
                     }
                   }}
                 >
                   Browse More Events
                 </Button>
               </Stack>

               <Typography variant="caption" sx={{ 
                 display: 'block',
                 textAlign: 'center',
                 color: 'var(--color-text-secondary)',
                 mt: 3
               }}>
                 Order ID: {orderId?.slice(-12).toUpperCase()}
               </Typography>
             </CardContent>
           </Card>
         </Grid>
       </Grid>
     </Container>

     <style jsx>{`
       @keyframes fadeInUp {
         from { opacity: 0; transform: translateY(30px); }
         to { opacity: 1; transform: translateY(0); }
       }
     `}</style>
   </Box>
 );
}