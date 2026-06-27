const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // ← increased limit

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

const Page = require('./models/Page');
const { nanoid } = require('nanoid');

app.post('/api/pages', async (req, res) => {
  try {
    const slug = nanoid(8);
    const newPage = new Page({
      slug,
      template: req.body.template,
      data: req.body.data
    });
    await newPage.save();
    res.json({ success: true, slug });
  } catch (err) {
    console.log('POST ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/pages/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});