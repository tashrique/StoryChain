require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const Filter = require('bad-words');

const Story = require('./models/Story');
const StoryLine = require('./models/StoryLine');

const app = express();
const port = process.env.PORT || 3001;
const filter = new Filter();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper function to hash IP addresses
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

// Helper function to create URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim();
};

// Helper function to count sentences
const countSentences = (text) => {
  // This regex matches sentence endings: periods, exclamation marks, or question marks
  // followed by spaces or end of string, but ignores common abbreviations and numbers
  return (text.match(/[.!?](?:\s|$)(?!(?:[a-z]|[A-Z]){1,2}\.)/g) || []).length;
};

// Rate limiting middleware - 1 submission per minute per IP
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 request per window
  message: { error: 'Please wait one minute before adding another line' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes

// Get all stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find({ isActive: true })
      .select('title slug description lastActivityAt')
      .sort('-lastActivityAt');
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Create a new story
app.post('/api/stories', async (req, res) => {
  try {
    const { title, description, starterText } = req.body;

    // Validate input
    if (!title || !description || !starterText) {
      return res.status(400).json({ error: 'Title, description, and starter text are required' });
    }

    // Validate starter text sentences
    const sentenceCount = countSentences(starterText);
    if (sentenceCount < 1 || sentenceCount > 3) {
      return res.status(400).json({ error: 'Starter text must contain 1-3 sentences' });
    }

    // Create slug from title
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await Story.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the story
    const story = new Story({
      title: filter.clean(title.trim()),
      description: filter.clean(description.trim()),
      starterText: filter.clean(starterText.trim()),
      slug
    });

    await story.save();

    // Add starter text as first story line
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const starterLine = new StoryLine({
      text: story.starterText,
      storyId: story._id,
      ipHash: hashIP(ip),
      isStarterText: true
    });

    await starterLine.save();

    res.status(201).json({ story, starterLine });
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Get a specific story by slug with its lines
app.get('/api/stories/:slug', async (req, res) => {
  try {
    const story = await Story.findOne({ slug: req.params.slug, isActive: true });
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const storyLines = await StoryLine.find({ storyId: story._id })
      .sort('timestamp');

    res.json({ story, lines: storyLines });
  } catch (err) {
    console.error('Error fetching story:', err);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Add a new line to a story
app.post('/api/stories/:slug/lines', submitLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    const story = await Story.findOne({ slug: req.params.slug, isActive: true });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 280) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 280 characters' });
    }

    // Validate sentence count
    const sentenceCount = countSentences(text);
    if (sentenceCount < 1 || sentenceCount > 2) {
      return res.status(400).json({ error: 'Your contribution must be 1-2 sentences' });
    }

    // Filter profanity
    const cleanText = filter.clean(text.trim());
    
    // Get client IP and hash it
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipHash = hashIP(ip);

    // Create and save the new story line
    const newLine = new StoryLine({
      text: cleanText,
      ipHash,
      storyId: story._id
    });
    
    await newLine.save();
    res.status(201).json({ success: true, line: newLine });
  } catch (err) {
    console.error('Error adding line:', err);
    res.status(500).json({ error: 'Failed to add line' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});