const express = require('express');
const router = express.Router();
const ProgressPhoto = require('../models/ProgressPhoto');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all progress photos for the authenticated user
router.get('/', async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({ user: req.user.userId })
      .sort({ date: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a new progress photo
router.post('/', async (req, res) => {
  try {
    console.log('Received progress photo data:', req.body);
    const { imageUrl, caption } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    
    // Create the new photo object
    const newPhoto = new ProgressPhoto({
      user: req.user.userId,
      imageUrl,
      caption: caption || `Progress photo from ${new Date().toLocaleDateString()}`
    });
    
    // Save to database
    const photo = await newPhoto.save();
    console.log('Progress photo saved successfully:', photo._id);
    
    // Return the saved photo
    res.json(photo);
  } catch (error) {
    console.error('Error saving progress photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a progress photo
router.put('/:id/like', async (req, res) => {
  try {
    const photo = await ProgressPhoto.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Check if photo has already been liked by this user
    const likeIndex = photo.likes.findIndex(
      like => like.user.toString() === req.user.userId
    );
    
    if (likeIndex !== -1) {
      // Unlike photo
      photo.likes.splice(likeIndex, 1);
    } else {
      // Like photo
      photo.likes.push({ user: req.user.userId });
    }
    
    await photo.save();
    res.json({ likes: photo.likes });
  } catch (error) {
    console.error('Error liking photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a progress photo
router.delete('/:id', async (req, res) => {
  try {
    const photo = await ProgressPhoto.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Check if user owns this photo
    if (photo.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this photo' });
    }
    
    await ProgressPhoto.deleteOne({ _id: req.params.id });
    res.json({ message: 'Photo removed' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 