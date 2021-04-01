const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const events = new Schema({
  title: { type: String,  required: true, },
  description: { type: String,  required: true, },
  limit: { type: String,  required: true, },
  status: { type: String,  required: true, },
  image: { type: String,  required: true, },
  date: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
}, { timestamps: true });

const eventsModel = mongoose.model('events', events);
module.exports = eventsModel;