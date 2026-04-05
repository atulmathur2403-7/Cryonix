import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Chip, Autocomplete, useTheme, Skeleton, Avatar,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { mentorApi, metaApi, userApi } from '../../services/api';
import { AnimatedPage, FadeIn, glassSx } from '../../components/animations';

const MentorProfileEdit: React.FC = () => {
  const theme = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [pronounOptions, setPronounOptions] = useState<string[]>([]);

  const [form, setForm] = useState({
    headline: '', about: '', callRate: '', messageRate: '',
    pronouns: '', youtubeChannelUrl: '', location: '',
    selectedLanguages: [] as string[],
    selectedTags: [] as string[],
  });

  useEffect(() => {
    Promise.allSettled([
      mentorApi.getProfile(),
      metaApi.searchLanguages('', 100),
      metaApi.searchTags('', 100),
      metaApi.getPronouns(),
    ]).then(([profRes, langRes, tagRes, pronRes]) => {
      if (profRes.status === 'fulfilled') {
        const p = profRes.value.data;
        setProfile(p);
        setForm({
          headline: p.headline || '',
          about: p.about || '',
          callRate: p.callRate?.toString() || '',
          messageRate: p.messageRate?.toString() || '',
          pronouns: p.pronouns || '',
          youtubeChannelUrl: p.youtubeChannelUrl || '',
          location: p.location || '',
          selectedLanguages: p.languages?.map((l: any) => l.name || l) || [],
          selectedTags: p.tags?.map((t: any) => t.name || t) || [],
        });
      }
      if (langRes.status === 'fulfilled') setLanguages(langRes.value.data || []);
      if (tagRes.status === 'fulfilled') setTags(tagRes.value.data || []);
      if (pronRes.status === 'fulfilled') setPronounOptions(pronRes.value.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await mentorApi.updateProfile({
        headline: form.headline,
        about: form.about,
        callRate: parseFloat(form.callRate) || 0,
        messageRate: parseFloat(form.messageRate) || 0,
        pronouns: form.pronouns,
        youtubeChannelUrl: form.youtubeChannelUrl,
        location: form.location,
        languageNames: form.selectedLanguages,
        tagNames: form.selectedTags,
      });
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <AnimatedPage>
        <Box>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 2, borderRadius: 3 }} />
        </Box>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Box>
        <FadeIn delay={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                Edit Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Update your mentor profile visible to learners
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </FadeIn>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FadeIn delay={100}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3, textAlign: 'center' }}>
                <Avatar
                  src={profile?.profilePhotoUrl}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, fontSize: 36 }}
                >
                  {profile?.name?.[0]}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{profile?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                {profile?.rating && (
                  <Chip label={`★ ${profile.rating.toFixed(1)}`} size="small" sx={{ mt: 1, fontWeight: 700 }} />
                )}
              </Paper>
            </FadeIn>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <FadeIn delay={200}>
              <Paper sx={{ ...glassSx(theme.palette.mode === 'dark'), p: 3, borderRadius: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Headline" value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      placeholder="e.g. Senior Java Developer | Spring Boot Expert" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline rows={4} label="About" value={form.about}
                      onChange={(e) => setForm({ ...form, about: e.target.value })}
                      placeholder="Tell learners about your experience and expertise" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Call Rate (₹/min)" type="number" value={form.callRate}
                      onChange={(e) => setForm({ ...form, callRate: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Message Rate (₹)" type="number" value={form.messageRate}
                      onChange={(e) => setForm({ ...form, messageRate: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth select label="Pronouns" value={form.pronouns}
                      onChange={(e) => setForm({ ...form, pronouns: e.target.value })}
                      SelectProps={{ native: true }}>
                      <option value="">Select pronouns</option>
                      {pronounOptions.map((p: any) => (
                        <option key={p.label || p} value={p.label || p}>{p.label || p}</option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Location" value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="YouTube Channel URL" value={form.youtubeChannelUrl}
                      onChange={(e) => setForm({ ...form, youtubeChannelUrl: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete multiple freeSolo options={tags.map((t: any) => t.name || t)}
                      value={form.selectedTags}
                      onChange={(_, v) => setForm({ ...form, selectedTags: v })}
                      renderInput={(params) => <TextField {...params} label="Skills / Tags" />}
                      renderTags={(value, getTagProps) =>
                        value.map((tag, i) => <Chip {...getTagProps({ index: i })} key={tag} label={tag} size="small" />)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete multiple freeSolo options={languages.map((l: any) => l.name || l)}
                      value={form.selectedLanguages}
                      onChange={(_, v) => setForm({ ...form, selectedLanguages: v })}
                      renderInput={(params) => <TextField {...params} label="Languages" />}
                      renderTags={(value, getTagProps) =>
                        value.map((lang, i) => <Chip {...getTagProps({ index: i })} key={lang} label={lang} size="small" />)
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            </FadeIn>
          </Grid>
        </Grid>
      </Box>
    </AnimatedPage>
  );
};

export default MentorProfileEdit;
