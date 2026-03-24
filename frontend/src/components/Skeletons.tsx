import React from 'react';
import { Box, Skeleton, Paper, Grid, useTheme } from '@mui/material';

/* ── Mentor Card Skeleton ──────────────────────────────────── */
export const MentorCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, textAlign: 'center' }}>
      <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="text" width="40%" sx={{ mx: 'auto', mb: 0.5 }} />
      <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 0.5 }} />
      <Skeleton variant="text" width="50%" sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="70%" sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="30%" sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="rounded" height={36} sx={{ borderRadius: 2 }} />
    </Paper>
  );
};

/* ── Video Card Skeleton ───────────────────────────────────── */
export const VideoCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
        </Box>
      </Box>
    </Paper>
  );
};

/* ── Live Video Card Skeleton ──────────────────────────────── */
export const LiveVideoCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={300} />
    </Paper>
  );
};

/* ── Chip Skeleton ─────────────────────────────────────────── */
export const ChipSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} variant="rounded" width={80 + Math.random() * 40} height={32} sx={{ borderRadius: 4 }} />
    ))}
  </Box>
);

/* ── Table Row Skeleton ────────────────────────────────────── */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 6 }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 1.5, px: 2, alignItems: 'center' }}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} variant="text" sx={{ flex: i === 0 ? 0.5 : 1 }} />
    ))}
  </Box>
);

/* ── Table Skeleton ────────────────────────────────────────── */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" sx={{ flex: i === 0 ? 0.5 : 1 }} height={24} />
          ))}
        </Box>
      </Box>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </Paper>
  );
};

/* ── Conversation List Item Skeleton ───────────────────────── */
export const ConversationSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, alignItems: 'center' }}>
    <Skeleton variant="circular" width={48} height={48} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="80%" height={16} />
    </Box>
    <Skeleton variant="text" width={40} height={14} />
  </Box>
);

/* ── Message Bubble Skeleton ───────────────────────────────── */
export const MessageBubbleSkeleton: React.FC<{ sent?: boolean }> = ({ sent = false }) => (
  <Box sx={{ display: 'flex', justifyContent: sent ? 'flex-end' : 'flex-start', mb: 1.5 }}>
    <Skeleton variant="rounded" width={`${30 + Math.random() * 30}%`} height={40 + Math.random() * 20} sx={{ borderRadius: 2 }} />
  </Box>
);

/* ── Profile Header Skeleton ───────────────────────────────── */
export const ProfileHeaderSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Skeleton variant="circular" width={100} height={100} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="25%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={60} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

/* ── Review Card Skeleton ──────────────────────────────────── */
export const ReviewCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
        <Skeleton variant="text" width={100} height={20} />
      </Box>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="85%" />
      <Skeleton variant="text" width="60%" />
    </Paper>
  );
};

/* ── Video Player Skeleton ─────────────────────────────────── */
export const VideoPlayerSkeleton: React.FC = () => (
  <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '16/9', borderRadius: 3 }} />
);

/* ── Stat Card Skeleton ────────────────────────────────────── */
export const StatCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="30%" height={36} />
    </Paper>
  );
};

/* ── Home Mentor Card Skeleton (horizontal scroll) ─────────── */
export const HomeMentorCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ minWidth: 200, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, textAlign: 'center' }}>
      <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 1.5 }} />
      <Skeleton variant="text" width="70%" sx={{ mx: 'auto' }} />
      <Skeleton variant="text" width="50%" sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="rounded" height={30} width="60%" sx={{ mx: 'auto', borderRadius: 2 }} />
    </Paper>
  );
};

/* ── Full Page Loading Skeleton Group ──────────────────────── */
export const MentorCardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
        <MentorCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const VideoCardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
        <VideoCardSkeleton />
      </Grid>
    ))}
  </Grid>
);
