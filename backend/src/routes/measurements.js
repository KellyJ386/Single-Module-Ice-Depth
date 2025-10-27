import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all measurements for a user and rink
router.get('/:rinkId', (req, res) => {
  try {
    const { rinkId } = req.params;
    const userId = req.user.id;

    const measurements = db.prepare(
      'SELECT * FROM measurements WHERE user_id = ? AND rink_id = ? ORDER BY point_id'
    ).all(userId, rinkId);

    res.json({
      success: true,
      measurements
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch measurements',
      error: error.message
    });
  }
});

// Save or update measurement
router.post(
  '/',
  [
    body('rinkId').notEmpty(),
    body('pointId').notEmpty(),
    body('depth').isFloat({ min: 0 })
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { rinkId, pointId, depth, notes } = req.body;
      const userId = req.user.id;

      // Check if measurement exists
      const existing = db.prepare(
        'SELECT id FROM measurements WHERE user_id = ? AND rink_id = ? AND point_id = ?'
      ).get(userId, rinkId, pointId);

      let measurement;

      if (existing) {
        // Update existing measurement
        db.prepare(
          'UPDATE measurements SET depth = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(depth, notes || null, existing.id);

        measurement = db.prepare('SELECT * FROM measurements WHERE id = ?').get(existing.id);

        // Add to history
        db.prepare(
          'INSERT INTO measurement_history (user_id, rink_id, point_id, depth, notes) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, rinkId, pointId, depth, notes || null);
      } else {
        // Insert new measurement
        const result = db.prepare(
          'INSERT INTO measurements (user_id, rink_id, point_id, depth, notes) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, rinkId, pointId, depth, notes || null);

        measurement = db.prepare('SELECT * FROM measurements WHERE id = ?').get(result.lastInsertRowid);

        // Add to history
        db.prepare(
          'INSERT INTO measurement_history (user_id, rink_id, point_id, depth, notes) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, rinkId, pointId, depth, notes || null);
      }

      res.json({
        success: true,
        message: existing ? 'Measurement updated' : 'Measurement created',
        measurement
      });
    } catch (error) {
      console.error('Save measurement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save measurement',
        error: error.message
      });
    }
  }
);

// Delete measurement
router.delete('/:rinkId/:pointId', (req, res) => {
  try {
    const { rinkId, pointId } = req.params;
    const userId = req.user.id;

    const result = db.prepare(
      'DELETE FROM measurements WHERE user_id = ? AND rink_id = ? AND point_id = ?'
    ).run(userId, rinkId, pointId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    res.json({
      success: true,
      message: 'Measurement deleted'
    });
  } catch (error) {
    console.error('Delete measurement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete measurement',
      error: error.message
    });
  }
});

// Get measurement history for a rink
router.get('/history/:rinkId', (req, res) => {
  try {
    const { rinkId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 100;

    const history = db.prepare(
      'SELECT * FROM measurement_history WHERE user_id = ? AND rink_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(userId, rinkId, limit);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
});

// Get analytics for a rink
router.get('/analytics/:rinkId', (req, res) => {
  try {
    const { rinkId } = req.params;
    const userId = req.user.id;

    // Get current measurements with statistics
    const measurements = db.prepare(
      'SELECT * FROM measurements WHERE user_id = ? AND rink_id = ?'
    ).all(userId, rinkId);

    const depths = measurements.map(m => m.depth);

    if (depths.length === 0) {
      return res.json({
        success: true,
        analytics: {
          totalMeasurements: 0,
          averageDepth: 0,
          minDepth: 0,
          maxDepth: 0,
          tooThin: 0,
          good: 0,
          acceptable: 0,
          tooThick: 0
        }
      });
    }

    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);

    // Count by status
    const tooThin = depths.filter(d => d < 1).length;
    const good = depths.filter(d => d >= 1 && d <= 1.75).length;
    const acceptable = depths.filter(d => d > 1.75 && d <= 2).length;
    const tooThick = depths.filter(d => d > 2 && d <= 5).length;

    // Get history count
    const historyCount = db.prepare(
      'SELECT COUNT(*) as count FROM measurement_history WHERE user_id = ? AND rink_id = ?'
    ).get(userId, rinkId).count;

    res.json({
      success: true,
      analytics: {
        totalMeasurements: measurements.length,
        averageDepth: parseFloat(avgDepth.toFixed(2)),
        minDepth: parseFloat(minDepth.toFixed(2)),
        maxDepth: parseFloat(maxDepth.toFixed(2)),
        tooThin,
        good,
        acceptable,
        tooThick,
        historyCount
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

export default router;
