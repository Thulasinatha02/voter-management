const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    action: {
      type: String, // CREATE, UPDATE, DELETE, ARCHIVE, LOGIN, EXPORT
      required: true,
      index: true,
    },
    entityType: {
      type: String, // Ward, Family, Member, User, Report
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ wardId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
