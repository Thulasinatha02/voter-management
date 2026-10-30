const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const { logAudit } = require('../services/auditService');

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['superadmin', 'ward_officer', 'data_operator', 'auditor']).default('data_operator'),
  assignedWards: z.array(z.string()).optional(),
  permissions: z.record(z.boolean()).optional(),
  isActive: z.boolean().optional(),
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secure_ward_management_jwt_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Default permission helper based on role
const getDefaultPermissions = (role) => {
  if (role === 'superadmin') {
    return {
      dashboard: true,
      familyManagement: true,
      memberManagement: true,
      wardManagement: true,
      partyManagement: true,
      wardReports: true,
      userManagement: true,
      auditLogs: true,
    };
  }
  if (role === 'ward_officer') {
    return {
      dashboard: true,
      familyManagement: true,
      memberManagement: true,
      wardManagement: false,
      partyManagement: false,
      wardReports: true,
      userManagement: false,
      auditLogs: false,
    };
  }
  if (role === 'auditor') {
    return {
      dashboard: true,
      familyManagement: true,
      memberManagement: true,
      wardManagement: false,
      partyManagement: false,
      wardReports: true,
      userManagement: false,
      auditLogs: true,
    };
  }
  // Field Data Operator default
  return {
    dashboard: true,
    familyManagement: true,
    memberManagement: true,
    wardManagement: false,
    partyManagement: false,
    wardReports: false,
    userManagement: false,
    auditLogs: false,
  };
};

// @desc Auth user & get token
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const { username, password } = parsed.data;
    const user = await User.findOne({ username: username.toLowerCase() }).populate('assignedWards');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    await logAudit({
      req: { ...req, user },
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role },
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        assignedWards: user.assignedWards,
        permissions: user.permissions || getDefaultPermissions(user.role),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedWards');
  res.json({
    success: true,
    data: {
      ...user.toJSON(),
      permissions: user.permissions || getDefaultPermissions(user.role),
    },
  });
};

// @desc Create new user (Superadmin only)
// @route POST /api/auth/users
const createUser = async (req, res, next) => {
  try {
    const parsed = registerUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const { username, password, fullName, email, role, assignedWards, permissions } = parsed.data;

    const existing = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mergedPermissions = permissions || getDefaultPermissions(role);

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      fullName,
      email: email.toLowerCase(),
      role,
      assignedWards: assignedWards || [],
      permissions: mergedPermissions,
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      details: { username: user.username, role: user.role, permissions: mergedPermissions },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc List users
// @route GET /api/auth/users
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('assignedWards').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc Update user (Superadmin only)
// @route PATCH /api/auth/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { fullName, email, role, assignedWards, permissions, password, isActive } = req.body;

    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (assignedWards !== undefined) user.assignedWards = assignedWards;
    if (permissions !== undefined) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();
    const updated = await User.findById(user._id).populate('assignedWards');

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      details: { username: user.username, role: user.role, permissions: user.permissions },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete user (Superadmin only)
// @route DELETE /api/auth/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Prevent self-deletion
    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own logged-in account.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure at least one active superadmin remains
    if (user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin', isActive: true });
      if (superadminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining superadmin.' });
      }
    }

    await User.findByIdAndDelete(targetUserId);

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'User',
      entityId: targetUserId,
      details: { username: user.username, role: user.role },
    });

    res.json({
      success: true,
      message: `User ${user.username} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Toggle user active status (Superadmin only)
// @route PATCH /api/auth/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot change your own account status.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      details: { username: user.username, isActive: user.isActive },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
