import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, useTheme, Skeleton, Button,
} from '@mui/material';
import { VideoCall } from '@mui/icons-material';
import { dashboardApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  COMPLETED: 'success', IN_PROGRESS: 'info', SCHEDULED: 'warning', CANCELLED: 'error',
};

const MentorSessions: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    dashboardApi.getMentorSessions(page, 10)
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
            View and manage all your mentoring sessions
          </Typography>
        </FadeIn>

        <FadeIn delay={100}>
          <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
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
                  ) : sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No sessions found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((s: any) => (
                      <TableRow key={s.sessionId} hover>
                        <TableCell>#{s.sessionId}</TableCell>
                        <TableCell>{s.learnerName || `Learner #${s.learnerId}`}</TableCell>
                        <TableCell>
                          {s.startTime ? new Date(s.startTime).toLocaleString() : 'Pending'}
                        </TableCell>
                        <TableCell>
                          {s.startTime && s.endTime
                            ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) + 'min'
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={s.status} color={statusColor[s.status] || 'default'} />
                        </TableCell>
                        <TableCell>
                          {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                            <Button size="small" variant="contained" startIcon={<VideoCall />}
                              onClick={() => navigate(`/call/${s.sessionId}`)}
                              sx={{ textTransform: 'none', borderRadius: 2 }}>
                              Join
                            </Button>
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

export default MentorSessions;
