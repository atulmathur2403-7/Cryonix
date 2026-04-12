import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Grid, TextField, useTheme, Skeleton, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from '@mui/material';
import { Add, Delete, CalendarMonth } from '@mui/icons-material';
import { availabilityApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const MentorAvailability: React.FC = () => {
  const theme = useTheme();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: '', startTime: '', endTime: '' });

  const fetchSlots = () => {
    setLoading(true);
    availabilityApi.getAll()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setSlots(data);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleCreate = async () => {
    try {
      await availabilityApi.create(newSlot);
      setDialogOpen(false);
      setNewSlot({ dayOfWeek: '', startTime: '', endTime: '' });
      fetchSlots();
    } catch {}
  };

  const handleDelete = async (slotId: string) => {
    try {
      await availabilityApi.delete(slotId);
      fetchSlots();
    } catch {}
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const dayColors: Record<string, string> = {
    MONDAY: '#FF6384', TUESDAY: '#36A2EB', WEDNESDAY: '#FFCE56', THURSDAY: '#4BC0C0',
    FRIDAY: '#9966FF', SATURDAY: '#FF9F40', SUNDAY: '#C9CBCF',
  };

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Availability
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Set your available time slots for learners to book
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Add Slot
            </Button>
          </Box>
        </FadeIn>

        <FadeIn delay={100}>
          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : slots.length === 0 ? (
            <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 6, textAlign: 'center', borderRadius: 3 }}>
              <CalendarMonth sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600}>No availability slots yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add your first availability slot to start receiving bookings
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}>
                Add Your First Slot
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {slots.map((slot: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={slot.id || slot.slotId}>
                  <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 2.5, borderRadius: 3, position: 'relative',
                    borderLeft: `4px solid ${dayColors[slot.dayOfWeek] || theme.palette.primary.main}` }}>
                    <IconButton size="small" onClick={() => handleDelete(slot.id || slot.slotId)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Delete fontSize="small" />
                    </IconButton>
                    <Chip label={slot.dayOfWeek} size="small"
                      sx={{ mb: 1.5, bgcolor: (dayColors[slot.dayOfWeek] || '#999') + '22', color: dayColors[slot.dayOfWeek] || '#999', fontWeight: 700 }} />
                    <Typography variant="h6" fontWeight={700}>
                      {slot.startTime} — {slot.endTime}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </FadeIn>

        {/* Create Slot Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Availability Slot</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <TextField select label="Day of Week" value={newSlot.dayOfWeek}
              onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
              SelectProps={{ native: true }}>
              <option value="">Select day</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </TextField>
            <TextField label="Start Time" type="time" value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }} />
            <TextField label="End Time" type="time" value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}
              disabled={!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime}
              sx={{ textTransform: 'none', borderRadius: 2 }}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AnimatedPage>
  );
};

export default MentorAvailability;
