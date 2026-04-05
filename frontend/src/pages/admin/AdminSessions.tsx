import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, useTheme, Skeleton, Chip,
} from '@mui/material';
import { adminApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  COMPLETED: 'success', IN_PROGRESS: 'info', SCHEDULED: 'warning', CANCELLED: 'error',
};

const AdminSessions: React.FC = () => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi.getAllSessions(page, 20)
      .then((res) => {
        setSessions(res.data?.content || []);
        setTotal(res.data?.totalElements || 0);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 1 }}>
            Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            All mentoring sessions across the platform
          </Typography>
        </FadeIn>

        <FadeIn delay={100}>
          <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mentor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No sessions found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((s: any) => (
                      <TableRow key={s.sessionId || s.id} hover>
                        <TableCell>#{s.sessionId || s.id}</TableCell>
                        <TableCell>{s.mentorName || `Mentor #${s.mentorId}`}</TableCell>
                        <TableCell>{s.learnerName || `Learner #${s.learnerId}`}</TableCell>
                        <TableCell>
                          {s.startTime ? new Date(s.startTime).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          {s.startTime && s.endTime
                            ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) + 'min'
                            : s.durationMinutes ? s.durationMinutes + 'min' : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={s.status} color={statusColor[s.status] || 'default'} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {total > 20 && (
              <TablePagination component="div" count={total} page={page} rowsPerPage={20}
                onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]} />
            )}
          </Paper>
        </FadeIn>
      </Box>
    </AnimatedPage>
  );
};

export default AdminSessions;
