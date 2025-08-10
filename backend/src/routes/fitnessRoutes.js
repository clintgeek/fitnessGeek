const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const garmin = require('../services/garminConnectService');
const logger = require('../config/logger');

// secure all fitness endpoints
router.use(authenticateToken);

/**
 * @route GET /api/fitness/garmin/status
 * @desc Get Garmin connection status
 * @access Private
 */
router.get('/garmin/status', async (req, res) => {
  try {
    const status = await garmin.getStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Failed to get Garmin status', { userId: req.user.id, error: error.message });
    res.status(500).json({ success: false, error: { message: 'Failed to get Garmin status' } });
  }
});

/**
 * @route GET /api/fitness/garmin/heart-rate/:date?
 * @desc Get heart rate for a given date (defaults to today)
 * @access Private
 */
router.get('/garmin/heart-rate/:date?', async (req, res) => {
  try {
    const date = req.params.date; // optional YYYY-MM-DD
    const hr = await garmin.getHeartRate(req.user.id, date);
    // Normalize into series [{ time, bpm }]
    let series = [];
    if (hr && Array.isArray(hr?.heartRateValues)) {
      series = hr.heartRateValues.map(([ts, bpm]) => ({ time: ts, bpm })).filter(p => p.bpm != null);
    } else if (Array.isArray(hr)) {
      series = hr.map((p) => ({ time: p?.timestamp || p?.time, bpm: p?.bpm ?? p?.heartRate })).filter(p => p.bpm != null);
    }
    res.json({ success: true, data: { series, summary: hr } });
  } catch (error) {
    logger.error('Failed to get Garmin heart rate', { userId: req.user.id, error: error.message });
    const status = error.message === 'Garmin integration disabled' ? 400 : 500;
    res.status(status).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route GET /api/fitness/garmin/daily/:date?
 * @desc Get daily Garmin summary for a date
 * @access Private
 */
router.get('/garmin/daily/:date?', async (req, res) => {
  try {
    const date = req.params.date; // optional YYYY-MM-DD
    const daily = await garmin.getDaily(req.user.id, date);
    res.json({ success: true, data: daily });
  } catch (error) {
    logger.error('Failed to get Garmin daily', { userId: req.user.id, error: error.message });
    const status = error.message === 'Garmin integration disabled' ? 400 : 500;
    res.status(status).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route POST /api/fitness/garmin/weight
 * @desc Push a weight entry to Garmin
 * @body { date?: string(YYYY-MM-DD), weightLbs: number, timezone?: string }
 */
router.post('/garmin/weight', async (req, res) => {
  try {
    const { date, weightLbs, timezone } = req.body || {};
    if (!weightLbs || Number.isNaN(Number(weightLbs))) {
      return res.status(400).json({ success: false, error: { message: 'weightLbs is required' } });
    }
    await garmin.updateWeightToGarmin(req.user.id, date, Number(weightLbs), timezone);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to push weight to Garmin', { userId: req.user.id, error: error.message });
    const status = error.message === 'Garmin integration disabled' ? 400 : 500;
    res.status(status).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;