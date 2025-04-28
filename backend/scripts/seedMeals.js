const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Meal = require('../models/Meal');

// Load environment variables
dotenv.config();

// Define meal data
const vegetarianMeals = [
  {
    name: 'Paneer Butter Masala',
    image: 'https://www.example.com/images/paneer-butter-masala.jpg',
    category: 'dinner',
    type: 'vegetarian',
    description: 'Rich and creamy curry made with paneer cubes in a tomato-based gravy',
    recipe: 'Sauté onions, add tomato puree, spices, and cream. Add paneer cubes and simmer.',
    calories: 420,
    protein: 18,
    carbs: 25,
    fat: 28,
    ingredients: ['Paneer', 'Tomatoes', 'Onions', 'Cream', 'Spices', 'Butter', 'Cashews'],
    preparationTime: 35,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Sauté onions', 'Step 2: Add tomato puree', 'Step 3: Add spices and cream', 'Step 4: Add paneer cubes and simmer']
  },
  {
    name: 'Masala Dosa',
    image: 'https://www.example.com/images/masala-dosa.jpg',
    category: 'breakfast',
    type: 'vegetarian',
    description: 'Crispy fermented rice crepe filled with spiced potato filling',
    recipe: 'Prepare fermented rice and lentil batter, make thin crepes, fill with potato masala.',
    calories: 350,
    protein: 8,
    carbs: 60,
    fat: 10,
    ingredients: ['Rice', 'Urad Dal', 'Potatoes', 'Onions', 'Mustard Seeds', 'Curry Leaves'],
    preparationTime: 45,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Prepare fermented batter', 'Step 2: Make potato filling', 'Step 3: Make thin crepes', 'Step 4: Fill with potato masala']
  },
  {
    name: 'Vegetable Biryani',
    image: 'https://www.example.com/images/veg-biryani.jpg',
    category: 'lunch',
    type: 'vegetarian',
    description: 'Fragrant rice dish with mixed vegetables and aromatic spices',
    recipe: 'Sauté vegetables with spices, layer with partially cooked basmati rice, dum cook.',
    calories: 450,
    protein: 12,
    carbs: 75,
    fat: 15,
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Saffron', 'Ghee', 'Spices'],
    preparationTime: 60,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Partially cook rice', 'Step 2: Sauté vegetables with spices', 'Step 3: Layer rice and vegetables', 'Step 4: Dum cook']
  },
  {
    name: 'Palak Paneer',
    image: 'https://www.example.com/images/palak-paneer.jpg',
    category: 'dinner',
    type: 'vegetarian',
    description: 'Cottage cheese cubes in a creamy spinach gravy',
    recipe: 'Blanch spinach, blend, sauté aromatics, add spinach puree and paneer, simmer.',
    calories: 380,
    protein: 20,
    carbs: 15,
    fat: 25,
    ingredients: ['Paneer', 'Spinach', 'Onions', 'Cream', 'Spices'],
    preparationTime: 35,
    isIndian: true,
    instructions: ['Step 1: Blanch spinach', 'Step 2: Blend spinach', 'Step 3: Sauté aromatics', 'Step 4: Add spinach puree and paneer']
  },
  {
    name: 'Aloo Gobi',
    image: 'https://www.example.com/images/aloo-gobi.jpg',
    category: 'lunch',
    type: 'vegetarian',
    description: 'Dry curry made with potatoes and cauliflower',
    recipe: 'Sauté cumin seeds, add potatoes and cauliflower, cook with spices until tender.',
    calories: 280,
    protein: 6,
    carbs: 45,
    fat: 10,
    ingredients: ['Potatoes', 'Cauliflower', 'Turmeric', 'Cumin', 'Coriander'],
    preparationTime: 30,
    isIndian: true,
    instructions: ['Step 1: Sauté cumin seeds', 'Step 2: Add potatoes and cauliflower', 'Step 3: Add spices', 'Step 4: Cook until tender']
  },
  {
    name: 'Chole Bhature',
    image: 'https://www.example.com/images/chole-bhature.jpg',
    category: 'lunch',
    type: 'vegetarian',
    description: 'Spicy chickpea curry served with deep-fried bread',
    recipe: 'Soak chickpeas, pressure cook with spices. Prepare fermented dough for bhature, deep fry until puffy.',
    calories: 550,
    protein: 15,
    carbs: 85,
    fat: 22,
    ingredients: ['Chickpeas', 'All-purpose Flour', 'Yogurt', 'Onions', 'Tomatoes', 'Spices'],
    preparationTime: 60,
    isIndian: true,
    instructions: ['Step 1: Soak chickpeas', 'Step 2: Pressure cook with spices', 'Step 3: Prepare bhature dough', 'Step 4: Deep fry bhature']
  },
  {
    name: 'Rajma Chawal',
    image: 'https://www.example.com/images/rajma-chawal.jpg',
    category: 'lunch',
    type: 'vegetarian',
    description: 'Kidney bean curry served with steamed rice',
    recipe: 'Soak kidney beans, pressure cook with onion-tomato gravy and spices. Serve with steamed rice.',
    calories: 420,
    protein: 14,
    carbs: 70,
    fat: 8,
    ingredients: ['Kidney Beans', 'Rice', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Spices'],
    preparationTime: 50,
    isIndian: true,
    instructions: ['Step 1: Soak kidney beans', 'Step 2: Pressure cook kidney beans', 'Step 3: Prepare onion-tomato gravy', 'Step 4: Cook with spices', 'Step 5: Serve with rice']
  },
  {
    name: 'Baingan Bharta',
    image: 'https://www.example.com/images/baingan-bharta.jpg',
    category: 'dinner',
    type: 'vegetarian',
    description: 'Smoky roasted eggplant mash cooked with spices',
    recipe: 'Roast eggplant over flame, peel and mash. Sauté onions, tomatoes, and spices, add mashed eggplant.',
    calories: 180,
    protein: 5,
    carbs: 20,
    fat: 10,
    ingredients: ['Eggplant', 'Onions', 'Tomatoes', 'Green Chilies', 'Spices', 'Coriander'],
    preparationTime: 40,
    isIndian: true,
    instructions: ['Step 1: Roast eggplant over flame', 'Step 2: Peel and mash eggplant', 'Step 3: Sauté onions and tomatoes', 'Step 4: Add spices and mashed eggplant']
  },
  {
    name: 'Methi Thepla',
    image: 'https://www.example.com/images/methi-thepla.jpg',
    category: 'breakfast',
    type: 'vegetarian',
    description: 'Gujarati flatbread made with fenugreek leaves and spiced flour',
    recipe: 'Mix wheat flour, gram flour, fenugreek leaves, and spices. Knead into dough, roll into flatbreads, cook on tawa.',
    calories: 200,
    protein: 7,
    carbs: 35,
    fat: 5,
    ingredients: ['Wheat Flour', 'Fenugreek Leaves', 'Gram Flour', 'Yogurt', 'Spices'],
    preparationTime: 35,
    isIndian: true,
    instructions: ['Step 1: Mix flours and spices', 'Step 2: Add fenugreek leaves', 'Step 3: Knead into dough', 'Step 4: Roll into flatbreads', 'Step 5: Cook on tawa']
  },
  {
    name: 'Idli Sambar',
    image: 'https://www.example.com/images/idli-sambar.jpg',
    category: 'breakfast',
    type: 'vegetarian',
    description: 'Steamed rice cakes served with lentil vegetable stew',
    recipe: 'Ferment rice and urad dal batter, steam in moulds. Prepare sambar with lentils, vegetables and spices.',
    calories: 320,
    protein: 10,
    carbs: 60,
    fat: 5,
    ingredients: ['Rice', 'Urad Dal', 'Toor Dal', 'Mixed Vegetables', 'Sambar Powder', 'Tamarind'],
    preparationTime: 45,
    isIndian: true,
    instructions: ['Step 1: Ferment rice and urad dal batter', 'Step 2: Steam in moulds', 'Step 3: Cook toor dal', 'Step 4: Prepare sambar with vegetables and spices']
  },
  {
    name: 'Pav Bhaji',
    image: 'https://www.example.com/images/pav-bhaji.jpg',
    category: 'lunch',
    type: 'vegetarian',
    description: 'Spiced vegetable mash served with buttered bread rolls',
    recipe: 'Boil and mash mixed vegetables, cook with spices and butter. Serve with toasted buttered bread rolls.',
    calories: 450,
    protein: 10,
    carbs: 65,
    fat: 18,
    ingredients: ['Potatoes', 'Peas', 'Cauliflower', 'Bell Peppers', 'Pav Bhaji Masala', 'Butter', 'Bread Rolls'],
    preparationTime: 40,
    isIndian: true
  },
  {
    name: 'Saag Paneer',
    image: 'https://www.example.com/images/saag-paneer.jpg',
    category: 'dinner',
    type: 'vegetarian',
    description: 'Creamy spinach curry with paneer cheese cubes',
    recipe: 'Blanch and puree spinach, sauté with spices, add paneer cubes and cream.',
    calories: 350,
    protein: 18,
    carbs: 12,
    fat: 24,
    ingredients: ['Spinach', 'Paneer', 'Cream', 'Onions', 'Garlic', 'Spices'],
    preparationTime: 35,
    isIndian: true
  },
  {
    name: 'Samosa',
    image: 'https://www.example.com/images/samosa.jpg',
    category: 'snack',
    type: 'vegetarian',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    recipe: 'Make dough, prepare potato-pea filling with spices, form triangular pastries, deep fry until golden.',
    calories: 250,
    protein: 5,
    carbs: 30,
    fat: 14,
    ingredients: ['All-purpose Flour', 'Potatoes', 'Peas', 'Cumin', 'Coriander', 'Garam Masala'],
    preparationTime: 60,
    isIndian: true
  },
  {
    name: 'Khichdi',
    image: 'https://www.example.com/images/khichdi.jpg',
    category: 'dinner',
    type: 'vegetarian',
    description: 'Comforting one-pot meal of rice and lentils',
    recipe: 'Cook rice and moong dal with turmeric and ghee. Prepare tempering with cumin, asafoetida, and dried red chilies.',
    calories: 300,
    protein: 12,
    carbs: 55,
    fat: 6,
    ingredients: ['Rice', 'Moong Dal', 'Ghee', 'Cumin', 'Turmeric', 'Asafoetida'],
    preparationTime: 30,
    isIndian: true
  },
  {
    name: 'Dahi Vada',
    image: 'https://www.example.com/images/dahi-vada.jpg',
    category: 'snack',
    type: 'vegetarian',
    description: 'Lentil dumplings soaked in yogurt with sweet and tangy chutneys',
    recipe: 'Soak and grind urad dal, form into dumplings, deep fry. Soak in water, squeeze out excess, top with whisked yogurt and chutneys.',
    calories: 280,
    protein: 12,
    carbs: 40,
    fat: 9,
    ingredients: ['Urad Dal', 'Yogurt', 'Tamarind Chutney', 'Mint Chutney', 'Cumin Powder', 'Red Chili Powder'],
    preparationTime: 50,
    isIndian: true
  }
];

const nonVegetarianMeals = [
  {
    name: 'Butter Chicken',
    image: 'https://www.example.com/images/butter-chicken.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Tender chicken pieces in a rich, buttery tomato gravy',
    recipe: 'Marinate chicken, grill, prepare tomato-based gravy with butter and cream, combine.',
    calories: 550,
    protein: 35,
    carbs: 15,
    fat: 38,
    ingredients: ['Chicken', 'Tomatoes', 'Butter', 'Cream', 'Spices', 'Cashews'],
    preparationTime: 50,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Marinate chicken', 'Step 2: Grill chicken', 'Step 3: Prepare tomato gravy', 'Step 4: Add butter and cream', 'Step 5: Combine chicken with gravy']
  },
  {
    name: 'Chicken Biryani',
    image: 'https://www.example.com/images/chicken-biryani.jpg',
    category: 'lunch',
    type: 'non-vegetarian',
    description: 'Fragrant rice dish with marinated chicken and aromatic spices',
    recipe: 'Marinate chicken, partially cook rice, layer and dum cook together with saffron.',
    calories: 650,
    protein: 40,
    carbs: 80,
    fat: 20,
    ingredients: ['Chicken', 'Basmati Rice', 'Yogurt', 'Saffron', 'Whole Spices', 'Fried Onions'],
    preparationTime: 75,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Marinate chicken', 'Step 2: Partially cook rice', 'Step 3: Layer rice and chicken', 'Step 4: Dum cook']
  },
  {
    name: 'Chicken Tikka Masala',
    image: 'https://www.example.com/images/chicken-tikka-masala.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Grilled chicken pieces in a creamy, spiced tomato-based sauce',
    recipe: 'Marinate chicken cubes, grill, prepare masala gravy, combine and simmer.',
    calories: 520,
    protein: 38,
    carbs: 20,
    fat: 30,
    ingredients: ['Chicken', 'Yogurt', 'Tomatoes', 'Cream', 'Garam Masala'],
    preparationTime: 60,
    isIndian: true,
    isFeatured: true,
    instructions: ['Step 1: Marinate chicken cubes', 'Step 2: Grill chicken', 'Step 3: Prepare masala gravy', 'Step 4: Combine and simmer']
  },
  {
    name: 'Fish Curry',
    image: 'https://www.example.com/images/fish-curry.jpg',
    category: 'lunch',
    type: 'non-vegetarian',
    description: 'Tangy and spicy curry made with fish fillets in a coconut-based gravy',
    recipe: 'Make spice paste, prepare gravy, add fish pieces, simmer until cooked.',
    calories: 420,
    protein: 35,
    carbs: 15,
    fat: 25,
    ingredients: ['Fish', 'Coconut Milk', 'Tamarind', 'Spices', 'Curry Leaves'],
    preparationTime: 40,
    isIndian: true,
    instructions: ['Step 1: Make spice paste', 'Step 2: Prepare gravy', 'Step 3: Add fish pieces', 'Step 4: Simmer until cooked']
  },
  {
    name: 'Lamb Kebabs',
    image: 'https://www.example.com/images/lamb-kebabs.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Grilled minced lamb skewers with aromatic spices',
    recipe: 'Mix minced lamb with spices, form into kebabs, grill until cooked.',
    calories: 380,
    protein: 28,
    carbs: 5,
    fat: 28,
    ingredients: ['Minced Lamb', 'Onions', 'Ginger', 'Garlic', 'Garam Masala'],
    preparationTime: 45,
    isIndian: true,
    instructions: ['Step 1: Mix minced lamb with spices', 'Step 2: Form into kebabs', 'Step 3: Grill until cooked']
  },
  {
    name: 'Rogan Josh',
    image: 'https://www.example.com/images/rogan-josh.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Aromatic Kashmiri lamb curry with deep red color from Kashmiri chilies',
    recipe: 'Marinate lamb pieces, brown in oil, add yogurt and spices, slow cook until tender.',
    calories: 560,
    protein: 35,
    carbs: 10,
    fat: 42,
    ingredients: ['Lamb', 'Yogurt', 'Kashmiri Chili', 'Ginger', 'Garlic', 'Garam Masala', 'Cardamom'],
    preparationTime: 90,
    isIndian: true,
    instructions: ['Step 1: Marinate lamb pieces', 'Step 2: Brown lamb in oil', 'Step 3: Add yogurt and spices', 'Step 4: Slow cook until tender']
  },
  {
    name: 'Tandoori Chicken',
    image: 'https://www.example.com/images/tandoori-chicken.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Marinated chicken roasted in a clay oven with signature red color',
    recipe: 'Marinate chicken in yogurt and spices, cook in high heat tandoor or oven until charred and tender.',
    calories: 320,
    protein: 30,
    carbs: 5,
    fat: 18,
    ingredients: ['Chicken', 'Yogurt', 'Lemon Juice', 'Ginger', 'Garlic', 'Tandoori Masala'],
    preparationTime: 120,
    isIndian: true,
    instructions: ['Step 1: Marinate chicken in yogurt and spices', 'Step 2: Rest for hours', 'Step 3: Cook in high heat until charred and tender']
  },
  {
    name: 'Prawn Curry',
    image: 'https://www.example.com/images/prawn-curry.jpg',
    category: 'lunch',
    type: 'non-vegetarian',
    description: 'Juicy prawns in coconut-based curry with coastal Indian flavors',
    recipe: 'Sauté onions, ginger, garlic, add ground spices, coconut milk and prawns, simmer until cooked.',
    calories: 380,
    protein: 25,
    carbs: 15,
    fat: 24,
    ingredients: ['Prawns', 'Coconut Milk', 'Onions', 'Tomatoes', 'Curry Leaves', 'Mustard Seeds'],
    preparationTime: 35,
    isIndian: true,
    instructions: ['Step 1: Sauté onions, ginger, garlic', 'Step 2: Add ground spices', 'Step 3: Add coconut milk and prawns', 'Step 4: Simmer until cooked']
  },
  {
    name: 'Keema Matar',
    image: 'https://www.example.com/images/keema-matar.jpg',
    category: 'lunch',
    type: 'non-vegetarian',
    description: 'Spiced minced meat with green peas',
    recipe: 'Brown mince, add onions, ginger, garlic, tomatoes, spices and peas, cook until tender.',
    calories: 420,
    protein: 32,
    carbs: 20,
    fat: 25,
    ingredients: ['Minced Mutton/Lamb', 'Green Peas', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Garam Masala'],
    preparationTime: 45,
    isIndian: true,
    instructions: ['Step 1: Brown mince', 'Step 2: Add onions, ginger, garlic', 'Step 3: Add tomatoes and spices', 'Step 4: Add peas and cook until tender']
  },
  {
    name: 'Chicken Chettinad',
    image: 'https://www.example.com/images/chicken-chettinad.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Fiery hot chicken curry from Chettinad region with complex spice profile',
    recipe: 'Dry roast and grind spices, marinate chicken, cook with onions, tomatoes and prepared spice blend.',
    calories: 480,
    protein: 35,
    carbs: 12,
    fat: 32,
    ingredients: ['Chicken', 'Black Peppercorns', 'Fennel Seeds', 'Star Anise', 'Cinnamon', 'Curry Leaves', 'Coconut'],
    preparationTime: 60,
    isIndian: true,
    instructions: ['Step 1: Dry roast and grind spices', 'Step 2: Marinate chicken', 'Step 3: Cook with onions and tomatoes', 'Step 4: Add spice blend and simmer']
  },
  {
    name: 'Malai Kofta Curry',
    image: 'https://www.example.com/images/malai-kofta.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Succulent meat koftas simmered in creamy gravy',
    recipe: 'Make meat koftas with mince and spices, fry until golden. Prepare creamy tomato gravy, add koftas and simmer.',
    calories: 550,
    protein: 30,
    carbs: 18,
    fat: 40,
    ingredients: ['Minced Chicken/Mutton', 'Onions', 'Cream', 'Cashew Paste', 'Tomatoes', 'Garam Masala'],
    preparationTime: 70,
    isIndian: true
  },
  {
    name: 'Fish Tikka',
    image: 'https://www.example.com/images/fish-tikka.jpg',
    category: 'snack',
    type: 'non-vegetarian',
    description: 'Marinated fish chunks grilled to perfection',
    recipe: 'Marinate fish cubes in yogurt and spices, thread onto skewers, grill until cooked.',
    calories: 280,
    protein: 35,
    carbs: 8,
    fat: 14,
    ingredients: ['Fish Fillets', 'Yogurt', 'Lemon Juice', 'Ginger', 'Garlic', 'Ajwain', 'Chaat Masala'],
    preparationTime: 40,
    isIndian: true
  },
  {
    name: 'Egg Curry',
    image: 'https://www.example.com/images/egg-curry.jpg',
    category: 'lunch',
    type: 'non-vegetarian',
    description: 'Hard-boiled eggs in spiced onion-tomato gravy',
    recipe: 'Hard boil eggs, prepare onion-tomato gravy with spices, add halved eggs, simmer.',
    calories: 320,
    protein: 18,
    carbs: 15,
    fat: 22,
    ingredients: ['Eggs', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Garam Masala', 'Cumin'],
    preparationTime: 35,
    isIndian: true
  },
  {
    name: 'Mutton Korma',
    image: 'https://www.example.com/images/mutton-korma.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Rich and aromatic mutton curry with Mughlai influences',
    recipe: 'Brown mutton pieces, prepare rich gravy with yogurt, onion paste, and spices, slow cook until tender.',
    calories: 580,
    protein: 40,
    carbs: 12,
    fat: 42,
    ingredients: ['Mutton', 'Yogurt', 'Onions', 'Ginger', 'Garlic', 'Cardamom', 'Almonds', 'Saffron'],
    preparationTime: 90,
    isIndian: true
  },
  {
    name: 'Chicken Vindaloo',
    image: 'https://www.example.com/images/chicken-vindaloo.jpg',
    category: 'dinner',
    type: 'non-vegetarian',
    description: 'Spicy and tangy Goan curry with Portuguese influences',
    recipe: 'Marinate chicken in vinegar and spices, cook with onions, garlic, and hot chilies.',
    calories: 450,
    protein: 35,
    carbs: 15,
    fat: 28,
    ingredients: ['Chicken', 'Vinegar', 'Red Chilies', 'Garlic', 'Onions', 'Cinnamon', 'Cloves'],
    preparationTime: 60,
    isIndian: true
  }
];

async function seedMeals() {
  try {
    // Connect to MongoDB Atlas with increased timeout
    console.log('Connecting to MongoDB Atlas...');
    require('dotenv').config({ path: '../.env' });
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB Atlas.');

    // Clear existing meals collection
    console.log('Clearing existing meal data...');
    await Meal.deleteMany({});

    // Insert vegetarian meals
    console.log('Adding vegetarian meals...');
    await Meal.insertMany(vegetarianMeals);
    
    // Insert non-vegetarian meals
    console.log('Adding non-vegetarian meals...');
    await Meal.insertMany(nonVegetarianMeals);

    console.log('Database seeded successfully!');
    console.log(`Added ${vegetarianMeals.length} vegetarian meals and ${nonVegetarianMeals.length} non-vegetarian meals.`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB Atlas connection closed.');
    
  } catch (error) {
    console.error('Error seeding meals:', error);
  }
}

// Run the seed function
seedMeals(); 