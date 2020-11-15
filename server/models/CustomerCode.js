const moment = require('moment');

const mongoose = require('mongoose');

const CustomerCodeSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  code: { type: String, required: true },
  expiry: {
    type: Date,
    required: true,
    default: moment()
      .utc()
      .add(Number(process.env.CODE_EXPIRY_IN_MINUTES), 'minutes'),
  },
});

CustomerCodeSchema.index({ customerId: -1 });

module.exports = mongoose.model('CustomerCode', CustomerCodeSchema);
