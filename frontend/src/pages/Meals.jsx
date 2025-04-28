import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApi } from '../hooks/useApi';

const API_URL = 'http://localhost:5007/api';

// Add meal images
const mealImages = {
  'Vegetarian': {
    'Quinoa Buddha Bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'Spinach and Feta Stuffed Portobello': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Lentil and Vegetable Curry': 'https://images.unsplash.com/photo-1585937421612-70a008356570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'default': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  'Non-Vegetarian': {
    'Grilled Chicken with Roasted Vegetables': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Salmon and Asparagus': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Turkey Meatballs with Zucchini Noodles': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'default': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
};

// Helper function to get image URL for a meal
const getMealImage = (categoryName, mealName) => {
  if (mealImages[categoryName] && mealImages[categoryName][mealName]) {
    return mealImages[categoryName][mealName];
  }
  return mealImages[categoryName]?.default || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
};

const Meals = () => {
  const [mealCategories, setMealCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        // Fetch both vegetarian and non-vegetarian meals
        const vegResponse = await axios.get(`${API_URL}/meals/ideas/Vegetarian`);
        const nonVegResponse = await axios.get(`${API_URL}/meals/ideas/Non-Vegetarian`);
        
        console.log('Vegetarian meals:', vegResponse.data);
        console.log('Non-Vegetarian meals:', nonVegResponse.data);
        
        // Format the data to match our component structure
        const categories = [
          {
            name: 'Vegetarian',
            meals: vegResponse.data.meals.map(meal => ({
              ...meal,
              protein: meal.calories > 400 ? '18g' : '15g',
              carbs: meal.calories > 400 ? '60g' : '45g',
              fat: meal.calories > 400 ? '20g' : '15g',
              ingredients: meal.description ? meal.description.split(', ') : 
                ['Ingredients information not available']
            }))
          },
          {
            name: 'Non-Vegetarian',
            meals: nonVegResponse.data.meals.map(meal => ({
              ...meal,
              protein: meal.calories > 450 ? '30g' : '25g',
              carbs: meal.calories > 450 ? '40g' : '30g',
              fat: meal.calories > 450 ? '25g' : '18g',
              ingredients: meal.description ? meal.description.split(', ') : 
                ['Ingredients information not available']
            }))
          }
        ];
        
        setMealCategories(categories);
      } catch (error) {
        console.error('Error fetching meals:', error);
        // Fallback to default categories if API fails
        setMealCategories([
          {
            name: 'Vegetarian',
            meals: [
              {
                name: 'Quinoa Buddha Bowl',
                calories: 420,
                protein: '15g',
                carbs: '45g',
                fat: '20g',
                ingredients: [
                  'Quinoa', 'Roasted sweet potatoes', 'Avocado', 'Black beans',
                  'Cherry tomatoes', 'Cucumber', 'Tahini dressing'
                ]
              },
              {
                name: 'Spinach and Feta Stuffed Portobello',
                calories: 350,
                protein: '12g',
                carbs: '18g',
                fat: '25g',
                ingredients: [
                  'Portobello mushrooms', 'Spinach', 'Feta cheese', 'Garlic',
                  'Olive oil', 'Balsamic glaze', 'Pine nuts'
                ]
              },
              {
                name: 'Lentil and Vegetable Curry',
                calories: 380,
                protein: '18g',
                carbs: '50g',
                fat: '12g',
                ingredients: [
                  'Red lentils', 'Coconut milk', 'Tomatoes', 'Spinach',
                  'Curry powder', 'Garlic', 'Onion', 'Brown rice'
                ]
              }
            ]
          },
          {
            name: 'Non-Vegetarian',
            meals: [
              {
                name: 'Grilled Chicken with Roasted Vegetables',
                calories: 450,
                protein: '35g',
                carbs: '30g',
                fat: '18g',
                ingredients: [
                  'Chicken breast', 'Bell peppers', 'Zucchini', 'Red onion',
                  'Olive oil', 'Rosemary', 'Thyme', 'Lemon'
                ]
              },
              {
                name: 'Salmon and Asparagus',
                calories: 420,
                protein: '30g',
                carbs: '15g',
                fat: '25g',
                ingredients: [
                  'Salmon fillet', 'Asparagus', 'Lemon', 'Garlic',
                  'Olive oil', 'Dill', 'Cherry tomatoes'
                ]
              },
              {
                name: 'Turkey Meatballs with Zucchini Noodles',
                calories: 380,
                protein: '28g',
                carbs: '20g',
                fat: '18g',
                ingredients: [
                  'Ground turkey', 'Zucchini', 'Egg', 'Almond flour',
                  'Marinara sauce', 'Basil', 'Garlic', 'Parmesan cheese'
                ]
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeals();
  }, []);
  
  const handleBack = () => {
    if (selectedMeal) {
      setSelectedMeal(null);
    } else {
      setSelectedCategory(null);
    }
  };
  
  if (loading) {
    return (
      <div className="pt-16 px-4 max-w-7xl mx-auto flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[var(--color-light)] text-center my-12"
      >
        <span className="text-[var(--color-secondary)]">Healthy</span> Meal Ideas
      </motion.h1>
      
      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {mealCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg relative h-64"
              onClick={() => setSelectedCategory(category)}
            >
              <img 
                src={mealImages[category.name]?.default}
                alt={category.name} 
                className="w-full h-full object-cover absolute"
              />
              <div className="p-8 flex flex-col h-full justify-end relative z-10 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-2xl font-semibold text-white mb-3">{category.name}</h2>
                <p className="text-white mb-6">Explore {category.name.toLowerCase()} meals for your diet plan</p>
                <button className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-secondary-dark)] transition-colors shadow-lg w-fit">
                  View Meals
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !selectedMeal ? (
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <button 
              onClick={handleBack}
              className="text-[var(--color-secondary-dark)] hover:text-[var(--color-secondary)] mb-6 flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to categories</span>
            </button>
            <div className="premium-card p-8 mb-10">
              <div className="flex items-center mb-4">
                <h2 className="text-3xl font-bold text-[var(--color-light)] mb-1">{selectedCategory.name} Meals</h2>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategory.meals.map((meal, index) => (
              <motion.div
                key={meal.id || meal.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 1) }}
                className="rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedMeal(meal)}
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={getMealImage(selectedCategory.name, meal.name)} 
                    alt={meal.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-[var(--color-dark-alt)]">
                  <h3 className="text-xl font-semibold text-[var(--color-light)] mb-3">{meal.name}</h3>
                  <div className="text-[var(--color-light-alt)] text-sm mb-5">
                    <p className="mb-1">{meal.calories} calories</p>
                    <p>Protein: {meal.protein} | Carbs: {meal.carbs} | Fat: {meal.fat}</p>
                  </div>
                  <button className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] text-sm flex items-center">
                    View Details 
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button 
              onClick={handleBack}
              className="text-[var(--color-secondary-dark)] hover:text-[var(--color-secondary)] mb-6 flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to meals</span>
            </button>
            
            <h2 className="text-3xl font-bold text-[var(--color-light)] mb-6">{selectedMeal.name}</h2>
            
            <div className="premium-card mb-8">
              <h3 className="text-xl font-semibold text-[var(--color-light)] mb-5">Nutrition Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] p-4 rounded-lg text-center border border-white border-opacity-5">
                  <p className="text-[var(--color-light-alt)] text-sm mb-1">Calories</p>
                  <p className="text-[var(--color-light)] text-xl font-bold">{selectedMeal.calories}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] p-4 rounded-lg text-center border border-white border-opacity-5">
                  <p className="text-[var(--color-light-alt)] text-sm mb-1">Protein</p>
                  <p className="text-[var(--color-light)] text-xl font-bold">{selectedMeal.protein}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] p-4 rounded-lg text-center border border-white border-opacity-5">
                  <p className="text-[var(--color-light-alt)] text-sm mb-1">Carbs</p>
                  <p className="text-[var(--color-light)] text-xl font-bold">{selectedMeal.carbs}</p>
                </div>
                <div className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] p-4 rounded-lg text-center border border-white border-opacity-5">
                  <p className="text-[var(--color-light-alt)] text-sm mb-1">Fat</p>
                  <p className="text-[var(--color-light)] text-xl font-bold">{selectedMeal.fat}</p>
                </div>
              </div>
            </div>
            
            <div className="premium-card">
              <h3 className="text-xl font-semibold text-[var(--color-light)] mb-5">Ingredients</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {selectedMeal.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-[var(--color-light-alt)] flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)] mr-2"></div>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Meals; 