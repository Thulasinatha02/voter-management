const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'ward_officer', 'data_operator', 'auditor'],
      default: 'data_operator',
    },
    // Wards this user has access to. If empty array and role is superadmin/auditor, has access to all.
    assignedWards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
      },
    ],
    // Granular Module Permission Flags
    permissions: {
      dashboard: { type: Boolean, default: true },
      familyManagement: { type: Boolean, default: true },
      memberManagement: { type: Boolean, default: true },
      wardManagement: { type: Boolean, default: false },
      partyManagement: { type: Boolean, default: false },
      wardReports: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      auditLogs: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
