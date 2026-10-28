const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema(
  {
    wardCode: {
      type: String,
      required: [true, 'Ward code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    wardName: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
    },
    locality: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    zone: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalPopulationEstimate: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

wardSchema.index({ wardCode: 1, isArchived: 1 });

module.exports = mongoose.model('Ward', wardSchema);
