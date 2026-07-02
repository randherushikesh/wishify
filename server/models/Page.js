const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  template: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Same schema, two separate collections in Compass
const BirthdayPage = mongoose.model('BirthdayPage', pageSchema, 'birthdaypages');
const WeddingPage = mongoose.model('WeddingPage', pageSchema, 'weddingpages');

module.exports = { BirthdayPage, WeddingPage };