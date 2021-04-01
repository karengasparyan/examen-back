require("dotenv").config();
const Mongoose = require('mongoose');
const DB_URL = 'mongodb://localhost:27017/social_event';
Mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
Mongoose.connection.once("open", function() {
    console.log("MongoDB database connection established successfully");
});
Mongoose.connection.on('error', function(err) {
    if (err) throw err;
});

module.exports = {
    Mongoose,
    models: {
        users: require('./users.js'),
        events: require('./events.js'),
    }
};

