const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Meal = require('../models/Meal');
const mealController = require('../controllers/mealController');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Public routes
router.get('/', mealController.getAllMeals);
router.get('/featured', mealController.getFeaturedMeals);
router.get('/search/:query', mealController.searchMeals);
router.get('/category/:category', mealController.getMealsByCategory);
router.get('/type/:type', mealController.getMealsByType);
router.get('/category/:category/type/:type', mealController.getMealsByCategoryAndType);
router.get('/:id', mealController.getMealById);

// Get meal ideas by category
router.get('/ideas/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['Vegetarian', 'Non-Vegetarian'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Must be Vegetarian or Non-Vegetarian' });
    }
    
    // Sample meal ideas for each category
    const mealIdeas = {
      'Vegetarian': [
        { id: 'v1', name: 'Quinoa Buddha Bowl', calories: 420, description: 'Quinoa, Roasted sweet potatoes, Avocado, Black beans, Cherry tomatoes, Cucumber, Tahini dressing' },
        { id: 'v2', name: 'Spinach and Feta Stuffed Portobello', calories: 350, description: 'Portobello mushrooms, Spinach, Feta cheese, Garlic, Olive oil, Balsamic glaze, Pine nuts' },
        { id: 'v3', name: 'Lentil and Vegetable Curry', calories: 380, description: 'Red lentils, Coconut milk, Tomatoes, Spinach, Curry powder, Garlic, Onion, Brown rice' },
        { id: 'v4', name: 'Mediterranean Chickpea Salad', calories: 320, description: 'Chickpeas, Cucumber, Cherry tomatoes, Red onion, Feta, Olives, Olive oil, Lemon juice' },
        { id: 'v5', name: 'Vegetable Stir Fry with Tofu', calories: 390, description: 'Tofu, Broccoli, Bell peppers, Carrots, Snow peas, Garlic, Ginger, Soy sauce' }
      ],
      'Non-Vegetarian': [
        { id: 'nv1', name: 'Grilled Chicken with Roasted Vegetables', calories: 450, description: 'Chicken breast, Bell peppers, Zucchini, Red onion, Olive oil, Rosemary, Thyme, Lemon' },
        { id: 'nv2', name: 'Salmon and Asparagus', calories: 420, description: 'Salmon fillet, Asparagus, Lemon, Garlic, Olive oil, Dill, Cherry tomatoes' },
        { id: 'nv3', name: 'Turkey Meatballs with Zucchini Noodles', calories: 380, description: 'Ground turkey, Zucchini, Egg, Almond flour, Marinara sauce, Basil, Garlic, Parmesan cheese' },
        { id: 'nv4', name: 'Shrimp and Avocado Salad', calories: 310, description: 'Shrimp, Avocado, Mixed greens, Cherry tomatoes, Cucumber, Lime juice, Cilantro' },
        { id: 'nv5', name: 'Beef Stir Fry with Broccoli', calories: 420, description: 'Lean beef strips, Broccoli, Carrots, Onion, Garlic, Ginger, Soy sauce, Brown rice' }
      ]
    };
    
    res.json({ 
      category,
      meals: mealIdeas[category]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes - require authentication
router.post('/', authMiddleware, mealController.createMeal);
router.put('/:id', authMiddleware, mealController.updateMeal);
router.delete('/:id', authMiddleware, mealController.deleteMeal);

// Get user's meal plan
router.get('/plan', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ mealPlan: user.mealPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate personalized meal plan
router.post('/plan/generate', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { fitnessGoal } = user;
    
    if (!fitnessGoal) {
      return res.status(400).json({ message: 'Please set your fitness goal first' });
    }
    
    // Generate a personalized meal plan based on the database
    // For demonstration, we'll get random meals from the database
    const vegetarianBreakfast = await Meal.find({ category: 'Vegetarian', type: 'Breakfast' }).limit(3);
    const vegetarianLunch = await Meal.find({ category: 'Vegetarian', type: 'Lunch' }).limit(3);
    const vegetarianDinner = await Meal.find({ category: 'Vegetarian', type: 'Dinner' }).limit(3);
    
    const nonVegBreakfast = await Meal.find({ category: 'Non-Vegetarian', type: 'Breakfast' }).limit(2);
    const nonVegLunch = await Meal.find({ category: 'Non-Vegetarian', type: 'Lunch' }).limit(2);
    const nonVegDinner = await Meal.find({ category: 'Non-Vegetarian', type: 'Dinner' }).limit(2);
    
    // Create a balanced meal plan based on fitness goal
    const mealPlan = [
      {
        day: 'Monday',
        meals: [
          vegetarianBreakfast[0] || { name: 'Oatmeal', type: 'Breakfast', calories: 300 },
          vegetarianLunch[0] || { name: 'Vegetable Salad', type: 'Lunch', calories: 400 },
          nonVegDinner[0] || { name: 'Grilled Chicken', type: 'Dinner', calories: 500 }
        ]
      },
      {
        day: 'Tuesday',
        meals: [
          nonVegBreakfast[0] || { name: 'Egg Sandwich', type: 'Breakfast', calories: 350 },
          vegetarianLunch[1] || { name: 'Lentil Soup', type: 'Lunch', calories: 380 },
          vegetarianDinner[0] || { name: 'Vegetable Stir Fry', type: 'Dinner', calories: 450 }
        ]
      },
      {
        day: 'Wednesday',
        meals: [
          vegetarianBreakfast[1] || { name: 'Fruit Smoothie', type: 'Breakfast', calories: 280 },
          nonVegLunch[0] || { name: 'Chicken Wrap', type: 'Lunch', calories: 420 },
          vegetarianDinner[1] || { name: 'Bean Curry', type: 'Dinner', calories: 480 }
        ]
      }
    ];

    user.mealPlan = mealPlan;
    await user.save();

    res.json({ mealPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track meal plan adherence
router.post('/track', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { date = new Date(), mealPlanFollowed = true } = req.body;

    const progress = {
      date,
      mealPlanFollowed,
      weight: user.measurements?.weight
    };

    user.progress.push(progress);
    await user.save();

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 