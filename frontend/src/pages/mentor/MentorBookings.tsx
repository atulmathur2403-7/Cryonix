import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, useTheme, Skeleton,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { bookingApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  CONFIRMED: 'success', PENDING: 'warning', CANCELLED: 'error', COMPLETED: 'info',
};

const MentorBookings: React.FC = () => {
  const theme = useTheme();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchBookings = (p: number) => {
    setLoading(true);
    bookingApi.getMentorBookings()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setBookings(data);
        setTotal(res.data?.totalElements || data.length);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(page); }, [page]);

  const handleAction = async (bookingId: string, status: string) => {
    try {
      await bookingApi.updateStatus(bookingId, { status });
      fetchBookings(page);
    } catch {}
  };

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 1 }}>
            Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage incoming and past booking requests
          </Typography>
        </FadeIn>

        <FadeIn delay={100}>
          <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No bookings found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b: any) => (
                      <TableRow key={b.bookingId || b.id} hover>
                        <TableCell>{b.learnerName || `Learner #${b.learnerId}`}</TableCell>
                        <TableCell>{b.bookingType}</TableCell>
                        <TableCell>{b.durationMinutes}min</TableCell>
                        <TableCell>
                          {b.bookingTime ? new Date(b.bookingTime).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={b.status} color={statusColor[b.status] || 'default'} />
                        </TableCell>
                        <TableCell>
                          {b.status === 'PENDING' && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button size="small" variant="contained" color="success" startIcon={<Check />}
                                onClick={() => handleAction(b.bookingId || b.id, 'CONFIRMED')} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                Confirm
                              </Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<Close />}
                                onClick={() => handleAction(b.bookingId || b.id, 'CANCELLED')} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {total > 10 && (
              <TablePagination component="div" count={total} page={page} rowsPerPage={10}
                onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
            )}
          </Paper>
        </FadeIn>
      </Box>
    </AnimatedPage>
  );
};

export default MentorBookings;
