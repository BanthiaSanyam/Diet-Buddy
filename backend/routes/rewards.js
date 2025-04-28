const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// All rewards routes require authentication
router.use(authMiddleware);

// Get user rewards
router.get('/', async (req, res) => {
  try {
    let reward = await Reward.findOne({ user: req.user.userId });
    
    // If no reward record found, create one
    if (!reward) {
      reward = new Reward({
        user: req.user.userId,
        coins: 0,
        activities: []
      });
      await reward.save();
    }
    
    res.json(reward);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add activity and coins
router.post('/add', async (req, res) => {
  try {
    const { type, coins, description } = req.body;
    
    if (!type || !coins) {
      return res.status(400).json({ message: 'Activity type and coins are required' });
    }
    
    let reward = await Reward.findOne({ user: req.user.userId });
    
    // If no reward record found, create one
    if (!reward) {
      reward = new Reward({
        user: req.user.userId,
        coins: 0,
        activities: []
      });
    }
    
    // Add activity
    reward.activities.push({
      type,
      coins,
      date: new Date(),
      description: description || `Earned ${coins} coins for ${type}`
    });
    
    // Add coins
    reward.coins += coins;
    
    await reward.save();
    res.json(reward);
  } catch (error) {
    console.error('Error adding reward activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity history
router.get('/activities', async (req, res) => {
  try {
    const reward = await Reward.findOne({ user: req.user.userId });
    
    if (!reward) {
      return res.json({ activities: [] });
    }
    
    // Sort activities by date (newest first)
    const sortedActivities = reward.activities.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    res.json({ activities: sortedActivities });
  } catch (error) {
    console.error('Error fetching reward activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track user daily activity (workout completed, meal plan followed, streaks)
router.post('/track-activity', async (req, res) => {
  try {
    const { workoutCompleted, mealPlanFollowed, date = new Date() } = req.body;
    
    if (workoutCompleted === undefined && mealPlanFollowed === undefined) {
      return res.status(400).json({ message: 'At least one tracking parameter is required' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize progress tracking if it doesn't exist
    if (!user.progress) {
      user.progress = [];
    }
    
    // Check if there's already an entry for today
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    
    let todayEntry = user.progress.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    // If no entry exists for today, create one
    if (!todayEntry) {
      todayEntry = {
        date: today,
        workoutCompleted: false,
        mealPlanFollowed: false,
        steps: 0
      };
      user.progress.push(todayEntry);
    } else {
      // Get the index of today's entry to update it
      const entryIndex = user.progress.findIndex(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      
      // Update existing entry
      if (workoutCompleted !== undefined) {
        user.progress[entryIndex].workoutCompleted = workoutCompleted;
      }
      
      if (mealPlanFollowed !== undefined) {
        user.progress[entryIndex].mealPlanFollowed = mealPlanFollowed;
      }
    }
    
    // Process rewards and calculate streaks
    let rewardCoins = 0;
    let rewardMessage = '';
    let activityType = '';
    
    // Find or create a reward record
    let reward = await Reward.findOne({ user: req.user.userId });
    if (!reward) {
      reward = new Reward({
        user: req.user.userId,
        coins: 0,
        activities: []
      });
    }
    
    // Calculate streaks
    const calculateStreak = (progressArray, property) => {
      let currentStreak = 0;
      // Sort progress by date (newest first)
      const sortedProgress = [...progressArray].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Calculate current streak
      for (const entry of sortedProgress) {
        if (entry[property]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return currentStreak;
    };
    
    // Calculate streaks
    const workoutStreak = calculateStreak(user.progress, 'workoutCompleted');
    const mealStreak = calculateStreak(user.progress, 'mealPlanFollowed');
    
    // Add streak data to the response
    const streaks = {
      workout: workoutStreak,
      meal: mealStreak
    };
    
    // Add rewards for completing workout
    if (workoutCompleted) {
      rewardCoins += 5;
      activityType = 'workout_completed';
      rewardMessage = 'Completed today\'s workout';
      
      // Check if a streak milestone is achieved
      if (workoutStreak === 3) {
        rewardCoins += 10;
        rewardMessage += ' - 3 Day Streak achieved!';
      } else if (workoutStreak === 7) {
        rewardCoins += 25;
        rewardMessage += ' - 7 Day Streak achieved!';
      } else if (workoutStreak === 30) {
        rewardCoins += 100;
        rewardMessage += ' - 30 Day Streak achieved!';
      }
    }
    
    // Add rewards for following meal plan
    if (mealPlanFollowed) {
      rewardCoins += 5;
      activityType = activityType ? 'daily_activities' : 'meal_followed';
      rewardMessage = activityType === 'daily_activities' ? 
        'Completed workout and followed meal plan' : 'Followed meal plan';
      
      // Check if a streak milestone is achieved
      if (mealStreak === 3) {
        rewardCoins += 10;
        rewardMessage += ' - 3 Day Meal Streak achieved!';
      } else if (mealStreak === 7) {
        rewardCoins += 25;
        rewardMessage += ' - 7 Day Meal Streak achieved!';
      } else if (mealStreak === 30) {
        rewardCoins += 100;
        rewardMessage += ' - 30 Day Meal Streak achieved!';
      }
    }
    
    // Check for consistency achievement (both meal and workout for 7 days)
    if (workoutStreak >= 7 && mealStreak >= 7) {
      // Check if this achievement has been given before
      const consistencyAchievement = reward.activities.find(a => 
        a.type === 'achievement' && a.description === 'Consistency King Badge');
      
      if (!consistencyAchievement) {
        rewardCoins += 50;
        rewardMessage += ' - Consistency King Badge earned!';
        
        // Add the achievement to activities
        reward.activities.push({
          type: 'achievement',
          coins: 50,
          date: new Date(),
          description: 'Consistency King Badge'
        });
      }
    }
    
    // Add rewards if applicable
    if (rewardCoins > 0) {
      reward.activities.push({
        type: activityType,
        coins: rewardCoins,
        date: new Date(),
        description: rewardMessage
      });
      
      reward.coins += rewardCoins;
      await reward.save();
    }
    
    // Check for badges/achievements
    const loginCount = user.progress.length;
    const badges = [];
    
    // Day 1 badge
    if (loginCount === 1) {
      badges.push({ id: 'day1', name: 'First Day!', description: 'Completed your first day' });
    }
    
    // Day 5 badge
    if (loginCount === 5) {
      badges.push({ id: 'day5', name: 'High Five!', description: 'Logged 5 days of activity' });
    }
    
    // Day 10 badge
    if (loginCount === 10) {
      badges.push({ id: 'day10', name: 'Perfect 10!', description: 'Logged 10 days of activity' });
    }
    
    // Day 30 badge
    if (loginCount === 30) {
      badges.push({ id: 'day30', name: 'Monthly Master!', description: 'Logged 30 days of activity' });
    }
    
    // Add streak badges
    if (workoutStreak === 3) {
      badges.push({ id: 'streak3', name: 'Workout Warrior', description: '3-day workout streak' });
    }
    
    if (workoutStreak === 7) {
      badges.push({ id: 'streak7', name: 'Workout Champion', description: '7-day workout streak' });
    }
    
    if (workoutStreak === 30) {
      badges.push({ id: 'streak30', name: 'Workout Legend', description: '30-day workout streak' });
    }
    
    await user.save();
    
    res.json({
      success: true,
      dateRecorded: today,
      workoutCompleted,
      mealPlanFollowed,
      streaks,
      rewardsEarned: rewardCoins,
      rewardMessage: rewardMessage || null,
      badges: badges.length > 0 ? badges : null
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user streaks and achievements
router.get('/streaks', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.progress || user.progress.length === 0) {
      return res.json({
        streaks: { workout: 0, meal: 0 },
        loginCount: 0,
        badges: []
      });
    }
    
    // Calculate streaks
    const calculateStreak = (progressArray, property) => {
      let currentStreak = 0;
      // Sort progress by date (newest first)
      const sortedProgress = [...progressArray].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Calculate current streak
      for (const entry of sortedProgress) {
        if (entry[property]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return currentStreak;
    };
    
    const workoutStreak = calculateStreak(user.progress, 'workoutCompleted');
    const mealStreak = calculateStreak(user.progress, 'mealPlanFollowed');
    
    // Get login count (total days tracked)
    const loginCount = user.progress.length;
    
    // Determine unlocked badges
    const badges = [];
    
    // Login count badges
    if (loginCount >= 1) {
      badges.push({ id: 'day1', name: 'First Day!', description: 'Completed your first day' });
    }
    
    if (loginCount >= 5) {
      badges.push({ id: 'day5', name: 'High Five!', description: 'Logged 5 days of activity' });
    }
    
    if (loginCount >= 10) {
      badges.push({ id: 'day10', name: 'Perfect 10!', description: 'Logged 10 days of activity' });
    }
    
    if (loginCount >= 30) {
      badges.push({ id: 'day30', name: 'Monthly Master!', description: 'Logged 30 days of activity' });
    }
    
    if (loginCount >= 50) {
      badges.push({ id: 'day50', name: 'Half Century!', description: 'Logged 50 days of activity' });
    }
    
    // Streak badges
    if (workoutStreak >= 3) {
      badges.push({ id: 'streak3', name: 'Workout Warrior', description: '3-day workout streak' });
    }
    
    if (workoutStreak >= 7) {
      badges.push({ id: 'streak7', name: 'Workout Champion', description: '7-day workout streak' });
    }
    
    if (workoutStreak >= 30) {
      badges.push({ id: 'streak30', name: 'Workout Legend', description: '30-day workout streak' });
    }
    
    // Meal streak badges
    if (mealStreak >= 3) {
      badges.push({ id: 'meal3', name: 'Nutrition Novice', description: '3-day meal plan streak' });
    }
    
    if (mealStreak >= 7) {
      badges.push({ id: 'meal7', name: 'Nutrition Pro', description: '7-day meal plan streak' });
    }
    
    if (mealStreak >= 10) {
      badges.push({ id: 'meal10', name: 'Nutrition Nerd', description: 'Followed meal plan for 10 days' });
    }
    
    // Consistency badges
    if (workoutStreak >= 7 && mealStreak >= 7) {
      badges.push({ id: 'consistency', name: 'Consistency King', description: 'Completing all workouts and meals for 7 straight days' });
    }
    
    // Get user's activities to check for special achievements
    const reward = await Reward.findOne({ user: req.user.userId });
    
    // Check for Comeback Kid badge
    if (reward) {
      const comebackKid = reward.activities.find(a => 
        a.type === 'achievement' && a.description.includes('Comeback Kid'));
      
      if (comebackKid) {
        badges.push({ id: 'comeback', name: 'Comeback Kid', description: 'Breaking a missed streak but returning for another consistent 3 days' });
      }
      
      // Check for Early Bird badge from rewards
      const earlyBird = reward.activities.find(a => 
        a.type === 'achievement' && a.description.includes('Early Bird'));
      
      if (earlyBird) {
        badges.push({ id: 'earlybird', name: 'Early Bird', description: 'Logging in before 7 AM for 5 consecutive days' });
      }
    }
    
    res.json({
      streaks: {
        workout: workoutStreak,
        meal: mealStreak
      },
      loginCount,
      badges
    });
  } catch (error) {
    console.error('Error fetching streaks and achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Automatic rewards for steps
router.post('/steps', async (req, res) => {
  try {
    const { steps } = req.body;
    
    if (!steps) {
      return res.status(400).json({ message: 'Steps count is required' });
    }
    
    // Calculate coins based on steps
    // 1 coin per 1000 steps
    const coins = Math.floor(steps / 1000);
    
    if (coins <= 0) {
      return res.json({ message: 'Not enough steps for rewards', coinsEarned: 0 });
    }
    
    let reward = await Reward.findOne({ user: req.user.userId });
    
    // If no reward record found, create one
    if (!reward) {
      reward = new Reward({
        user: req.user.userId,
        coins: 0,
        activities: []
      });
    }
    
    // Add activity
    reward.activities.push({
      type: 'steps',
      coins,
      date: new Date(),
      description: `Earned ${coins} coins for ${steps} steps`
    });
    
    // Add coins
    reward.coins += coins;
    
    // Update user's daily progress with steps
    const user = await User.findById(req.user.userId);
    if (user) {
      if (!user.progress) {
        user.progress = [];
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find today's entry
      let todayEntry = user.progress.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      
      if (!todayEntry) {
        // Create new entry for today
        user.progress.push({
          date: today,
          steps: steps,
          workoutCompleted: false,
          mealPlanFollowed: false
        });
      } else {
        // Update existing entry
        const entryIndex = user.progress.findIndex(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
        
        user.progress[entryIndex].steps = steps;
      }
      
      await user.save();
    }
    
    await reward.save();
    res.json({ message: 'Reward added for steps', coinsEarned: coins, totalCoins: reward.coins });
  } catch (error) {
    console.error('Error adding reward for steps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Spend coins (e.g., for redeeming rewards)
router.post('/spend', async (req, res) => {
  try {
    const { amount, item } = req.body;
    
    if (!amount || !item) {
      return res.status(400).json({ message: 'Amount and item are required' });
    }
    
    const reward = await Reward.findOne({ user: req.user.userId });
    
    if (!reward) {
      return res.status(404).json({ message: 'No reward record found' });
    }
    
    // Check if user has enough coins
    if (reward.coins < amount) {
      return res.status(400).json({ message: 'Not enough coins' });
    }
    
    // Add activity (negative coins for spending)
    reward.activities.push({
      type: 'redeem',
      coins: -amount,
      date: new Date(),
      description: `Spent ${amount} coins on ${item}`
    });
    
    // Subtract coins
    reward.coins -= amount;
    
    await reward.save();
    res.json({ message: 'Coins spent successfully', remainingCoins: reward.coins });
  } catch (error) {
    console.error('Error spending coins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 