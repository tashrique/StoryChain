const mongoose = require('mongoose');

const storyLineSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280 // Maximum line length (similar to a tweet)
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipHash: {
    type: String,
    required: true
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  isStarterText: {
    type: Boolean,
    default: false
  }
});

// Update the story's lastActivityAt when a new line is added
storyLineSchema.post('save', async function(doc) {
  try {
    await mongoose.model('Story').findByIdAndUpdate(doc.storyId, {
      lastActivityAt: new Date()
    });
  } catch (err) {
    console.error('Error updating story lastActivityAt:', err);
  }
});

module.exports = mongoose.model('StoryLine', storyLineSchema); 