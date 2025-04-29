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

app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://story-chain-bice.vercel.app',
      'https://story-chain-bice.vercel.app/',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ 
    message: 'StoryChain API is running',
    endpoints: {
      stories: '/api/stories',
      specificStory: '/api/stories/:slug',
      addStoryLine: '/api/stories/:slug/lines'
    }
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const countSentences = (text) => {
  return (text.match(/[.!?](?:\s|$)(?!(?:[a-z]|[A-Z]){1,2}\.)/g) || []).length;
};

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: 'Please wait one minute before adding another line' },
  standardHeaders: true,
  legacyHeaders: false,
});

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

app.post('/api/stories', async (req, res) => {
  try {
    const { title, description, starterText } = req.body;

    if (!title || !description || !starterText) {
      return res.status(400).json({ error: 'Title, description, and starter text are required' });
    }

    const sentenceCount = countSentences(starterText);
    if (sentenceCount < 1 || sentenceCount > 3) {
      return res.status(400).json({ error: 'Starter text must contain 1-3 sentences' });
    }

    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await Story.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const story = new Story({
      title: filter.clean(title.trim()),
      description: filter.clean(description.trim()),
      starterText: filter.clean(starterText.trim()),
      slug
    });

    await story.save();

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

app.post('/api/stories/:slug/lines', submitLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    const story = await Story.findOne({ slug: req.params.slug, isActive: true });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 280) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 280 characters' });
    }

    const sentenceCount = countSentences(text);
    if (sentenceCount < 1 || sentenceCount > 2) {
      return res.status(400).json({ error: 'Your contribution must be 1-2 sentences' });
    }

    const cleanText = filter.clean(text.trim());
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipHash = hashIP(ip);

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

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});