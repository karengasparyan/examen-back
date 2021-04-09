const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const events = new Schema({
  title: { type: String,  required: true, },
  description: { type: String,  required: true, },
  limit: { type: String,  required: true, },
  status: { type: String,  required: true, default: 'active'},
  image: { type: Array,  required: true, },
  date: { type: Date, default: Date.now },
  duration: {type: String, required: true,},
  members: { type: Array },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
}, { timestamps: true });

const eventsModel = mongoose.model('events', events);
module.exports = eventsModel;