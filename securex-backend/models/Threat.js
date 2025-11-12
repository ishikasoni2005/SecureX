const mongoose = require('mongoose');

/**
 * Threat Schema
 * Represents a detected cybersecurity threat in the system.
 */
const threatSchema = new mongoose.Schema(
  {
    // === Basic Info ===
    title: {
      type: String,
      required: [true, 'Please add a threat title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a threat description'],
    },
    type: {
      type: String,
      enum: [
        'malware',
        'phishing',
        'ddos',
        'brute_force',
        'sql_injection',
        'zero_day',
        'insider_threat',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'investigating', 'contained', 'resolved', 'false_positive'],
      default: 'new',
    },

    // === Source Details ===
    source: {
      ip: { type: String },
      country: { type: String },
      isp: { type: String },
      asn: { type: String },
    },

    // === Target Details ===
    target: {
      system: { type: String },
      ip: { type: String },
      port: { type: Number },
      protocol: { type: String },
    },

    // === Indicators of Compromise ===
    indicators: {
      ioc: [String],
      signatures: [String],
      behavior: [String],
    },

    // === Impact Assessment ===
    impact: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      systemsAffected: [String],
      dataCompromised: { type: Boolean },
      downtime: { type: Number }, // in minutes
    },

    // === Detection Metadata ===
    detection: {
      method: { type: String },
      sensor: { type: String },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      detectedAt: { type: Date, default: Date.now },
    },

    // === Response Actions ===
    response: {
      actions: [
        {
          action: String,
          timestamp: { type: Date, default: Date.now },
          user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
          },
          result: String,
        },
      ],
      playbook: { type: String },
      timeToDetect: { type: Number }, // in minutes
      timeToRespond: { type: Number }, // in minutes
    },

    // === Relationships ===
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ['log', 'file', 'network', 'memory'],
        },
        path: String,
        description: String,
        hash: String,
      },
    ],
    tags: [String],
    relatedIncidents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Threat',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * 🔍 Indexes for optimized queries
 */
threatSchema.index({ severity: 1, status: 1 });
threatSchema.index({ createdAt: -1 });
threatSchema.index({ 'source.ip': 1 });
threatSchema.index({ title: 'text', description: 'text', tags: 'text' }); // for search features

/**
 * 📊 Static method: Get aggregated threat statistics
 */
threatSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        recent: {
          $sum: {
            $cond: [
              {
                $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return stats;
};

/**
 * ⚙️ Instance method: Update threat status
 */
threatSchema.methods.updateStatus = function (newStatus, userId) {
  this.status = newStatus;

  // Log status change in response actions
  this.response.actions.push({
    action: `Status changed to ${newStatus}`,
    timestamp: new Date(),
    user: userId,
    result: 'success',
  });

  return this.save();
};

module.exports = mongoose.model('Threat', threatSchema);
