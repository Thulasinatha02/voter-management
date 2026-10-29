const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  req,
  action,
  entityType,
  entityId = '',
  wardId = null,
  details = {},
}) => {
  try {
    if (!req || !req.user) return;

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action,
      entityType,
      entityId: String(entityId),
      wardId: wardId || (req.body && req.body.wardId) || (req.query && req.query.wardId) || null,
      details,
      ipAddress: req.ip || req.headers?.['x-forwarded-for'] || '',
      userAgent: req.headers?.['user-agent'] || '',
    });
  } catch (error) {
    console.error('[Audit Log Error]:', error.message);
  }
};

module.exports = { logAudit };
