const express = require('express');
const {
  getThreats,
  getThreat,
  createThreat,
  updateThreat,
  deleteThreat,
  getThreatStats,
  getThreatTimeline,
  analyzeThreat,
  updateThreatStatus,
  getThreatFeed, // ✅ newly added controller
} = require('../controllers/threats');

const { protect, hasPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * ==========================================
 *  Threats API Routes
 *  Base URL: /api/v1/threats
 * ==========================================
 */

/**
 * @route   GET /api/v1/threats
 * @desc    Get all threats
 * @access  Private
 */
router
  .route('/')
  .get(protect, hasPermission('read'), getThreats)
  .post(protect, hasPermission('write'), createThreat);

/**
 * @route   GET /api/v1/threats/feed
 * @desc    Get recent threat feed (for dashboard live feed)
 * @access  Private
 */
router
  .route('/feed')
  .get(protect, hasPermission('read'), getThreatFeed);

/**
 * @route   GET /api/v1/threats/stats
 * @desc    Get threat statistics
 * @access  Private
 */
router
  .route('/stats')
  .get(protect, hasPermission('read'), getThreatStats);

/**
 * @route   GET /api/v1/threats/timeline
 * @desc    Get chronological threat data
 * @access  Private
 */
router
  .route('/timeline')
  .get(protect, hasPermission('read'), getThreatTimeline);

/**
 * @route   POST /api/v1/threats/:id/analyze
 * @desc    Analyze a specific threat
 * @access  Private
 */
router
  .route('/:id/analyze')
  .post(protect, hasPermission('write'), analyzeThreat);

/**
 * @route   PUT /api/v1/threats/:id/status
 * @desc    Update threat status (e.g., resolved, investigating)
 * @access  Private
 */
router
  .route('/:id/status')
  .put(protect, hasPermission('write'), updateThreatStatus);

/**
 * @route   GET /api/v1/threats/:id
 * @desc    Get a single threat
 * @access  Private
 *
 * @route   PUT /api/v1/threats/:id
 * @desc    Update a threat
 * @access  Private
 *
 * @route   DELETE /api/v1/threats/:id
 * @desc    Delete a threat
 * @access  Private
 */
router
  .route('/:id')
  .get(protect, hasPermission('read'), getThreat)
  .put(protect, hasPermission('write'), updateThreat)
  .delete(protect, hasPermission('delete'), deleteThreat);

module.exports = router;
