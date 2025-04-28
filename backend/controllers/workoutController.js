const Workout = require('../models/Workout');

// Fallback data for when database isn't available
const fallbackWorkouts = [
  {
    _id: '1',
    name: 'Full Body HIIT',
    description: 'High intensity interval training targeting all major muscle groups',
    category: 'HIIT',
    difficulty: 'intermediate',
    duration: 30,
    calories: 350,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: 20, duration: 60 },
      { name: 'Push-Ups', sets: 3, reps: 15, duration: 60 },
      { name: 'Mountain Climbers', sets: 3, reps: 20, duration: 60 },
      { name: 'Burpees', sets: 3, reps: 10, duration: 60 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    videoUrl: 'https://youtube.com/watch?v=ml6cT4AZdqI',
    isFeatured: true,
    tags: ['hiit', 'cardio', 'full body']
  },
  {
    _id: '2',
    name: 'Core Crusher',
    description: 'Intense abdominal workout focusing on building core strength',
    category: 'Calisthenics',
    difficulty: 'beginner',
    duration: 20,
    calories: 200,
    exercises: [
      { name: 'Crunches', sets: 3, reps: 20, duration: 60 },
      { name: 'Planks', sets: 3, reps: 1, duration: 60 },
      { name: 'Russian Twists', sets: 3, reps: 20, duration: 60 },
      { name: 'Leg Raises', sets: 3, reps: 15, duration: 60 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    videoUrl: 'https://youtube.com/watch?v=DHD1-2P94DI',
    isFeatured: true,
    tags: ['abs', 'core', 'strength']
  },
  {
    _id: '3',
    name: 'Power Lifts',
    description: 'Basic compound movements for building strength and muscle',
    category: 'Muscle Building',
    difficulty: 'hardcore',
    duration: 45,
    calories: 450,
    exercises: [
      { name: 'Deadlifts', sets: 5, reps: 5, duration: 120 },
      { name: 'Bench Press', sets: 5, reps: 5, duration: 120 },
      { name: 'Squats', sets: 5, reps: 5, duration: 120 },
      { name: 'Overhead Press', sets: 5, reps: 5, duration: 120 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    videoUrl: 'https://youtube.com/watch?v=pRyytPjhXCo',
    isFeatured: false,
    tags: ['strength', 'muscle', 'powerlifting']
  }
];

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all workouts
exports.getAllWorkouts = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getAllWorkouts');
      return res.json(fallbackWorkouts);
    }
    
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.json(fallbackWorkouts);
  }
};

// Get workout by ID
exports.getWorkoutById = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getWorkoutById: ${req.params.id}`);
      const workout = fallbackWorkouts.find(w => w._id === req.params.id);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      return res.json(workout);
    }
    
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    const workout = fallbackWorkouts.find(w => w._id === req.params.id);
    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  }
};

// Get workouts by category
exports.getWorkoutsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getWorkoutsByCategory: ${category}`);
      return res.json(fallbackWorkouts.filter(w => w.category === category));
    }
    
    const workouts = await Workout.find({ category }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts by category:', error);
    const { category } = req.params;
    res.json(fallbackWorkouts.filter(w => w.category === category));
  }
};

// Get workouts by difficulty
exports.getWorkoutsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getWorkoutsByDifficulty: ${difficulty}`);
      return res.json(fallbackWorkouts.filter(w => w.difficulty === difficulty));
    }
    
    const workouts = await Workout.find({ difficulty }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts by difficulty:', error);
    const { difficulty } = req.params;
    res.json(fallbackWorkouts.filter(w => w.difficulty === difficulty));
  }
};

// Get workouts by category and difficulty
exports.getWorkoutsByCategoryAndDifficulty = async (req, res) => {
  try {
    const { category, difficulty } = req.params;
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for getWorkoutsByCategoryAndDifficulty: ${category}, ${difficulty}`);
      return res.json(fallbackWorkouts.filter(w => w.category === category && w.difficulty === difficulty));
    }
    
    const workouts = await Workout.find({ category, difficulty }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts by category and difficulty:', error);
    const { category, difficulty } = req.params;
    res.json(fallbackWorkouts.filter(w => w.category === category && w.difficulty === difficulty));
  }
};

// Create a new workout
exports.createWorkout = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot create workout.' });
    }
    
    const {
      name, description, category, difficulty, 
      duration, calories, exercises, imageUrl, videoUrl, tags
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !difficulty || !duration || !calories) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          description: !description ? 'Description is required' : null,
          category: !category ? 'Category is required' : null,
          difficulty: !difficulty ? 'Difficulty is required' : null,
          duration: !duration ? 'Duration is required' : null,
          calories: !calories ? 'Calories is required' : null
        }
      });
    }

    // Create workout object
    const workoutData = {
      name,
      description,
      category,
      difficulty,
      duration,
      calories,
      exercises: exercises || [],
      imageUrl,
      videoUrl,
      tags: tags || []
    };

    // Add creator if authenticated
    if (req.user && req.user.userId) {
      workoutData.createdBy = req.user.userId;
    }

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a workout
exports.updateWorkout = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot update workout.' });
    }
    
    const {
      name, description, category, difficulty, 
      duration, calories, exercises, imageUrl, videoUrl, tags
    } = req.body;

    // Find workout first
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check authorization if createdBy exists
    if (workout.createdBy && req.user && workout.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }

    // Update fields
    if (name) workout.name = name;
    if (description) workout.description = description;
    if (category) workout.category = category;
    if (difficulty) workout.difficulty = difficulty;
    if (duration) workout.duration = duration;
    if (calories) workout.calories = calories;
    if (exercises) workout.exercises = exercises;
    if (imageUrl) workout.imageUrl = imageUrl;
    if (videoUrl) workout.videoUrl = videoUrl;
    if (tags) workout.tags = tags;

    await workout.save();

    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a workout
exports.deleteWorkout = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database not available. Cannot delete workout.' });
    }
    
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check authorization if createdBy exists
    if (workout.createdBy && req.user && workout.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this workout' });
    }

    await workout.deleteOne();  // .remove() is deprecated, using deleteOne

    res.json({ message: 'Workout removed' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get featured workouts
exports.getFeaturedWorkouts = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      console.log('Using fallback data for getFeaturedWorkouts');
      return res.json(fallbackWorkouts.filter(w => w.isFeatured));
    }
    
    const workouts = await Workout.find({ isFeatured: true }).limit(5);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching featured workouts:', error);
    res.json(fallbackWorkouts.filter(w => w.isFeatured));
  }
};

// Search workouts
exports.searchWorkouts = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!isDatabaseConnected()) {
      console.log(`Using fallback data for searchWorkouts: ${query}`);
      const filtered = fallbackWorkouts.filter(w => 
        w.name.toLowerCase().includes(query.toLowerCase()) || 
        w.description.toLowerCase().includes(query.toLowerCase()) ||
        w.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      return res.json(filtered);
    }
    
    const workouts = await Workout.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error searching workouts:', error);
    const { query } = req.params;
    const filtered = fallbackWorkouts.filter(w => 
      w.name.toLowerCase().includes(query.toLowerCase()) || 
      w.description.toLowerCase().includes(query.toLowerCase()) ||
      w.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    res.json(filtered);
  }
}; 