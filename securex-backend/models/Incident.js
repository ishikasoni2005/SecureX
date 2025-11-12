const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'contained', 'resolved', 'closed'],
    default: 'new'
  },
  type: {
    type: String,
    required: true,
    enum: ['malware', 'data_breach', 'ddos', 'phishing', 'insider_threat', 'physical', 'other']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evidence: [String]
  }],
  affectedSystems: [{
    system: String,
    impact: String,
    status: String
  }],
  playbook: {
    type: String,
    enum: ['ransomware_response', 'data_breach_response', 'ddos_mitigation', 'phishing_response']
  },
  impact: {
    business: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    financial: Number,
    customers_affected: Number,
    downtime: Number
  },
  resolution: {
    summary: String,
    root_cause: String,
    lessons_learned: String,
    resolved_at: Date,
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    sla_breach: Boolean,
    compliance_impact: [String],
    tags: [String]
  }
}, {
  timestamps: true
});

// Generate incident ID before saving
incidentSchema.pre('save', async function(next) {
  if (!this.incidentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    this.incidentId = `INC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ status: 1, severity: -1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);