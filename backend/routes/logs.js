const express = require('express');
const router = express.Router();
const UserLog = require('../models/UserLog');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get paginated logs - Admin only
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters if provided
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.action) filter.action = req.query.action;
    
    // Date range filter
    if (req.query.startDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$lte = new Date(req.query.endDate);
    }

    // Get total count for pagination
    const total = await UserLog.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await UserLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');
    
    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics summary - Admin only
router.get('/analytics', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    // Date range filter
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Get counts by action type
    const actionCounts = await UserLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get daily activity counts
    const dailyActivity = await UserLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          count: 1
        }
      }
    ]);
    
    // Get top active users
    const topUsers = await UserLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate, $lte: endDate },
          user: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          'name': '$userDetails.name',
          'email': '$userDetails.email'
        }
      }
    ]);
    
    res.json({
      period: {
        startDate,
        endDate
      },
      actionCounts,
      dailyActivity,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logs for authenticated user
router.get('/my-activity', authMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Find logs for current user
    const userId = req.user.userId;
    
    const filter = { user: userId };
    
    // Apply additional filters if provided
    if (req.query.action) filter.action = req.query.action;
    
    // Date range filter
    if (req.query.startDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$lte = new Date(req.query.endDate);
    }
    
    // Get total count for pagination
    const total = await UserLog.countDocuments(filter);
    
    // Get user logs with pagination
    const logs = await UserLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 