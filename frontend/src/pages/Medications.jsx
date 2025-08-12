import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Chip, Divider, Paper, Stack, IconButton, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import medsService from '../services/medsService.js';

const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'bedtime'];

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
  const [medType, setMedType] = useState('rx');
  const [currentDaysSupply, setCurrentDaysSupply] = useState('');

  const editorRef = useRef(null);
  const nameInputRef = useRef(null);

  const scrollToEditorFocus = () => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (nameInputRef.current) {
        try { nameInputRef.current.focus(); } catch (_) {}
      }
    }, 0);
  };

  const computeRemainingAndRunout = (m) => {
    const start = m.supply_start_date ? new Date(m.supply_start_date) : null;
    const days = m.days_supply || null;
    if (!start || !days) return { remaining: null, runout: null };
    const today = new Date();
    const elapsed = Math.max(0, Math.floor((today - start) / (1000*60*60*24)));
    const remaining = Math.max(0, days - elapsed);
    const runout = new Date(start.getTime() + days * 24*60*60*1000);
    return { remaining, runout: runout.toISOString().slice(0,10) };
  };

  const buildExportText = () => {
    const order = { rx: 0, otc: 1, supplement: 2 };
    const lines = [];
    lines.push('Medications & Supplements');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    TIME_OPTIONS.forEach(slot => {
      const slotMeds = (myMeds || [])
        .filter(m => (m.times_of_day || []).includes(slot))
        .sort((a, b) => {
          const tA = (a.med_type || 'rx');
          const tB = (b.med_type || 'rx');
          if (order[tA] !== order[tB]) return order[tA] - order[tB];
          return (a.display_name || '').localeCompare(b.display_name || '');
        });
      if (slotMeds.length === 0) return;
      lines.push(`${slot.toUpperCase()}`);
      slotMeds.forEach(m => {
        const type = (m.med_type || 'rx').toUpperCase();
        const strength = m.strength ? ` ${m.strength}` : '';
        const tags = (m.user_indications || []).join(', ');
        const { remaining, runout } = computeRemainingAndRunout(m);
        const supply = remaining != null ? ` | ${remaining} days left${runout ? ` (run-out ${runout})` : ''}` : '';
        lines.push(`- ${m.display_name}${strength} [${type}]${tags ? ` | Indications: ${tags}` : ''}${supply}`);
      });
      lines.push('');
    });
    return lines.join('\n');
  };

  const handleCopyExport = async () => {
    const text = buildExportText();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      // no-op
    }
  };

  const handleDownloadExport = () => {
    const text = buildExportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medications_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleDownloadPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const page = { w: 612, h: 792 };
    const margin = 40;
    let y = margin;

    const order = { rx: 0, otc: 1, supplement: 2 };
    const bySlot = TIME_OPTIONS.map(slot => ({
      slot,
      meds: (myMeds || [])
        .filter(m => (m.times_of_day || []).includes(slot))
        .sort((a, b) => {
          const tA = (a.med_type || 'rx');
          const tB = (b.med_type || 'rx');
          if (order[tA] !== order[tB]) return order[tA] - order[tB];
          return (a.display_name || '').localeCompare(b.display_name || '');
        })
    })).filter(s => s.meds.length > 0);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Medications & Supplements', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y + 16);
    y += 36;

    // Legend
    const legend = [
      { label: 'RX = Prescription', color: '#263238' },
      { label: 'OTC = Over-the-counter', color: '#263238' },
      { label: 'SUPPLEMENT', color: '#263238' },
    ];
    legend.forEach((l, i) => {
      doc.setFontSize(10);
      doc.text(l.label, margin + i * 170, y);
    });
    y += 16;

    const drawSectionHeader = (title) => {
      // Gray band with section title
      doc.setFillColor('#ECEFF1');
      doc.rect(margin, y, page.w - margin * 2, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title.toUpperCase(), margin + 8, y + 15);
      y += 26;
    };

    const columns = [
      { key: 'name', title: 'Name', width: 240 },
      { key: 'type', title: 'Type', width: 80 },
      { key: 'ind', title: 'Indications', width: 150 },
      { key: 'days', title: 'Days Left', width: 60 },
    ];

    const drawTableHeader = () => {
      doc.setFillColor('#F5F5F5');
      doc.rect(margin, y, page.w - margin * 2, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      let x = margin + 8;
      columns.forEach(col => {
        doc.text(col.title, x, y + 14);
        x += col.width;
      });
      y += 26;
    };

    const ensureRoom = (needed = 26) => {
      if (y + needed > page.h - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const drawRow = (row, idx) => {
      const rowHeight = 18 * Math.max(
        1,
        ...columns.map(col => doc.splitTextToSize(row[col.key] || '', col.width - 8).length)
      );
      ensureRoom(rowHeight + 6);
      // alternate row fill
      if (idx % 2 === 0) {
        doc.setFillColor('#FAFAFA');
        doc.rect(margin, y - 4, page.w - margin * 2, rowHeight + 8, 'F');
      }
      let x = margin + 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      columns.forEach(col => {
        const text = doc.splitTextToSize(row[col.key] || '', col.width - 8);
        doc.text(text, x, y);
        x += col.width;
      });
      y += rowHeight + 6;
    };

    bySlot.forEach(section => {
      ensureRoom(60);
      drawSectionHeader(section.slot);
      drawTableHeader();
      const rows = section.meds.map(m => {
        const { remaining } = computeRemainingAndRunout(m) || {};
        return {
          name: m.display_name || '',
          type: (m.med_type || 'rx').toUpperCase(),
          ind: (m.user_indications || []).join(', '),
          days: remaining != null ? String(remaining) : '',
        };
      });
      rows.forEach((r, idx) => drawRow(r, idx));
      y += 6;
    });

    // Footer page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, page.w - margin - 80, page.h - margin / 2);
    }

    doc.save(`medications_${new Date().toISOString().slice(0,10)}.pdf`);
  };

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
    try {
      const d = await medsService.getDetails(c.rxcui);
      setDetails(d.data || { strengths: [], suggested: [] });
      const suggested = d?.data?.suggested || [];
      setUserTags(suggested);
    } catch (_) {
      setDetails({ strengths: [], suggested: [] });
    }
    setSelectedStrength(null);
    setEditingMed(null);
    scrollToEditorFocus();
  };

  const buildPayload = () => ({
    display_name: displayName || selected?.name || q,
    is_supplement: false,
    med_type: medType,
    rxcui: (selected?.rxcui || editingMed?.rxcui) || null,
    ingredient_name: details?.ingredient?.name || editingMed?.ingredient_name || null,
    strength: selectedStrength?.name || editingMed?.strength || null,
    times_of_day: timesOfDay,
    suggested_indications: details?.suggested || editingMed?.suggested_indications || [],
    user_indications: userTags,
    supply_start_date: currentDaysSupply ? new Date().toISOString().slice(0,10) : null,
    days_supply: currentDaysSupply ? Number(currentDaysSupply) : null,
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

  const cancelEdit = () => {
    setSelected(null);
    setEditingMed(null);
    setDisplayName('');
    setTimesOfDay([]);
    setUserTags([]);
    setSelectedStrength(null);
    setDetails(null);
    setMedType('rx');
    setCurrentDaysSupply('');
  };

  const startEdit = async (m) => {
    setEditingMed(m);
    setSelected(null);
    setDisplayName(m.display_name || '');
    setTimesOfDay(m.times_of_day || []);
    setUserTags(m.user_indications || []);
    setMedType(m.med_type || 'rx');
    // Prefill current days supply as remaining (days_supply - elapsed)
    if (m.supply_start_date && m.days_supply) {
      const start = new Date(m.supply_start_date);
      const today = new Date();
      const elapsed = Math.max(0, Math.floor((today - start) / (1000*60*60*24)));
      const remaining = Math.max(0, Number(m.days_supply) - elapsed);
      setCurrentDaysSupply(String(remaining));
    } else {
      setCurrentDaysSupply('');
    }
    setSelectedStrength(null);
    if (m.rxcui) {
      try {
        const d = await medsService.getDetails(m.rxcui);
        setDetails(d.data || { strengths: [], suggested: [] });
        const found = (d?.data?.strengths || []).find(s => s.name === m.strength);
        if (found) setSelectedStrength(found);
      } catch (_) {
        setDetails({ strengths: [], suggested: [] });
      }
    } else {
      setDetails({ strengths: [], suggested: [] });
    }
    scrollToEditorFocus();
  };

  const removeMed = async (med) => {
    await medsService.remove(med._id);
    setMyMeds(prev => prev.filter(m => m._id !== med._id));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mr: 'auto' }}>Medications & Supplements</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={handleCopyExport}>Copy text</Button>
          <Button size="small" variant="outlined" onClick={handleDownloadExport}>Download .txt</Button>
          <Button size="small" variant="outlined" onClick={handleDownloadPdf}>Download PDF</Button>
        </Stack>
      </Box>

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
        <Paper ref={editorRef} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{editingMed ? 'Edit Medication' : 'Add Medication'}</Typography>
          <Stack spacing={2}>
            <TextField inputRef={nameInputRef} label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
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
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select labelId="type-label" label="Type" value={medType} onChange={(e) => setMedType(e.target.value)}>
                <MenuItem value="rx">Rx (Prescription)</MenuItem>
                <MenuItem value="otc">OTC (Over-the-counter)</MenuItem>
                <MenuItem value="supplement">Supplement</MenuItem>
              </Select>
            </FormControl>
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
            <TextField
              label="Current days supply"
              type="number"
              inputProps={{ min: 1, max: 3650 }}
              value={currentDaysSupply}
              onChange={(e) => setCurrentDaysSupply(e.target.value)}
            />

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
              <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>
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
                {myMeds
                  .filter(m => (m.times_of_day || []).includes(slot))
                  .sort((a, b) => {
                    const order = { rx: 0, otc: 1, supplement: 2 };
                    const tA = (a.med_type || 'rx');
                    const tB = (b.med_type || 'rx');
                    if (order[tA] !== order[tB]) return order[tA] - order[tB];
                    return (a.display_name || '').localeCompare(b.display_name || '');
                  })
                  .map(m => (
                  <Paper key={m._id} sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{m.display_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.strength || ''}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {(m.user_indications||[]).join(', ')}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip size="small" label={(m.med_type || 'rx').toUpperCase()} />
                        {(() => {
                          const start = m.supply_start_date ? new Date(m.supply_start_date) : null;
                          const days = m.days_supply || null;
                          if (start && days) {
                            const today = new Date();
                            const elapsed = Math.max(0, Math.floor((today - start) / (1000*60*60*24)));
                            const remaining = Math.max(0, days - elapsed);
                            let chipSx = { ml: 1 };
                            if (remaining > 30) {
                              chipSx = { ml: 1, bgcolor: '#C8E6C9', color: '#1B5E20' }; // green tint
                            } else if (remaining >= 15) {
                              chipSx = { ml: 1, bgcolor: '#FFF9C4', color: '#795548' }; // yellow tint
                            } else {
                              chipSx = { ml: 1, bgcolor: '#FFCDD2', color: '#B71C1C' }; // red tint
                            }
                            return <Chip size="small" sx={chipSx} label={`${remaining} days left`} />;
                          }
                          return null;
                        })()}
                      </Box>
                    </Box>
                    <Stack
                      direction={{ xs: 'column', sm: 'column', md: 'row' }}
                      spacing={{ xs: 0.5, md: 1 }}
                      sx={{ alignItems: { xs: 'flex-end', md: 'center' }, ml: 'auto', mr: '5px' }}
                    >
                      <IconButton size="small" color="primary" onClick={() => startEdit(m)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => removeMed(m)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
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


