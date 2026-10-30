const mongoose = require('mongoose');
const { z } = require('zod');
const Family = require('../models/Family');
const Member = require('../models/Member');
const Ward = require('../models/Ward');
const { logAudit } = require('../services/auditService');

const memberSubSchema = z.object({
  boothNo: z.string().optional().default(''),
  serialNo: z.string().optional().default(''),
  fullName: z.string().min(1, 'Full name is required').trim(),
  voterId: z.string().optional().default(''),
  fatherOrHusbandName: z.string().optional().default(''),
  doorNo: z.string().optional().default(''),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().default('unspecified'),
  age: z.coerce.number().min(0).max(130).optional(),
  dateOfBirth: z.string().optional().nullable(),
  religion: z.string().optional().default('Unspecified'),
  politicalParty: z.string().optional().nullable(),
  relationship: z.string().default('head'),
  mobilePhone: z.string().optional().default(''),
  occupation: z.string().optional().default(''),
  education: z.string().optional().default(''),
  status: z.enum(['complete', 'incomplete']).default('complete'),
  residenceStatus: z.enum(['in', 'out']).default('in'),
  foreignCountry: z.string().optional().default(''),
});

const familySchema = z.object({
  wardId: z.string().min(1, 'Ward ID is required'),
  headOfFamilyName: z.string().min(1, 'Head of family name is required').trim(),
  familyLabel: z.string().optional().default(''),
  houseNo: z.string().min(1, 'House number is required').trim(),
  street: z.string().optional().default(''),
  locality: z.string().optional().default(''),
  landmark: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
  contactPhone: z.string().optional().default(''),
  status: z.enum(['complete', 'incomplete']).optional().default('complete'),
  notes: z.string().optional().default(''),
  members: z.array(memberSubSchema).optional().default([]),
});

// Helper to generate Family code
const generateFamilyCode = async (wardCode) => {
  const count = await Family.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FAM-${wardCode || 'GEN'}-${count + 1}-${randomSuffix}`;
};

// Helper to generate Member code
const generateMemberCode = async (famCode, index) => {
  const pad = String(index).padStart(2, '0');
  return `MEM-${famCode.slice(-8)}-${pad}`;
};

// @desc List families with filters & pagination
// @route GET /api/families
const getFamilies = async (req, res, next) => {
  try {
    const {
      wardId,
      search,
      status,
      locality,
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

    if (status) {
      query.status = status;
    }

    if (locality) {
      query.locality = { $regex: locality, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { familyCode: { $regex: search, $options: 'i' } },
        { headOfFamilyName: { $regex: search, $options: 'i' } },
        { houseNo: { $regex: search, $options: 'i' } },
        { street: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Family.countDocuments(query);
    const families = await Family.find(query)
      .populate('wardId', 'wardCode wardName locality')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: families,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single family and all its members
// @route GET /api/families/:id
const getFamilyById = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id).populate('wardId', 'wardCode wardName locality');
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const members = await Member.find({ familyId: family._id, isArchived: false })
      .populate('politicalParty', 'partyCode partyName')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        family,
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create family along with multiple members
// @route POST /api/families
const createFamily = async (req, res, next) => {
  try {
    const parsed = familySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const {
      wardId,
      headOfFamilyName,
      familyLabel,
      houseNo,
      street,
      locality,
      landmark,
      pincode,
      contactPhone,
      status,
      notes,
      members = [],
    } = parsed.data;

    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Referenced Ward does not exist.' });
    }

    const familyCode = await generateFamilyCode(ward.wardCode);

    // Create family
    const family = await Family.create({
      familyCode,
      wardId,
      headOfFamilyName,
      familyLabel: familyLabel || `${headOfFamilyName}'s Household`,
      houseNo,
      street,
      locality: locality || ward.locality,
      landmark,
      pincode,
      contactPhone,
      status: status || 'complete',
      memberCount: members.length,
      notes,
      createdBy: req.user._id,
    });

    // Create members if any
    let createdMembers = [];
    if (members.length > 0) {
      const memberDocs = members.map((m, idx) => ({
        memberCode: `MEM-${ward.wardCode}-${Date.now().toString().slice(-4)}-${idx + 1}`,
        familyId: family._id,
        wardId: family.wardId,
        boothNo: m.boothNo ? m.boothNo.trim() : '',
        serialNo: m.serialNo ? m.serialNo.trim() : '',
        fullName: m.fullName,
        voterId: m.voterId ? m.voterId.toUpperCase() : '',
        fatherOrHusbandName: m.fatherOrHusbandName || '',
        doorNo: m.doorNo || houseNo,
        gender: m.gender,
        age: m.age,
        dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth) : undefined,
        religion: m.religion || 'Unspecified',
        politicalParty: m.politicalParty && mongoose.Types.ObjectId.isValid(m.politicalParty) ? m.politicalParty : null,
        relationship: m.relationship || (idx === 0 ? 'head' : 'other'),
        mobilePhone: m.mobilePhone || contactPhone,
        occupation: m.occupation,
        education: m.education,
        status: m.status || 'complete',
        residenceStatus: m.residenceStatus || 'in',
        foreignCountry: m.residenceStatus === 'out' ? (m.foreignCountry || '').trim() : '',
        isVoterEligible: m.age ? m.age >= 18 : true,
        createdBy: req.user._id,
      }));

      createdMembers = await Member.insertMany(memberDocs);
    }

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'Family',
      entityId: family._id,
      wardId: family.wardId,
      details: {
        familyCode: family.familyCode,
        headOfFamilyName: family.headOfFamilyName,
        membersCount: createdMembers.length,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Family and members registered successfully.',
      data: {
        family,
        members: createdMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update family record
// @route PATCH /api/families/:id
const updateFamily = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const updated = await Family.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('wardId', 'wardCode wardName');

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'Family',
      entityId: updated._id,
      wardId: updated.wardId?._id || updated.wardId,
      details: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Archive / Restore family
// @route PATCH /api/families/:id/archive
const toggleArchiveFamily = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    family.isArchived = !family.isArchived;
    await family.save();

    // Also update all linked members
    await Member.updateMany({ familyId: family._id }, { isArchived: family.isArchived });

    await logAudit({
      req,
      action: family.isArchived ? 'ARCHIVE' : 'RESTORE',
      entityType: 'Family',
      entityId: family._id,
      wardId: family.wardId,
    });

    res.json({
      success: true,
      message: `Family ${family.isArchived ? 'archived' : 'restored'} successfully`,
      data: family,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  toggleArchiveFamily,
};
