import {Schema, model} from 'mongoose';

const events = new Schema({
  title: { type: String,  required: true, },
  description: { type: String,  required: true, },
  limit: { type: String,  required: true, },
  status: { type: String,  required: true, default: 'active'},
  image: { type: Array,  required: true, },
  date: { type: Date, default: Date.now },
  duration: {type: String, required: true,},
  address: {type: String, required: true,},
  members: { type: Array },
  distance: { type: String, default: null },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
},{collection:'events'},{ timestamps: true });

export default model('events', events);
