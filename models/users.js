const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const users = new Schema({
  first_name: { type: String,  required: true, },
  last_name: { type: String,  required: true, },
  email:  {type: String, unique: true,  required: true, },
  picture: { type: Array, },
  phone: { type: String,  required: true, },
  password: { type: String,  required: true, },
  age: { type: Number,  required: true, },
},{ timestamps: true });

const userModel = mongoose.model('users', users);
module.exports = userModel;