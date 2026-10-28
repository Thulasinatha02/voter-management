const { z } = require('zod');
const Ward = require('../models/Ward');
const { logAudit } = require('../services/auditService');

const wardSchema = z.object({
  wardCode: z.string().min(1, 'Ward code is required').trim(),
  wardName: z.string().min(1, 'Ward name is required').trim(),
  locality: z.string().optional().default(''),
  district: z.string().optional().default(''),
  zone: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
  totalPopulationEstimate: z.number().nonnegative().optional().default(0),
});

// @desc Get authorized wards
// @route GET /api/wards
const getWards = async (req, res, next) => {
  try {
    const { search, isArchived = 'false' } = req.query;
    let query = { isArchived: isArchived === 'true' };

    // Ward restriction if not superadmin/auditor
    if (
      req.user.role !== 'superadmin' &&
      req.user.role !== 'auditor' &&
      req.user.assignedWards &&
      req.user.assignedWards.length > 0
    ) {
      query._id = { $in: req.user.assignedWards };
    }

    if (search) {
      query.$or = [
        { wardCode: { $regex: search, $options: 'i' } },
        { wardName: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    const wards = await Ward.find(query).sort({ wardCode: 1 });
    res.json({ success: true, count: wards.length, data: wards });
  } catch (error) {
    next(error);
  }
};

// @desc Get single ward by id
// @route GET /api/wards/:id
const getWardById = async (req, res, next) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }
    res.json({ success: true, data: ward });
  } catch (error) {
    next(error);
  }
};

// @desc Create new ward
// @route POST /api/wards
const createWard = async (req, res, next) => {
  try {
    const parsed = wardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const existing = await Ward.findOne({ wardCode: parsed.data.wardCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ward code already exists.' });
    }

    const ward = await Ward.create({
      ...parsed.data,
      wardCode: parsed.data.wardCode.toUpperCase(),
      createdBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Ward',
      entityId: ward._id,
      wardId: ward._id,
      details: { wardCode: ward.wardCode, wardName: ward.wardName },
    });

    res.status(201).json({ success: true, data: ward });
  } catch (error) {
    next(error);
  }
};

// @desc Update ward
// @route PATCH /api/wards/:id
const updateWard = async (req, res, next) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    const updated = await Ward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Ward',
      entityId: updated._id,
      wardId: updated._id,
      details: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Archive / Restore ward
// @route PATCH /api/wards/:id/archive
const toggleArchiveWard = async (req, res, next) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    ward.isArchived = !ward.isArchived;
    await ward.save();

    await logAudit({
      req,
      action: ward.isArchived ? 'ARCHIVE' : 'RESTORE',
      entityType: 'Ward',
      entityId: ward._id,
      wardId: ward._id,
    });

    res.json({ success: true, message: `Ward ${ward.isArchived ? 'archived' : 'restored'} successfully`, data: ward });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWards,
  getWardById,
  createWard,
  updateWard,
  toggleArchiveWard,
};
