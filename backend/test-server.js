const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running', 
    time: new Date().toISOString()
  });
});

// Mock meal endpoint
app.get('/api/meals/ideas/:category', (req, res) => {
  const { category } = req.params;
  
  const mealIdeas = {
    'Vegetarian': [
      { id: 'v1', name: 'Quinoa Buddha Bowl', calories: 420 },
      { id: 'v2', name: 'Spinach and Feta Stuffed Portobello', calories: 350 }
    ],
    'Non-Vegetarian': [
      { id: 'nv1', name: 'Grilled Chicken with Roasted Vegetables', calories: 450 },
      { id: 'nv2', name: 'Salmon and Asparagus', calories: 420 }
    ]
  };
  
  res.json({ 
    category,
    meals: mealIdeas[category] || []
  });
});

// Mock workout endpoint
app.get('/api/workouts/videos/:category', (req, res) => {
  const { category } = req.params;
  
  res.json({ 
    category,
    workoutPrograms: {
      beginner: [
        { id: 'b1', name: 'Easy Workout 1', duration: '15 min' },
        { id: 'b2', name: 'Easy Workout 2', duration: '20 min' }
      ],
      intermediate: [
        { id: 'i1', name: 'Medium Workout 1', duration: '30 min' },
        { id: 'i2', name: 'Medium Workout 2', duration: '35 min' }
      ],
      hardcore: [
        { id: 'h1', name: 'Hard Workout 1', duration: '45 min' },
        { id: 'h2', name: 'Hard Workout 2', duration: '60 min' }
      ]
    }
  });
});

// Start server
const PORT = 5008;
const HOST = 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`Test server running at http://${HOST}:${PORT}`);
  console.log(`Try: http://${HOST}:${PORT}/api/health`);
}); 