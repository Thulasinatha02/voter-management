const mongoose = require('mongoose');

const familySchema = new mongoose.Schema(
  {
    familyCode: {
      type: String,
      required: [true, 'Family code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: [true, 'Ward reference is required'],
      index: true,
    },
    headOfFamilyName: {
      type: String,
      required: [true, 'Head of family name is required'],
      trim: true,
    },
    familyLabel: {
      type: String,
      trim: true,
      default: '', // e.g. "Sharma Household"
    },
    houseNo: {
      type: String,
      required: [true, 'House number / Flat is required'],
      trim: true,
    },
    street: {
      type: String,
      trim: true,
      default: '',
    },
    locality: {
      type: String,
      trim: true,
      default: '',
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'incomplete',
      index: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
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

familySchema.index({ wardId: 1, isArchived: 1, status: 1 });
familySchema.index({ familyCode: 1, isArchived: 1 });

module.exports = mongoose.model('Family', familySchema);
