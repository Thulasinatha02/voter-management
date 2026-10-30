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
    boothNo: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    serialNo: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    voterId: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      index: true,
    },
    fatherOrHusbandName: {
      type: String,
      trim: true,
      default: '',
    },
    doorNo: {
      type: String,
      trim: true,
      default: '',
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
    religion: {
      type: String,
      enum: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other', 'Unspecified'],
      default: 'Unspecified',
      trim: true,
      index: true,
    },
    politicalParty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      default: null,
      index: true,
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
    residenceStatus: {
      type: String,
      enum: ['in', 'out'],
      default: 'in',
      index: true,
    },
    foreignCountry: {
      type: String,
      trim: true,
      default: '',
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
memberSchema.index({ wardId: 1, boothNo: 1, serialNo: 1 });
memberSchema.index({ fullName: 'text', memberCode: 'text', voterId: 'text' });
memberSchema.index({ politicalParty: 1, wardId: 1 });
memberSchema.index({ religion: 1, wardId: 1 });

module.exports = mongoose.model('Member', memberSchema);
