const mongoose = require('mongoose');

const partySchema = new mongoose.Schema(
  {
    partyName: {
      type: String,
      required: [true, 'Party name is required'],
      unique: true,
      trim: true,
    },
    partyCode: {
      type: String,
      required: [true, 'Party code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

partySchema.index({ partyCode: 1, isArchived: 1 });

module.exports = mongoose.model('Party', partySchema);
