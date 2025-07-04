const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkedinData: {
    verified: { type: Boolean, default: false },
    profileUrl: String,
    connectionCount: Number,
    profileCreationDate: Date,
    scoreContribution: { type: Number, default: 0 }
  },
  professionalEmailData: {
    verified: { type: Boolean, default: false },
    email: String,
    domain: String,
    verificationDate: Date,
    scoreContribution: { type: Number, default: 0 }
  },
  governmentIdData: {
    verified: { type: Boolean, default: false },
    idType: String,
    verificationDate: Date,
    scoreContribution: { type: Number, default: 0 }
  },
  verificationScore: { type: Number, default: 0 },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    default: 'PENDING'
  },
  verificationDate: Date,
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Verification', VerificationSchema); 