const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failed', 
      'user_created',
      'user_modified',
      'permission_changed',
      'threat_detected',
      'threat_blocked',
      'system_alert',
      'configuration_change',
      'data_access',
      'file_upload',
      'api_call'
    ]
  },
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info'
  },
  description: {
    type: String,
    required: true
  },
  source: {
    ip: String,
    userAgent: String,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    system: String
  },
  target: {
    resource: String,
    id: mongoose.Schema.Types.Mixed,
    type: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: Date
}, {
  timestamps: true
});

// Pre-save middleware to generate eventId
securityEventSchema.pre('save', function(next) {
  if (!this.eventId) {
    this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Index for efficient querying
securityEventSchema.index({ type: 1, createdAt: -1 });
securityEventSchema.index({ 'source.ip': 1 });
securityEventSchema.index({ 'source.userId': 1 });
securityEventSchema.index({ processed: 1 });

// Static method to get events by time range
securityEventSchema.statics.getEventsByTimeRange = async function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to get event statistics
securityEventSchema.statics.getEventStats = async function(hours = 24) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        bySeverity: {
          $push: {
            severity: '$severity',
            timestamp: '$createdAt'
          }
        }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        severityBreakdown: {
          critical: {
            $size: {
              $filter: {
                input: '$bySeverity',
                as: 'event',
                cond: { $eq: ['$$event.severity', 'critical'] }
              }
            }
          },
          high: {
            $size: {
              $filter: {
                input: '$bySeverity',
                as: 'event',
                cond: { $eq: ['$$event.severity', 'high'] }
              }
            }
          },
          medium: {
            $size: {
              $filter: {
                input: '$bySeverity',
                as: 'event',
                cond: { $eq: ['$$event.severity', 'medium'] }
              }
            }
          }
        }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('SecurityEvent', securityEventSchema);