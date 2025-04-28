require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    
    // Debug the connection string character by character
    const uri = process.env.MONGODB_URI;
    console.log('URI Length:', uri.length);
    console.log('URI Characters:');
    for (let i = 0; i < uri.length; i++) {
      console.log(`Position ${i}: '${uri[i]}' (charCode: ${uri.charCodeAt(i)})`);
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Workout.deleteMany({}),
      Meal.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@dietbuddy.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user with ID:', adminUser._id);

    // Create demo user
    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@dietbuddy.com',
      password: 'demo123',
      role: 'user'
    });
    console.log('Created demo user with ID:', demoUser._id);

    // Create sample workouts
    console.log('Creating sample workouts...');
    const workouts = await Workout.create([
      {
        name: 'Beginner Cardio',
        description: 'Low-impact cardio workout for beginners',
        category: 'cardio',
        difficulty: 'beginner',
        duration: '30 minutes',
        calories: 200,
        exercises: [
          {
            name: 'Walking',
            duration: '10 minutes',
            calories: 50
          },
          {
            name: 'Light Jogging',
            duration: '10 minutes',
            calories: 100
          },
          {
            name: 'Cool Down',
            duration: '10 minutes',
            calories: 50
          }
        ]
      },
      {
        name: 'Strength Training',
        description: 'Basic strength training workout',
        category: 'strength',
        difficulty: 'intermediate',
        duration: '45 minutes',
        calories: 300,
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 12,
            calories: 100
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 15,
            calories: 100
          },
          {
            name: 'Pull-ups',
            sets: 3,
            reps: 8,
            calories: 100
          }
        ]
      },
      {
        name: 'Yoga Flow',
        description: 'Relaxing yoga flow for flexibility',
        category: 'yoga',
        difficulty: 'beginner',
        duration: '20 minutes',
        calories: 150,
        exercises: [
          {
            name: 'Downward Dog',
            duration: '5 minutes',
            calories: 30
          },
          {
            name: 'Warrior Pose',
            duration: '10 minutes',
            calories: 80
          },
          {
            name: 'Child Pose',
            duration: '5 minutes',
            calories: 40
          }
        ]
      }
    ]);
    console.log(`Created ${workouts.length} sample workouts`);

    // Create sample meals
    console.log('Creating sample meals...');
    const meals = await Meal.create([
      {
        name: 'Healthy Breakfast Bowl',
        description: 'Nutritious breakfast bowl with oats and fruits',
        category: 'breakfast',
        type: 'vegetarian',
        calories: 350,
        nutrients: {
          protein: 15,
          carbs: 45,
          fat: 12
        },
        ingredients: [
          'Oats',
          'Banana',
          'Honey',
          'Almonds'
        ],
        instructions: [
          'Cook oats with water',
          'Top with sliced banana',
          'Drizzle honey',
          'Sprinkle almonds'
        ]
      },
      {
        name: 'Grilled Chicken Salad',
        description: 'High-protein salad with grilled chicken',
        category: 'lunch',
        type: 'non-vegetarian',
        calories: 450,
        nutrients: {
          protein: 35,
          carbs: 25,
          fat: 20
        },
        ingredients: [
          'Chicken breast',
          'Mixed greens',
          'Cherry tomatoes',
          'Olive oil'
        ],
        instructions: [
          'Grill chicken breast',
          'Mix with greens and tomatoes',
          'Dress with olive oil'
        ]
      },
      {
        name: 'Vegetable Curry',
        description: 'Flavorful vegetable curry with rice',
        category: 'dinner',
        type: 'vegetarian',
        calories: 500,
        nutrients: {
          protein: 12,
          carbs: 70,
          fat: 15
        },
        ingredients: [
          'Mixed vegetables',
          'Curry powder',
          'Coconut milk',
          'Basmati rice'
        ],
        instructions: [
          'Sauté vegetables',
          'Add curry powder and coconut milk',
          'Simmer until done',
          'Serve with rice'
        ]
      }
    ]);
    console.log(`Created ${meals.length} sample meals`);

    console.log('Database seeding completed successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error details:', error.stack);
    
    // Attempt to disconnect on error
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas after error');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 