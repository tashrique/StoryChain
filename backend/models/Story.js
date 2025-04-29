const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  starterText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update lastActivityAt when the story is modified
storySchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

module.exports = mongoose.model('Story', storySchema); 