import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Grid, useTheme, Skeleton, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
} from '@mui/material';
import { Upload, Delete, VideoLibrary, PlayArrow } from '@mui/icons-material';
import { mentorShortsApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const MentorShorts: React.FC = () => {
  const theme = useTheme();
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchShorts = () => {
    setLoading(true);
    mentorShortsApi.getAll()
      .then((res) => setShorts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setShorts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShorts(); }, []);

  const handleUpload = async () => {
    if (!title) return;
    setUploading(true);
    try {
      const idempotencyKey = `short-${Date.now()}`;
      const res = await mentorShortsApi.reserve({ title }, idempotencyKey);
      const { uploadId, signedUrl } = res.data;

      if (fileRef.current?.files?.[0] && signedUrl) {
        await fetch(signedUrl, {
          method: 'PUT',
          body: fileRef.current.files[0],
          headers: { 'Content-Type': fileRef.current.files[0].type },
        });
        await mentorShortsApi.finalize(uploadId);
      }
      setDialogOpen(false);
      setTitle('');
      fetchShorts();
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (uploadId: string) => {
    try {
      await mentorShortsApi.delete(uploadId);
      fetchShorts();
    } catch {}
  };

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                My Shorts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Upload and manage short videos to attract learners
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Upload />} onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Upload Short
            </Button>
          </Box>
        </FadeIn>

        <FadeIn delay={100}>
          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : shorts.length === 0 ? (
            <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 6, textAlign: 'center', borderRadius: 3 }}>
              <VideoLibrary sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600}>No shorts uploaded yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your first short video to showcase your expertise
              </Typography>
              <Button variant="contained" startIcon={<Upload />} onClick={() => setDialogOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}>
                Upload Your First Short
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {shorts.map((s: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.uploadId || s.id}>
                  <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{ height: 180, bgcolor: 'grey.900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.thumbnailUrl ? (
                        <img src={s.thumbnailUrl} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <PlayArrow sx={{ fontSize: 48, color: 'grey.500' }} />
                      )}
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{s.title}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip size="small" label={s.status || 'UPLOADED'} color={s.status === 'ACTIVE' ? 'success' : 'default'} />
                        <IconButton size="small" onClick={() => handleDelete(s.uploadId || s.id)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </FadeIn>

        {/* Upload Dialog */}
        <Dialog open={dialogOpen} onClose={() => !uploading && setDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Upload Short</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your short a catchy title" />
            <Button variant="outlined" component="label" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Choose Video File
              <input ref={fileRef} type="file" accept="video/*" hidden />
            </Button>
            {uploading && <LinearProgress />}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={uploading} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpload} disabled={!title || uploading}
              sx={{ textTransform: 'none', borderRadius: 2 }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AnimatedPage>
  );
};

export default MentorShorts;
