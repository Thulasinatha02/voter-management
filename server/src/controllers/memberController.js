const mongoose = require('mongoose');
const { z } = require('zod');
const Member = require('../models/Member');
const Family = require('../models/Family');
const Ward = require('../models/Ward');
const { logAudit } = require('../services/auditService');

const memberCreateSchema = z.object({
  familyId: z.string().min(1, 'Family reference is required'),
  wardId: z.string().min(1, 'Ward reference is required'),
  boothNo: z.string().optional().default(''),
  serialNo: z.string().optional().default(''),
  voterId: z.string().optional().default(''),
  fatherOrHusbandName: z.string().optional().default(''),
  doorNo: z.string().optional().default(''),
  fullName: z.string().min(1, 'Full name is required').trim(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().default('unspecified'),
  age: z.coerce.number().min(0).max(130).optional(),
  dateOfBirth: z.string().optional().nullable(),
  religion: z.string().optional().default('Unspecified'),
  politicalParty: z.string().optional().nullable(),
  relationship: z.string().default('head'),
  mobilePhone: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().optional().default(''),
  education: z.string().optional().default(''),
  status: z.enum(['complete', 'incomplete']).default('complete'),
  residenceStatus: z.enum(['in', 'out']).default('in'),
  foreignCountry: z.string().optional().default(''),
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
      residenceStatus,
      voterEligible,
      religion,
      politicalParty,
      boothNo,
      page = 1,
      limit = 10,
      isArchived = 'false',
    } = req.query;

    const query = { isArchived: isArchived === 'true' };

    if (wardId && wardId !== 'ALL' && mongoose.Types.ObjectId.isValid(wardId)) {
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
    if (residenceStatus) query.residenceStatus = residenceStatus;
    if (religion) query.religion = religion;
    if (boothNo) query.boothNo = { $regex: boothNo, $options: 'i' };
    if (politicalParty) {
      if (politicalParty === 'none') {
        query.politicalParty = null;
      } else {
        query.politicalParty = politicalParty;
      }
    }
    if (voterEligible !== undefined) query.isVoterEligible = voterEligible === 'true';

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { memberCode: { $regex: search, $options: 'i' } },
        { voterId: { $regex: search, $options: 'i' } },
        { serialNo: { $regex: search, $options: 'i' } },
        { boothNo: { $regex: search, $options: 'i' } },
        { fatherOrHusbandName: { $regex: search, $options: 'i' } },
        { mobilePhone: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 5), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    // Execute count and paginated query in parallel for maximum throughput
    const [total, members] = await Promise.all([
      Member.countDocuments(query),
      Member.find(query)
        .select(
          'memberCode familyId wardId boothNo serialNo voterId fatherOrHusbandName doorNo fullName gender age dateOfBirth religion politicalParty relationship mobilePhone email occupation education status residenceStatus foreignCountry isVoterEligible createdAt'
        )
        .populate('wardId', 'wardCode wardName locality')
        .populate('familyId', 'familyCode houseNo street locality headOfFamilyName contactPhone')
        .populate('politicalParty', 'partyCode partyName abbreviation')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
    ]);

    res.json({
      success: true,
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit) || 1,
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
      .populate('familyId', 'familyCode houseNo street locality headOfFamilyName')
      .populate('politicalParty', 'partyCode partyName');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Check duplicate serialNo in ward or duplicate voterId globally
// @route GET /api/members/check-duplicate
const checkDuplicateMember = async (req, res, next) => {
  try {
    const { voterId, serialNo, wardId, excludeMemberId } = req.query;
    const result = {
      voterIdDuplicate: null,
      serialNoDuplicate: null,
    };

    // Check Voter ID duplicate across all active records
    if (voterId && voterId.trim()) {
      const vQuery = {
        voterId: voterId.trim().toUpperCase(),
        isArchived: false,
      };
      if (excludeMemberId && mongoose.Types.ObjectId.isValid(excludeMemberId)) {
        vQuery._id = { $ne: excludeMemberId };
      }
      const existingVoter = await Member.findOne(vQuery)
        .populate('wardId', 'wardCode wardName')
        .populate('familyId', 'familyCode headOfFamilyName');
      if (existingVoter) {
        result.voterIdDuplicate = {
          fullName: existingVoter.fullName,
          wardCode: existingVoter.wardId?.wardCode || '',
          familyCode: existingVoter.familyId?.familyCode || '',
          headOfFamilyName: existingVoter.familyId?.headOfFamilyName || '',
        };
      }
    }

    // Check Serial No duplicate within the specific ward
    if (serialNo && serialNo.trim() && wardId && mongoose.Types.ObjectId.isValid(wardId)) {
      const sQuery = {
        wardId,
        serialNo: serialNo.trim(),
        isArchived: false,
      };
      if (excludeMemberId && mongoose.Types.ObjectId.isValid(excludeMemberId)) {
        sQuery._id = { $ne: excludeMemberId };
      }
      const existingSerial = await Member.findOne(sQuery);
      if (existingSerial) {
        result.serialNoDuplicate = {
          fullName: existingSerial.fullName,
          serialNo: existingSerial.serialNo,
        };
      }
    }

    res.json({
      success: true,
      data: result,
    });
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

    const {
      familyId,
      wardId,
      boothNo,
      serialNo,
      voterId,
      fatherOrHusbandName,
      doorNo,
      fullName,
      gender,
      age,
      dateOfBirth,
      religion,
      politicalParty,
      relationship,
      mobilePhone,
      email,
      occupation,
      education,
      status,
    } = parsed.data;

    const trimmedSerial = serialNo ? serialNo.trim() : '';
    const trimmedVoterId = voterId ? voterId.trim().toUpperCase() : '';

    // 1. Verify Serial No uniqueness within this ward
    if (trimmedSerial) {
      const existingSerial = await Member.findOne({
        wardId,
        serialNo: trimmedSerial,
        isArchived: false,
      });
      if (existingSerial) {
        return res.status(400).json({
          success: false,
          message: `Serial Number "${trimmedSerial}" is already assigned to ${existingSerial.fullName} in this ward.`,
        });
      }
    }

    // 2. Verify Voter ID uniqueness
    if (trimmedVoterId) {
      const existingVoter = await Member.findOne({
        voterId: trimmedVoterId,
        isArchived: false,
      });
      if (existingVoter) {
        return res.status(400).json({
          success: false,
          message: `Voter ID "${trimmedVoterId}" is already registered to ${existingVoter.fullName}.`,
        });
      }
    }

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
      boothNo: boothNo ? boothNo.trim() : '',
      serialNo: trimmedSerial,
      voterId: trimmedVoterId,
      fatherOrHusbandName: fatherOrHusbandName || '',
      doorNo: doorNo || family.houseNo,
      fullName,
      gender,
      age,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      religion: religion || 'Unspecified',
      politicalParty: politicalParty && mongoose.Types.ObjectId.isValid(politicalParty) ? politicalParty : null,
      relationship,
      mobilePhone,
      email,
      occupation,
      education,
      status,
      residenceStatus: parsed.data.residenceStatus || 'in',
      foreignCountry: parsed.data.residenceStatus === 'out' ? (parsed.data.foreignCountry || '').trim() : '',
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

    const targetWardId = req.body.wardId || member.wardId;
    const targetSerial = req.body.serialNo !== undefined ? req.body.serialNo.trim() : member.serialNo;
    const targetVoterId = req.body.voterId !== undefined ? req.body.voterId.trim().toUpperCase() : member.voterId;

    // Check serial number uniqueness if changed or set
    if (targetSerial) {
      const existingSerial = await Member.findOne({
        _id: { $ne: member._id },
        wardId: targetWardId,
        serialNo: targetSerial,
        isArchived: false,
      });
      if (existingSerial) {
        return res.status(400).json({
          success: false,
          message: `Serial Number "${targetSerial}" is already assigned to ${existingSerial.fullName} in this ward.`,
        });
      }
    }

    // Check voter ID uniqueness if changed or set
    if (targetVoterId) {
      const existingVoter = await Member.findOne({
        _id: { $ne: member._id },
        voterId: targetVoterId,
        isArchived: false,
      });
      if (existingVoter) {
        return res.status(400).json({
          success: false,
          message: `Voter ID "${targetVoterId}" is already registered to ${existingVoter.fullName}.`,
        });
      }
    }

    const updateData = { ...req.body, updatedBy: req.user._id };
    if (updateData.age !== undefined) {
      updateData.isVoterEligible = Number(updateData.age) >= 18;
    }
    if (updateData.voterId) {
      updateData.voterId = updateData.voterId.toUpperCase();
    }
    if (updateData.politicalParty === '' || updateData.politicalParty === 'none') {
      updateData.politicalParty = null;
    }

    const updated = await Member.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('wardId', 'wardCode wardName')
      .populate('politicalParty', 'partyCode partyName');

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

// @desc Delete member permanently
// @route DELETE /api/members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const familyId = member.familyId;
    const wardId = member.wardId;
    const memberCode = member.memberCode;
    const fullName = member.fullName;

    await Member.findByIdAndDelete(req.params.id);

    // Adjust family count if not archived
    if (!member.isArchived) {
      await Family.findByIdAndUpdate(familyId, {
        $inc: { memberCount: -1 },
      });
    }

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'Member',
      entityId: req.params.id,
      wardId: wardId,
      details: { memberCode, fullName },
    });

    res.json({
      success: true,
      message: 'Member deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  checkDuplicateMember,
  createMember,
  updateMember,
  toggleArchiveMember,
  deleteMember,
};
