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
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secure_ward_management_jwt_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
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
    data: user,
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

    const { username, password, fullName, email, role, assignedWards } = parsed.data;

    const existing = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      fullName,
      email: email.toLowerCase(),
      role,
      assignedWards: assignedWards || [],
    });

    await logAudit({
      req,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      details: { username: user.username, role: user.role },
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

module.exports = {
  login,
  getMe,
  createUser,
  listUsers,
};
