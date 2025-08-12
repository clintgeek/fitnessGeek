import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, Button, Chip, Divider, Paper, Stack, IconButton, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import medsService from '../services/medsService.js';

const TIME_OPTIONS = ['morning', 'afternoon', 'evening'];

function SuggestionChips({ suggestions, userTags, onChange }) {
  const selected = new Set(userTags || []);
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {(suggestions || []).map((tag) => (
        <Chip
          key={tag}
          label={tag}
          color={selected.has(tag) ? 'primary' : 'default'}
          variant={selected.has(tag) ? 'filled' : 'outlined'}
          onClick={() => {
            const next = new Set(selected);
            if (next.has(tag)) next.delete(tag); else next.add(tag);
            onChange(Array.from(next));
          }}
          sx={{ mb: 1 }}
        />
      ))}
    </Stack>
  );
}

export default function Medications() {
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [selectedStrength, setSelectedStrength] = useState(null);
  const [myMeds, setMyMeds] = useState([]);
  const [editingMed, setEditingMed] = useState(null);

  const [displayName, setDisplayName] = useState('');
  const [timesOfDay, setTimesOfDay] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    medsService.list().then(r => setMyMeds(r.data || [])).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!q) return;
    setSearching(true);
    try {
      const r = await medsService.search(q);
      setResults(r.data || []);
    } finally {
      setSearching(false);
    }
  };

  const selectCandidate = async (c) => {
    setSelected(c);
    setDisplayName(c?.name || '');
    const d = await medsService.getDetails(c.rxcui);
    setDetails(d.data || null);
    const suggested = d?.data?.suggested || [];
    setUserTags(suggested);
    setSelectedStrength(null);
    setEditingMed(null);
  };

  const buildPayload = () => ({
    display_name: displayName || selected?.name || q,
    is_supplement: false,
    rxcui: (selected?.rxcui || editingMed?.rxcui) || null,
    ingredient_name: details?.ingredient?.name || editingMed?.ingredient_name || null,
    strength: selectedStrength?.name || editingMed?.strength || null,
    times_of_day: timesOfDay,
    suggested_indications: details?.suggested || editingMed?.suggested_indications || [],
    user_indications: userTags,
  });

  const saveMedication = async () => {
    const payload = buildPayload();
    const r = await medsService.save(payload);
    setMyMeds((prev) => [r.data, ...prev.filter(m => m._id !== r.data._id)]);
    setSelected(null);
    setEditingMed(null);
  };

  const updateMedication = async () => {
    if (!editingMed) return;
    const payload = buildPayload();
    const r = await medsService.update(editingMed._id, payload);
    setMyMeds(prev => prev.map(m => (m._id === editingMed._id ? r.data : m)));
    setSelected(null);
    setEditingMed(null);
  };

  const startEdit = async (m) => {
    setEditingMed(m);
    setSelected(null);
    setDisplayName(m.display_name || '');
    setTimesOfDay(m.times_of_day || []);
    setUserTags(m.user_indications || []);
    setSelectedStrength(null);
    if (m.rxcui) {
      try {
        const d = await medsService.getDetails(m.rxcui);
        setDetails(d.data || { strengths: [] });
        const found = (d?.data?.strengths || []).find(s => s.name === m.strength);
        if (found) setSelectedStrength(found);
      } catch (_) {
        setDetails({ strengths: [] });
      }
    } else {
      setDetails({ strengths: [] });
    }
  };

  const removeMed = async (med) => {
    await medsService.remove(med._id);
    setMyMeds(prev => prev.filter(m => m._id !== med._id));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Medications & Supplements</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField fullWidth label="Search medication (brand or generic)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} disabled={searching}>Search</Button>
        </Stack>
        {results.length > 0 && (
          <Stack spacing={1} sx={{ mt: 2, maxHeight: 220, overflowY: 'auto' }}>
            {results.map((r, idx) => (
              <Paper key={`${r.rxcui}-${idx}`} sx={{ p: 1.5, cursor: 'pointer' }} onClick={() => selectCandidate(r)}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{r.name}</Typography>
                <Typography variant="caption" color="text.secondary">RxCUI {r.rxcui}</Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {(selected || editingMed) && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{editingMed ? 'Edit Medication' : 'Add Medication'}</Typography>
          <Stack spacing={2}>
            <TextField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            {Array.isArray(details?.strengths) && details.strengths.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="strength-label">Strength</InputLabel>
                <Select
                  labelId="strength-label"
                  label="Strength"
                  value={selectedStrength ? selectedStrength.rxcui : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = (details.strengths || []).find(s => s.rxcui === val);
                    setSelectedStrength(found || null);
                  }}
                >
                  {details.strengths.map(s => (
                    <MenuItem key={s.rxcui} value={s.rxcui}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Time of day</Typography>
              <ToggleButtonGroup
                value={timesOfDay}
                onChange={(e, v) => setTimesOfDay(v)}
                aria-label="time-of-day"
              >
                {TIME_OPTIONS.map(t => (
                  <ToggleButton key={t} value={t} aria-label={t}>{t}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {((details?.suggested?.length || 0) > 0) && (
              <Box>
                <Typography variant="caption" color="text.secondary">Suggested indications (editable)</Typography>
                <SuggestionChips suggestions={details.suggested} userTags={userTags} onChange={setUserTags} />
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">Your indications</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {(userTags || []).map(tag => (
                  <Chip key={tag} label={tag} onDelete={() => setUserTags((prev) => prev.filter(t => t !== tag))} />
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField size="small" label="Add tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const t = newTag.trim();
                    if (t && !userTags.includes(t)) setUserTags([...userTags, t]);
                    setNewTag('');
                  }
                }} />
                <Button variant="outlined" onClick={() => {
                  const t = newTag.trim();
                  if (t && !userTags.includes(t)) setUserTags([...userTags, t]);
                  setNewTag('');
                }}>Add</Button>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              {editingMed ? (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={updateMedication}>Update</Button>
              ) : (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={saveMedication}>Save</Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>My Medications (Grouped by Time)</Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack spacing={2}>
          {TIME_OPTIONS.map(slot => (
            <Box key={slot}>
              <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{slot}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {myMeds.filter(m => (m.times_of_day || []).includes(slot)).map(m => (
                  <Paper key={m._id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{m.display_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.strength || ''}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {(m.user_indications||[]).join(', ')}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton sx={{ mr: 1 }} color="primary" onClick={() => startEdit(m)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => removeMed(m)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
                {myMeds.filter(m => (m.times_of_day || []).includes(slot)).length === 0 && (
                  <Typography variant="caption" color="text.secondary">No medications set for {slot}.</Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>


    </Box>
  );
}


