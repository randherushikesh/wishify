const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ status: 'Wishify API is running' });
});

// ── Debug route: confirms Cloudinary env vars are actually loaded on Render ──
app.get('/api/debug/cloudinary', (req, res) => {
  res.json({
    cloud_name_set: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key_set: !!process.env.CLOUDINARY_API_KEY,
    api_secret_set: !!process.env.CLOUDINARY_API_SECRET
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const { BirthdayPage, WeddingPage } = require('./models/Page');

// Routes any template starting with "wedding" to the wedding collection,
// everything else (birthday-timeline, birthday-quiz, etc.) to birthday
function getModel(template) {
  return template && template.startsWith('wedding') ? WeddingPage : BirthdayPage;
}
const { nanoid } = require('nanoid');

// ── SAVE A PAGE ──
app.post('/api/pages', async (req, res) => {
  try {
    const slug = nanoid(8);
    const Model = getModel(req.body.template);
    const newPage = new Model({
      slug,
      template: req.body.template,
      data: req.body.data
    });
    await newPage.save();
    res.json({ success: true, slug });
  } catch (err) {
    console.log('POST /api/pages ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── FETCH A PAGE ──
app.get('/api/pages/:slug', async (req, res) => {
  try {
    let page = await BirthdayPage.findOne({ slug: req.params.slug });
    if (!page) page = await WeddingPage.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, page });
  } catch (err) {
    console.log('GET /api/pages/:slug ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});