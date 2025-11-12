const Threat = require('../models/Threat'); // Ensure this model exists and is exported correctly

// @desc    Get all threats
// @route   GET /api/v1/threats
// @access  Private
exports.getThreats = async (req, res) => {
  try {
    const threats = await Threat.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: threats.length,
      data: threats,
    });
  } catch (error) {
    console.error('❌ Error fetching threats:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single threat by ID
// @route   GET /api/v1/threats/:id
// @access  Private
exports.getThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ success: false, error: 'Threat not found' });
    }
    res.status(200).json({ success: true, data: threat });
  } catch (error) {
    console.error('❌ Error fetching threat:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new threat
// @route   POST /api/v1/threats
// @access  Private
const { scoreEvent } = require('../utils/fraudModel');

exports.createThreat = async (req, res) => {
  try {
    const threat = await Threat.create(req.body);

    // Derive lightweight features for risk scoring
    const features = {
      type: threat.type,
      loginAttempts: req.body?.metadata?.loginAttempts,
      amount: req.body?.metadata?.amount
    };
    const baselines = req.body?.baselines || {};
    const riskScore = scoreEvent(features, baselines);
    const label = riskScore >= 0.85 ? 'critical' : riskScore >= 0.7 ? 'high' : riskScore >= 0.45 ? 'medium' : 'low';

    // Emit real-time alert for high risk
    if (req.io && (label === 'critical' || label === 'high')) {
      req.io.to('global').emit('threat_alert', {
        title: `High Risk Threat (${label})`,
        message: `${threat.type} - ${threat.description?.slice(0, 140)}`,
        severity: label,
        threatId: threat._id
      });
    }

    const payload = threat.toObject();
    payload.riskScore = riskScore;
    payload.riskLabel = label;

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    console.error('❌ Error creating threat:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update an existing threat
// @route   PUT /api/v1/threats/:id
// @access  Private
exports.updateThreat = async (req, res) => {
  try {
    const threat = await Threat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!threat) {
      return res.status(404).json({ success: false, error: 'Threat not found' });
    }
    res.status(200).json({ success: true, data: threat });
  } catch (error) {
    console.error('❌ Error updating threat:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a threat
// @route   DELETE /api/v1/threats/:id
// @access  Private
exports.deleteThreat = async (req, res) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);
    if (!threat) {
      return res.status(404).json({ success: false, error: 'Threat not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('❌ Error deleting threat:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get aggregated threat statistics (by severity)
// @route   GET /api/v1/threats/stats
// @access  Private
exports.getThreatStats = async (req, res) => {
  try {
    const stats = await Threat.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error fetching threat stats:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get timeline of threats (sorted by creation date)
// @route   GET /api/v1/threats/timeline
// @access  Private
exports.getThreatTimeline = async (req, res) => {
  try {
    const timeline = await Threat.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    console.error('❌ Error fetching timeline:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Analyze a specific threat (AI/ML placeholder)
// @route   POST /api/v1/threats/:id/analyze
// @access  Private
exports.analyzeThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ success: false, error: 'Threat not found' });
    }

    // Simulate a simple analysis
    const analysisResult = {
      confidence: 0.95,
      riskLevel: 'High',
      recommendedAction: 'Isolate affected system and perform security scan',
    };

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    console.error('❌ Error analyzing threat:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update the status of a threat
// @route   PUT /api/v1/threats/:id/status
// @access  Private
exports.updateThreatStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ success: false, error: 'Threat not found' });
    }

    threat.status = status || threat.status;
    await threat.save();

    res.status(200).json({ success: true, data: threat });
  } catch (error) {
    console.error('❌ Error updating threat status:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get recent threat feed (latest 10 threats)
// @route   GET /api/v1/threats/feed
// @access  Private
exports.getThreatFeed = async (req, res) => {
  try {
    const threats = await Threat.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name type severity detectedAt status');

    res.status(200).json({
      success: true,
      count: threats.length,
      data: threats,
    });
  } catch (error) {
    console.error('❌ Error fetching threat feed:', error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
