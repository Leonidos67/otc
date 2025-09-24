const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true, index: true },
    takerId: { type: String, default: null, index: true },
    asset: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    terms: { type: String, default: '' },
    gifts: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, required: true },
            title: { type: String, required: true },
            img: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    payment: {
      transferredBy: { type: String, default: null },
      amount: { type: Number, default: null },
      at: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    confirmedBy: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

DealSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    creatorId: this.creatorId,
    takerId: this.takerId || undefined,
    asset: this.asset,
    amount: this.amount,
    terms: this.terms,
    gifts: this.gifts,
    payment: this.payment,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    confirmedBy: this.confirmedBy,
  };
};

module.exports = mongoose.model('Deal', DealSchema);


