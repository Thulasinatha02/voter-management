const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberCode: {
      type: String,
      required: [true, 'Member code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: [true, 'Family reference is required'],
      index: true,
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: [true, 'Ward reference is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      min: 0,
      max: 130,
    },
    relationship: {
      type: String,
      enum: [
        'head',
        'spouse',
        'son',
        'daughter',
        'father',
        'mother',
        'brother',
        'sister',
        'grandfather',
        'grandmother',
        'grandson',
        'granddaughter',
        'other',
      ],
      default: 'head',
    },
    mobilePhone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'complete',
      index: true,
    },
    isVoterEligible: {
      type: Boolean,
      default: function () {
        return this.age >= 18;
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.index({ wardId: 1, familyId: 1, isArchived: 1 });
memberSchema.index({ fullName: 'text', memberCode: 'text' });

module.exports = mongoose.model('Member', memberSchema);
