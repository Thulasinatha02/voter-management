const mongoose = require('mongoose');
const Ward = require('../models/Ward');
const Family = require('../models/Family');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');

// @desc Get real-time summary statistics for a selected ward (or all authorized wards)
// @route GET /api/dashboard/summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const { wardId } = req.query;

    const wardMatch = { isArchived: false };
    if (wardId && mongoose.Types.ObjectId.isValid(wardId)) {
      wardMatch.wardId = new mongoose.Types.ObjectId(wardId);
    } else if (
      req.user.role !== 'superadmin' &&
      req.user.role !== 'auditor' &&
      req.user.assignedWards?.length
    ) {
      wardMatch.wardId = { $in: req.user.assignedWards.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    // Ward info if single ward chosen
    let wardInfo = null;
    if (wardId && mongoose.Types.ObjectId.isValid(wardId)) {
      wardInfo = await Ward.findById(wardId).select('wardCode wardName locality district zone totalPopulationEstimate');
    }

    // 1. Total families & Completion Breakdown
    const familyStats = await Family.aggregate([
      { $match: wardMatch },
      {
        $group: {
          _id: null,
          totalFamilies: { $sum: 1 },
          completedFamilies: {
            $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] },
          },
          incompleteFamilies: {
            $sum: { $cond: [{ $eq: ['$status', 'incomplete'] }, 1, 0] },
          },
          avgFamilySize: { $avg: '$memberCount' },
        },
      },
    ]);

    const familySummary = familyStats[0] || {
      totalFamilies: 0,
      completedFamilies: 0,
      incompleteFamilies: 0,
      avgFamilySize: 0,
    };

    // 2. Member Statistics Breakdown (Voter eligibility, genders, completion)
    const memberStats = await Member.aggregate([
      { $match: wardMatch },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          eligibleVoters: {
            $sum: { $cond: [{ $eq: ['$isVoterEligible', true] }, 1, 0] },
          },
          minors: {
            $sum: { $cond: [{ $eq: ['$isVoterEligible', false] }, 1, 0] },
          },
          maleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] },
          },
          femaleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] },
          },
          otherCount: {
            $sum: { $cond: [{ $in: ['$gender', ['other', 'unspecified']] }, 1, 0] },
          },
          completedMembers: {
            $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] },
          },
        },
      },
    ]);

    const memberSummary = memberStats[0] || {
      totalMembers: 0,
      eligibleVoters: 0,
      minors: 0,
      maleCount: 0,
      femaleCount: 0,
      otherCount: 0,
      completedMembers: 0,
    };

    // 3. Locality distribution in this ward
    const localityStats = await Family.aggregate([
      { $match: wardMatch },
      {
        $group: {
          _id: { $ifNull: ['$locality', 'Unspecified Locality'] },
          families: { $sum: 1 },
          members: { $sum: '$memberCount' },
        },
      },
      { $sort: { families: -1 } },
      { $limit: 8 },
    ]);

    // 4. Registration trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendStats = await Member.aggregate([
      {
        $match: {
          ...wardMatch,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5. Recent Administrative Activity
    const auditQuery = {};
    if (wardMatch.wardId) {
      auditQuery.$or = [{ wardId: wardMatch.wardId }, { wardId: { $exists: false } }];
    }

    const recentActivity = await AuditLog.find(auditQuery)
      .populate('userId', 'username fullName role')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        ward: wardInfo,
        totals: {
          families: familySummary.totalFamilies,
          members: memberSummary.totalMembers,
          completeFamilies: familySummary.completedFamilies,
          incompleteFamilies: familySummary.incompleteFamilies,
          eligibleVoters: memberSummary.eligibleVoters,
          minors: memberSummary.minors,
          avgFamilySize: Math.round((familySummary.avgFamilySize || 0) * 10) / 10,
          completionRate: familySummary.totalFamilies
            ? Math.round((familySummary.completedFamilies / familySummary.totalFamilies) * 100)
            : 0,
        },
        genderDistribution: {
          male: memberSummary.maleCount,
          female: memberSummary.femaleCount,
          other: memberSummary.otherCount,
        },
        localityStats: localityStats.map((item) => ({
          locality: item._id || 'Main Area',
          families: item.families,
          members: item.members,
        })),
        trends: trendStats.map((item) => ({
          date: item._id,
          registrations: item.count,
        })),
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
