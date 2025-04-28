const Meal = require('../models/Meal');

// Fallback data for when database isn't available
const fallbackMeals = [
  {
    _id: '1',
    name: 'Vegetable Stir Fry',
    description: 'Fresh vegetables stir-fried with tofu and soy sauce',
    ingredients: ['Tofu', 'Broccoli', 'Carrots', 'Peppers', 'Soy sauce'],
    instructions: '1. Cut vegetables and tofu. 2. Stir fry until done. 3. Add sauce and serve.',
    nutritionalInfo: {
      calories: 320,
      protein: 15,
      carbs: 30,
      fat: 12
    },
    category: 'Vegetarian',
    type: 'Dinner',
    preparationTime: 20,
    isFeatured: true
  },
  {
    _id: '2',
    name: 'Grilled Chicken Salad',
    description: 'Lean grilled chicken with fresh salad',
    ingredients: ['Chicken breast', 'Lettuce', 'Cucumber', 'Tomatoes', 'Olive oil'],
    instructions: '1. Grill chicken. 2. Prepare vegetables. 3. Mix and serve with dressing.',
    nutritionalInfo: {
      calories: 350,
      protein: 30,
      carbs: 10,
      fat: 15
    },
    category: 'Non-Vegetarian',
    type: 'Lunch',
    preparationTime: 25,
    isFeatured: true
  },
  {
    _id: '3',
    name: 'Oatmeal with Fruits',
    description: 'Healthy oatmeal with fresh berries',
    ingredients: ['Oats', 'Milk', 'Honey', 'Berries', 'Nuts'],
    instructions: '1. Cook oats with milk. 2. Add honey and toppings.',
    nutritionalInfo: {
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 6
    },
    category: 'Vegetarian',
    type: 'Breakfast',
    preparationTime: 10,
    isFeatured: false
  }
];

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all meals
exports.getAllMeals = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getAllMeals');
      return res.json(fallbackMeals);
    }
    
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    console.error('Error in getAllMeals:', error.message);
    res.json(fallbackMeals);
  }
};

// Get meals by category
exports.getMealsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['Vegetarian', 'Non-Vegetarian'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Must be Vegetarian or Non-Vegetarian' });
    }
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getMealsByCategory: ${category}`);
      return res.json(fallbackMeals.filter(meal => meal.category === category));
    }
    
    const meals = await Meal.find({ category });
    res.json(meals);
  } catch (error) {
    console.error('Error in getMealsByCategory:', error.message);
    const { category } = req.params;
    res.json(fallbackMeals.filter(meal => meal.category === category));
  }
};

// Get meals by type
exports.getMealsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(type)) {
      return res.status(400).json({ message: 'Invalid meal type' });
    }
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getMealsByType: ${type}`);
      return res.json(fallbackMeals.filter(meal => meal.type === type));
    }
    
    const meals = await Meal.find({ type });
    res.json(meals);
  } catch (error) {
    console.error('Error in getMealsByType:', error.message);
    const { type } = req.params;
    res.json(fallbackMeals.filter(meal => meal.type === type));
  }
};

// Get meals by category and type
exports.getMealsByCategoryAndType = async (req, res) => {
  try {
    const { category, type } = req.params;
    
    if (!['Vegetarian', 'Non-Vegetarian'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Must be Vegetarian or Non-Vegetarian' });
    }
    
    if (!['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(type)) {
      return res.status(400).json({ message: 'Invalid meal type' });
    }
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getMealsByCategoryAndType: ${category}, ${type}`);
      return res.json(fallbackMeals.filter(meal => meal.category === category && meal.type === type));
    }
    
    const meals = await Meal.find({ category, type });
    res.json(meals);
  } catch (error) {
    console.error('Error in getMealsByCategoryAndType:', error.message);
    const { category, type } = req.params;
    res.json(fallbackMeals.filter(meal => meal.category === category && meal.type === type));
  }
};

// Get meal by ID
exports.getMealById = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getMealById: ${req.params.id}`);
      const meal = fallbackMeals.find(meal => meal._id === req.params.id);
      if (!meal) {
        return res.status(404).json({ message: 'Meal not found' });
      }
      return res.json(meal);
    }
    
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    res.json(meal);
  } catch (error) {
    console.error('Error in getMealById:', error.message);
    const meal = fallbackMeals.find(meal => meal._id === req.params.id);
    if (meal) {
      res.json(meal);
    } else {
      res.status(404).json({ message: 'Meal not found' });
    }
  }
};

// Get featured meals
exports.getFeaturedMeals = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getFeaturedMeals');
      return res.json(fallbackMeals.filter(meal => meal.isFeatured));
    }
    
    const meals = await Meal.find({ isFeatured: true });
    res.json(meals);
  } catch (error) {
    console.error('Error in getFeaturedMeals:', error.message);
    res.json(fallbackMeals.filter(meal => meal.isFeatured));
  }
};

// Search meals by name or ingredients
exports.searchMeals = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for searchMeals: ${query}`);
      const filteredMeals = fallbackMeals.filter(meal => 
        meal.name.toLowerCase().includes(query.toLowerCase()) || 
        meal.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase()))
      );
      return res.json(filteredMeals);
    }
    
    const meals = await Meal.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { ingredients: { $in: [new RegExp(query, 'i')] } }
      ]
    });
    
    res.json(meals);
  } catch (error) {
    console.error('Error in searchMeals:', error.message);
    const { query } = req.params;
    const filteredMeals = fallbackMeals.filter(meal => 
      meal.name.toLowerCase().includes(query.toLowerCase()) || 
      meal.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase()))
    );
    res.json(filteredMeals);
  }
};

// Create a new meal (admin only)
exports.createMeal = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot create meal.' });
    }
    
    const meal = new Meal(req.body);
    const savedMeal = await meal.save();
    res.status(201).json(savedMeal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a meal (admin only)
exports.updateMeal = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot update meal.' });
    }
    
    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    res.json(updatedMeal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a meal (admin only)
exports.deleteMeal = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot delete meal.' });
    }
    
    const deletedMeal = await Meal.findByIdAndDelete(req.params.id);
    
    if (!deletedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 