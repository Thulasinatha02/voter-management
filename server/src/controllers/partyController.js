const { z } = require('zod');
const Party = require('../models/Party');
const { logAudit } = require('../services/auditService');

const partySchema = z.object({
  partyName: z.string().min(1, 'Party name is required').trim(),
  partyCode: z.string().min(1, 'Party code is required').trim(),
  description: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

// @desc Get political parties
// @route GET /api/parties
const getParties = async (req, res, next) => {
  try {
    const { search, isArchived = 'false', all } = req.query;
    let query = { isArchived: isArchived === 'true' };

    if (search) {
      query.$or = [
        { partyName: { $regex: search, $options: 'i' } },
        { partyCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (all !== 'true' && !req.query.isArchived) {
      query.isActive = true;
    }

    const parties = await Party.find(query).sort({ partyName: 1 });
    res.json({ success: true, count: parties.length, data: parties });
  } catch (error) {
    next(error);
  }
};

// @desc Get single party by id
// @route GET /api/parties/:id
const getPartyById = async (req, res, next) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }
    res.json({ success: true, data: party });
  } catch (error) {
    next(error);
  }
};

// @desc Create new party
// @route POST /api/parties
const createParty = async (req, res, next) => {
  try {
    const parsed = partySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const existingCode = await Party.findOne({ partyCode: parsed.data.partyCode.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Party code already exists.' });
    }

    const existingName = await Party.findOne({
      partyName: { $regex: `^${parsed.data.partyName}$`, $options: 'i' },
    });
    if (existingName) {
      return res.status(400).json({ success: false, message: 'Party name already exists.' });
    }

    const party = await Party.create({
      ...parsed.data,
      partyCode: parsed.data.partyCode.toUpperCase(),
      createdBy: req.user?._id,
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Party',
      entityId: party._id,
      details: { partyCode: party.partyCode, partyName: party.partyName },
    });

    res.status(201).json({ success: true, data: party });
  } catch (error) {
    next(error);
  }
};

// @desc Update party
// @route PATCH /api/parties/:id
const updateParty = async (req, res, next) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }

    const updateData = { ...req.body };
    if (updateData.partyCode) {
      updateData.partyCode = updateData.partyCode.toUpperCase();
    }

    const updated = await Party.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Party',
      entityId: updated._id,
      details: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Archive / Restore party
// @route PATCH /api/parties/:id/archive
const toggleArchiveParty = async (req, res, next) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }

    party.isArchived = !party.isArchived;
    await party.save();

    await logAudit({
      req,
      action: party.isArchived ? 'ARCHIVE' : 'RESTORE',
      entityType: 'Party',
      entityId: party._id,
      details: { partyCode: party.partyCode },
    });

    res.json({
      success: true,
      message: `Party ${party.isArchived ? 'archived' : 'restored'} successfully`,
      data: party,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  toggleArchiveParty,
};
