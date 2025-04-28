const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get all posts - Public route
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protect all other community routes with authentication
router.use(authMiddleware);

// Upload image for post
router.post('/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Check if the image is base64 encoded
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    // Extract the base64 data
    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    
    // Generate a unique filename
    const filename = `${crypto.randomBytes(16).toString('hex')}.${imageType === 'jpeg' ? 'jpg' : imageType}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save the image
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    // Return the URL to the image
    const imageUrl = `/uploads/${filename}`;
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/posts', async (req, res) => {
  try {
    const { content, images } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const newPost = new Post({
      user: req.user.userId,
      content,
      images: images || []
    });
    
    const post = await newPost.save();
    
    // Add reward coins for posting
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        // Create reward if it doesn't exist
        if (!user.rewards) {
          user.rewards = { coins: 0 };
        }
        
        // Add 5 coins for posting
        user.rewards.coins += 5;
        await user.save();
      }
    } catch (rewardError) {
      console.error('Error updating rewards:', rewardError);
      // Continue even if reward update fails
    }
    
    res.json(await Post.findById(post._id).populate('user', 'name profileImage'));
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike post
router.put('/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has already been liked by this user
    const alreadyLiked = post.likes.includes(req.user.userId);
    
    if (alreadyLiked) {
      // Unlike post
      post.likes = post.likes.filter(like => like.toString() !== req.user.userId);
    } else {
      // Like post
      post.likes.push(req.user.userId);
    }
    
    await post.save();
    
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/posts/:id/comment', async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newComment = {
      user: req.user.userId,
      content,
      date: new Date(),
      parentCommentId: parentCommentId || null
    };
    
    post.comments.push(newComment);
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    // Add reward coins for commenting
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        // Create reward if it doesn't exist
        if (!user.rewards) {
          user.rewards = { coins: 0 };
        }
        
        // Add 2 coins for commenting
        user.rewards.coins += 2;
        await user.save();
      }
    } catch (rewardError) {
      console.error('Error updating rewards:', rewardError);
      // Continue even if reward update fails
    }
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is owner of post
    if (post.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }
    
    await post.remove();
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 