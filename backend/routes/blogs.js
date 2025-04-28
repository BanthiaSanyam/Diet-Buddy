const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth required)
// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ date: -1 })
      .limit(10);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({ featured: true })
      .sort({ date: -1 })
      .limit(5);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog by id
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blogs by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const blogs = await Blog.find({ tags: req.params.tag })
      .sort({ date: -1 })
      .limit(10);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs by tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes (admin only)
// Create blog
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, author, tags, imageUrl, featured } = req.body;
    
    // Basic validation
    if (!title || !summary || !content || !author) {
      return res.status(400).json({ message: 'Please include title, summary, content, and author' });
    }
    
    const newBlog = new Blog({
      title,
      summary,
      content,
      author,
      tags: tags || [],
      imageUrl,
      featured: featured || false
    });
    
    const blog = await newBlog.save();
    res.json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blog
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, author, tags, imageUrl, featured } = req.body;
    
    // Find and update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        summary,
        content,
        author,
        tags,
        imageUrl,
        featured
      },
      { new: true }
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    await blog.remove();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 