import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, useTheme, Skeleton, Avatar, Chip, TextField, InputAdornment,
} from '@mui/material';
import { Search, Star } from '@mui/icons-material';
import { adminApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const AdminMentors: React.FC = () => {
  const theme = useTheme();
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi.getAllMentors(page, 20)
      .then((res) => {
        setMentors(res.data?.content || []);
        setTotal(res.data?.totalElements || 0);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = search
    ? mentors.filter((m: any) =>
        (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.headline || '').toLowerCase().includes(search.toLowerCase()))
    : mentors;

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Mentors
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View and manage all registered mentors
              </Typography>
            </Box>
            <TextField size="small" placeholder="Search mentors..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              }}
              sx={{ width: 260 }}
            />
          </Box>
        </FadeIn>

        <FadeIn delay={100}>
          <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Mentor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Headline</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Call Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sessions</TableCell>
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
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No mentors found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m: any) => (
                      <TableRow key={m.mentorId || m.userId || m.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={m.profilePhotoUrl} sx={{ width: 36, height: 36, fontSize: 14 }}>
                              {(m.name || 'M')[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{m.name || 'Unknown'}</Typography>
                              <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{m.headline || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          {m.rating ? (
                            <Chip icon={<Star sx={{ fontSize: 14 }} />} label={m.rating.toFixed(1)} size="small"
                              sx={{ fontWeight: 700 }} />
                          ) : '-'}
                        </TableCell>
                        <TableCell>₹{m.callRate ?? 0}/min</TableCell>
                        <TableCell>{m.totalSessions ?? 0}</TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined"
                            label={m.presence === 'LIVE' ? 'LIVE' : 'Offline'}
                            color={m.presence === 'LIVE' ? 'success' : 'default'} />
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

export default AdminMentors;
