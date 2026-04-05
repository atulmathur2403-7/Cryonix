import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, useTheme, Skeleton, Avatar, Chip, TextField, InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { adminApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const AdminUsers: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi.getAllMentors(page, 20)
      .then((res) => {
        setUsers(res.data?.content || []);
        setTotal(res.data?.totalElements || 0);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = search
    ? users.filter((u: any) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Users
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View and manage all registered users
              </Typography>
            </Box>
            <TextField size="small" placeholder="Search users..." value={search}
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
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u: any) => (
                      <TableRow key={u.userId || u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={u.profilePhotoUrl} sx={{ width: 36, height: 36, fontSize: 14 }}>
                              {(u.name || 'U')[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>{u.name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{u.email || '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={u.role || 'LEARNER'}
                            color={u.role === 'MENTOR' ? 'primary' : u.role === 'ADMIN' ? 'error' : 'default'} />
                        </TableCell>
                        <TableCell>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined"
                            label={u.active !== false ? 'Active' : 'Inactive'}
                            color={u.active !== false ? 'success' : 'default'} />
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

export default AdminUsers;
