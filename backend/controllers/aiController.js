const User = require('../models/User');

// Sample meal database (you can expand this or connect to a real database)
const mealDatabase = {
  'Weight Loss': {
    vegetarian: {
      breakfast: [
        { name: 'Oatmeal with Berries', calories: 300, protein: 10, carbs: 45, fat: 8 },
        { name: 'Greek Yogurt Parfait', calories: 250, protein: 15, carbs: 35, fat: 6 },
        { name: 'Smoothie Bowl', calories: 280, protein: 12, carbs: 40, fat: 7 }
      ],
      lunch: [
        { name: 'Quinoa Buddha Bowl', calories: 400, protein: 15, carbs: 50, fat: 12 },
        { name: 'Mediterranean Salad', calories: 350, protein: 12, carbs: 30, fat: 15 },
        { name: 'Lentil Soup', calories: 320, protein: 18, carbs: 45, fat: 8 }
      ],
      dinner: [
        { name: 'Stir-Fried Tofu', calories: 380, protein: 20, carbs: 35, fat: 14 },
        { name: 'Chickpea Curry', calories: 420, protein: 16, carbs: 48, fat: 12 },
        { name: 'Veggie-Loaded Pasta', calories: 450, protein: 18, carbs: 65, fat: 10 }
      ]
    },
    nonVegetarian: {
      breakfast: [
        { name: 'Egg White Omelette', calories: 280, protein: 25, carbs: 15, fat: 12 },
        { name: 'Turkey Bacon Wrap', calories: 320, protein: 22, carbs: 30, fat: 14 },
        { name: 'Protein Smoothie', calories: 250, protein: 20, carbs: 25, fat: 8 }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: 380, protein: 35, carbs: 20, fat: 15 },
        { name: 'Tuna Wrap', calories: 350, protein: 28, carbs: 35, fat: 12 },
        { name: 'Turkey Quinoa Bowl', calories: 420, protein: 30, carbs: 45, fat: 14 }
      ],
      dinner: [
        { name: 'Baked Salmon', calories: 450, protein: 38, carbs: 25, fat: 18 },
        { name: 'Lean Beef Stir-Fry', calories: 480, protein: 35, carbs: 40, fat: 16 },
        { name: 'Grilled Fish Tacos', calories: 420, protein: 32, carbs: 38, fat: 15 }
      ]
    }
  },
  'Muscle Gain': {
    // Similar structure with higher calorie/protein meals
  },
  'Maintenance': {
    // Similar structure with balanced meals
  }
};

const predictMeals = async (req, res) => {
  try {
    const { goal, diet_type, date, user_id } = req.body;
    
    // Validate inputs
    if (!goal || !diet_type || !date || !user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }

    // Get user preferences
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Determine diet category
    const dietCategory = diet_type.toLowerCase().includes('veg') ? 'vegetarian' : 'nonVegetarian';
    
    // Get meals for the user's goal and diet type
    const goalMeals = mealDatabase[goal]?.[dietCategory];
    
    if (!goalMeals) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid goal or diet type'
      });
    }

    // Generate recommendations
    const recommendations = {
      breakfast: [goalMeals.breakfast[Math.floor(Math.random() * goalMeals.breakfast.length)]],
      lunch: [goalMeals.lunch[Math.floor(Math.random() * goalMeals.lunch.length)]],
      dinner: [goalMeals.dinner[Math.floor(Math.random() * goalMeals.dinner.length)]]
    };

    return res.json({
      status: 'success',
      recommendations
    });
  } catch (error) {
    console.error('Error in meal prediction:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  predictMeals
}; 