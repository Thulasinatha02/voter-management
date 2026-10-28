const { z } = require('zod');
const Member = require('../models/Member');
const Family = require('../models/Family');
const Ward = require('../models/Ward');
const { logAudit } = require('../services/auditService');

const memberCreateSchema = z.object({
  familyId: z.string().min(1, 'Family reference is required'),
  wardId: z.string().min(1, 'Ward reference is required'),
  fullName: z.string().min(1, 'Full name is required').trim(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().default('unspecified'),
  age: z.coerce.number().min(0).max(130).optional(),
  dateOfBirth: z.string().optional().nullable(),
  relationship: z.string().default('head'),
  mobilePhone: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().optional().default(''),
  education: z.string().optional().default(''),
  status: z.enum(['complete', 'incomplete']).default('complete'),
});

// @desc List members with search and ward filtering
// @route GET /api/members
const getMembers = async (req, res, next) => {
  try {
    const {
      wardId,
      familyId,
      search,
      gender,
      relationship,
      status,
      voterEligible,
      page = 1,
      limit = 10,
      isArchived = 'false',
    } = req.query;

    const query = { isArchived: isArchived === 'true' };

    if (wardId) {
      query.wardId = wardId;
    } else if (
      req.user.role !== 'superadmin' &&
      req.user.role !== 'auditor' &&
      req.user.assignedWards?.length
    ) {
      query.wardId = { $in: req.user.assignedWards };
    }

    if (familyId) query.familyId = familyId;
    if (gender) query.gender = gender;
    if (relationship) query.relationship = relationship;
    if (status) query.status = status;
    if (voterEligible !== undefined) query.isVoterEligible = voterEligible === 'true';

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { memberCode: { $regex: search, $options: 'i' } },
        { mobilePhone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('wardId', 'wardCode wardName locality')
      .populate('familyId', 'familyCode houseNo street locality headOfFamilyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get member by id
// @route GET /api/members/:id
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('wardId', 'wardCode wardName locality')
      .populate('familyId', 'familyCode houseNo street locality headOfFamilyName');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Add single member
// @route POST /api/members
const createMember = async (req, res, next) => {
  try {
    const parsed = memberCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const { familyId, wardId, fullName, gender, age, dateOfBirth, relationship, mobilePhone, email, occupation, education, status } = parsed.data;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Associated Family not found' });
    }

    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Associated Ward not found' });
    }

    const currentCount = await Member.countDocuments({ familyId });
    const memberCode = `MEM-${ward.wardCode}-${Date.now().toString().slice(-4)}-${currentCount + 1}`;

    const member = await Member.create({
      memberCode,
      familyId,
      wardId,
      fullName,
      gender,
      age,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      relationship,
      mobilePhone,
      email,
      occupation,
      education,
      status,
      isVoterEligible: age ? age >= 18 : true,
      createdBy: req.user._id,
    });

    // Update family member count
    await Family.findByIdAndUpdate(familyId, { $inc: { memberCount: 1 } });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Member',
      entityId: member._id,
      wardId: member.wardId,
      details: { memberCode: member.memberCode, fullName: member.fullName },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Update member
// @route PATCH /api/members/:id
const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const updateData = { ...req.body, updatedBy: req.user._id };
    if (updateData.age !== undefined) {
      updateData.isVoterEligible = Number(updateData.age) >= 18;
    }

    const updated = await Member.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('wardId', 'wardCode wardName');

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Member',
      entityId: updated._id,
      wardId: updated.wardId?._id || updated.wardId,
      details: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Archive / Restore member
// @route PATCH /api/members/:id/archive
const toggleArchiveMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.isArchived = !member.isArchived;
    await member.save();

    // Adjust family count
    await Family.findByIdAndUpdate(member.familyId, {
      $inc: { memberCount: member.isArchived ? -1 : 1 },
    });

    await logAudit({
      req,
      action: member.isArchived ? 'ARCHIVE' : 'RESTORE',
      entityType: 'Member',
      entityId: member._id,
      wardId: member.wardId,
    });

    res.json({
      success: true,
      message: `Member ${member.isArchived ? 'archived' : 'restored'} successfully`,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleArchiveMember,
};
