const mongoose = require('mongoose');
const Ward = require('../models/Ward');
const Family = require('../models/Family');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../services/auditService');

// @desc Get comprehensive administrative ward report
// @route GET /api/reports/ward/:id
const getWardReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAll = id === 'ALL';
    let ward = null;

    if (!isAll) {
      ward = await Ward.findById(id);
      if (!ward) {
        return res.status(404).json({ success: false, message: 'Ward not found' });
      }
    } else {
      ward = {
        _id: 'ALL',
        wardCode: 'ALL',
        wardName: 'All Wards (Consolidated)',
        locality: 'Entire Constituency',
      };
    }

    const matchQuery = { isArchived: false };
    if (!isAll && mongoose.Types.ObjectId.isValid(id)) {
      matchQuery.wardId = new mongoose.Types.ObjectId(id);
    } else if (
      req.user.role !== 'superadmin' &&
      req.user.role !== 'auditor' &&
      req.user.assignedWards?.length
    ) {
      matchQuery.wardId = { $in: req.user.assignedWards.map((wId) => new mongoose.Types.ObjectId(wId)) };
    }

    // Totals
    const totalFamilies = await Family.countDocuments(matchQuery);
    const completeFamilies = await Family.countDocuments({ ...matchQuery, status: 'complete' });
    const incompleteFamilies = await Family.countDocuments({ ...matchQuery, status: 'incomplete' });

    const totalMembers = await Member.countDocuments(matchQuery);
    const voterEligibleMembers = await Member.countDocuments({ ...matchQuery, isVoterEligible: true });
    const incompleteMembers = await Member.countDocuments({ ...matchQuery, status: 'incomplete' });

    // Localities breakdown
    const localities = await Family.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $ifNull: ['$locality', 'Unspecified'] },
          familyCount: { $sum: 1 },
          memberCount: { $sum: '$memberCount' },
        },
      },
      { $sort: { familyCount: -1 } },
    ]);

    // Age group breakdown
    const ageDemographics = await Member.aggregate([
      { $match: { ...matchQuery, age: { $ne: null } } },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 45, 60, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    await logAudit({
      req,
      action: 'EXPORT',
      entityType: 'Report',
      entityId: isAll ? undefined : ward._id,
      wardId: isAll ? undefined : ward._id,
      details: { reportType: 'Ward Summary Report', wardCode: ward.wardCode },
    });

    res.json({
      success: true,
      data: {
        ward,
        generatedAt: new Date(),
        summary: {
          totalFamilies,
          completeFamilies,
          incompleteFamilies,
          totalMembers,
          voterEligibleMembers,
          incompleteMembers,
          completionRate: totalFamilies ? Math.round((completeFamilies / totalFamilies) * 100) : 0,
        },
        localities,
        ageDemographics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export ward members as CSV
// @route GET /api/reports/ward/:id/export-csv
const exportWardCsv = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAll = id === 'ALL';
    let ward = null;

    if (!isAll) {
      ward = await Ward.findById(id);
      if (!ward) {
        return res.status(404).json({ success: false, message: 'Ward not found' });
      }
    } else {
      ward = {
        _id: 'ALL',
        wardCode: 'ALL',
        wardName: 'All Wards (Consolidated)',
      };
    }

    const memberQuery = { isArchived: false };
    if (!isAll && mongoose.Types.ObjectId.isValid(id)) {
      memberQuery.wardId = new mongoose.Types.ObjectId(id);
    } else if (
      req.user.role !== 'superadmin' &&
      req.user.role !== 'auditor' &&
      req.user.assignedWards?.length
    ) {
      memberQuery.wardId = { $in: req.user.assignedWards.map((wId) => new mongoose.Types.ObjectId(wId)) };
    }

    const members = await Member.find(memberQuery)
      .populate('wardId', 'wardCode wardName')
      .populate('familyId', 'familyCode houseNo street locality contactPhone')
      .populate('politicalParty', 'partyCode partyName')
      .sort({ boothNo: 1, serialNo: 1, memberCode: 1 });

    let csvContent = 'Booth No,Booth Serial No,Voter ID,Full Name,Father/Husband Name,Gender,Age,Religion,Political Party,Door No,Relationship,Family Code,Locality,Contact Phone,Voter Eligible,Status\n';

    members.forEach((m) => {
      const fam = m.familyId || {};
      const party = m.politicalParty ? `${m.politicalParty.partyCode} - ${m.politicalParty.partyName}` : 'Independent / None';
      const row = [
        `"${m.boothNo || ''}"`,
        `"${m.serialNo || ''}"`,
        `"${m.voterId || ''}"`,
        `"${(m.fullName || '').replace(/"/g, '""')}"`,
        `"${(m.fatherOrHusbandName || '').replace(/"/g, '""')}"`,
        `"${m.gender || ''}"`,
        m.age ?? '',
        `"${m.religion || 'Unspecified'}"`,
        `"${party.replace(/"/g, '""')}"`,
        `"${(m.doorNo || fam.houseNo || '').replace(/"/g, '""')}"`,
        `"${m.relationship || ''}"`,
        `"${fam.familyCode || ''}"`,
        `"${(fam.locality || '').replace(/"/g, '""')}"`,
        `"${m.mobilePhone || fam.contactPhone || ''}"`,
        m.isVoterEligible ? 'Yes' : 'No',
        `"${m.status || ''}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    await logAudit({
      req,
      action: 'EXPORT',
      entityType: 'Member',
      entityId: ward._id,
      wardId: ward._id,
      details: { exportFormat: 'CSV', recordCount: members.length },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Ward_${ward.wardCode}_Members_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc Get audit logs
// @route GET /api/reports/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, entityType, action, wardId } = req.query;
    const query = {};

    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (wardId) query.wardId = wardId;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('wardId', 'wardCode wardName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWardReport,
  exportWardCsv,
  getAuditLogs,
};
