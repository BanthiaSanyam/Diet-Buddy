import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = 'https://dietbuddy-ilq5.onrender.com/api';

// Default categories with descriptions and image URLs
const defaultWorkoutCategories = [
  {
    name: 'Weight Loss',
    description: 'High-intensity workouts focused on burning calories',
    position: 1, // Top left
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    name: 'Muscle Building',
    description: 'Resistance training to increase muscle mass',
    position: 2, // Top right
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    name: 'Calisthenics',
    description: 'Body weight exercises to improve strength and flexibility',
    position: 3, // Bottom left
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80'
  },
  {
    name: 'HIIT',
    description: 'High-Intensity Interval Training for maximum calorie burn',
    position: 4, // Bottom right
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  }
];

const Workouts = () => {
  const [workoutCategories] = useState(defaultWorkoutCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null); 
  const [workoutPrograms, setWorkoutPrograms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      const category = workoutCategories.find(
        cat => cat.name.toLowerCase() === categoryParam.toLowerCase()
      );
      
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [location.search, workoutCategories]);
  
  // Fetch workout data when a category is selected
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/workouts/videos/${selectedCategory.name}`);
        console.log('Workout data:', response.data);
        
        if (response.data && response.data.workoutPrograms) {
          setWorkoutPrograms(response.data.workoutPrograms);
        } else {
          throw new Error('Invalid data format received from server');
        }
        
        setSelectedDifficulty(null);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workout programs. Please try again.');
        setWorkoutPrograms(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [selectedCategory]);
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Update the URL with the selected category
    navigate(`/workouts?category=${category.name}`);
  };
  
  const handleBack = () => {
    if (selectedDifficulty) {
      setSelectedDifficulty(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setWorkoutPrograms(null);
      // Remove category from URL
      navigate('/workouts');
    }
  };
  
  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };
  
  // Function to group exercises by body part
  const groupExercisesByBodyPart = (exercises) => {
    if (!exercises) return {};
    
    return exercises.reduce((groups, exercise) => {
      if (!exercise.bodyPart) return groups;
      
      if (!groups[exercise.bodyPart]) {
        groups[exercise.bodyPart] = [];
      }
      
      groups[exercise.bodyPart].push(exercise);
      return groups;
    }, {});
  };
  
  // Add smooth scrolling
  const smoothScroll = () => {
    document.documentElement.style.scrollBehavior = 'smooth';
  };

  useEffect(() => {
    smoothScroll();
  }, []);
  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[var(--color-light)] text-center my-12"
      >
        <span className="text-[var(--color-primary)]">Workout</span> Categories
      </motion.h1>
      
      {!selectedCategory ? (
        // Category selection screen with 2x2 grid
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sort categories by position and map them */}
          {[...workoutCategories]
            .sort((a, b) => a.position - b.position)
            .map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 shadow-lg h-full relative"
                onClick={() => handleCategorySelect(category)}
              >
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover absolute"
                />
                <div className="p-10 flex flex-col h-full items-center justify-center relative z-10 bg-black bg-opacity-60">
                  <h2 className="text-2xl font-semibold text-white mb-2">{category.name}</h2>
                  <p className="text-white text-center">{category.description}</p>
                </div>
              </motion.div>
          ))}
        </div>
      ) : !selectedDifficulty ? (
        // Difficulty level selection
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <button 
              onClick={handleBack}
              className="text-[var(--color-primary-light)] hover:text-[var(--color-primary)] mb-6 flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to all workouts</span>
            </button>
            <div className="premium-card p-8 mb-10">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">
                  <img 
                    src={selectedCategory.image} 
                    alt={selectedCategory.name} 
                    className="w-24 h-24 object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[var(--color-light)] mb-1">{selectedCategory.name}</h2>
                  <p className="text-[var(--color-light-alt)]">{selectedCategory.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-20 p-6 rounded-xl text-[var(--color-light)] text-center border border-red-500 border-opacity-20">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {workoutPrograms && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] border border-green-500 border-opacity-20 rounded-xl cursor-pointer hover:border-green-500 hover:border-opacity-40 transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleDifficultySelect('beginner')}
                  >
                    <div className="relative p-8">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                      <h3 className="text-2xl font-semibold text-[var(--color-light)] mb-3">Beginner</h3>
                      <p className="text-[var(--color-light-alt)] mb-6">Perfect for those just starting their fitness journey</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors shadow-lg">
                        View Beginner Exercises
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] border border-yellow-500 border-opacity-20 rounded-xl cursor-pointer hover:border-yellow-500 hover:border-opacity-40 transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleDifficultySelect('intermediate')}
                  >
                    <div className="relative p-8">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                      <h3 className="text-2xl font-semibold text-[var(--color-light)] mb-3">Intermediate</h3>
                      <p className="text-[var(--color-light-alt)] mb-6">For those with some fitness experience looking for a challenge</p>
                      <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors shadow-lg">
                        View Intermediate Exercises
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[var(--color-dark-alt)] to-[var(--color-dark)] border border-red-500 border-opacity-20 rounded-xl cursor-pointer hover:border-red-500 hover:border-opacity-40 transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleDifficultySelect('hardcore')}
                  >
                    <div className="relative p-8">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                      <h3 className="text-2xl font-semibold text-[var(--color-light)] mb-3">Hardcore</h3>
                      <p className="text-[var(--color-light-alt)] mb-6">Intense workouts for fitness enthusiasts seeking maximum results</p>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-lg">
                        View Hardcore Exercises
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        // Exercise list for selected difficulty
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <button 
              onClick={handleBack}
              className="text-[var(--color-primary-light)] hover:text-[var(--color-primary)] mb-6 flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to difficulty levels</span>
            </button>
            <div className="premium-card p-8 mb-10">
              <div className="flex items-center mb-1">
                <h2 className="text-3xl font-bold text-[var(--color-light)] mr-3">{selectedCategory.name}</h2>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedDifficulty === 'beginner' ? 'bg-green-600' : 
                  selectedDifficulty === 'intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </span>
              </div>
              <p className="text-[var(--color-light-alt)]">Complete these exercises for an effective workout routine</p>
            </div>
          </motion.div>
          
          {/* Render exercises grouped by body part for Muscle Building and Calisthenics */}
          {(selectedCategory.name === 'Muscle Building' || selectedCategory.name === 'Calisthenics') && workoutPrograms && workoutPrograms[selectedDifficulty] ? (
            <div className="space-y-8 mb-10">
              {Object.entries(groupExercisesByBodyPart(workoutPrograms[selectedDifficulty])).map(([bodyPart, exercises], index) => (
                <motion.div
                  key={bodyPart}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl overflow-hidden bg-[var(--color-dark-alt)] shadow-lg"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">{bodyPart}</h3>
                    <div className="space-y-6">
                      {exercises.map((exercise, idx) => (
                        <div 
                          key={exercise.id || idx} 
                          className="bg-[var(--color-dark)] p-6 rounded-lg mb-4"
                        >
                          <h4 className="text-xl font-semibold text-[var(--color-light)] mb-4">{exercise.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[var(--color-light-alt)] mb-2">
                                <span className="text-[var(--color-primary-light)]">Duration/Reps:</span> {exercise.duration}
                              </p>
                              {exercise.calories && (
                                <p className="text-[var(--color-light-alt)] mb-2">
                                  <span className="text-[var(--color-primary-light)]">Calories:</span> {exercise.calories}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-[var(--color-light-alt)] mb-4">{exercise.description}</p>
                              <a 
                                href={exercise.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg"
                              >
                                Watch Tutorial
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Regular display for other workout categories
            <div className="space-y-6 mb-10">
              {workoutPrograms && workoutPrograms[selectedDifficulty] && 
                workoutPrograms[selectedDifficulty].map((exercise, index) => (
                  <motion.div
                    key={exercise.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.1, 0.5) }}
                    className="rounded-xl overflow-hidden shadow-lg mb-6"
                  >
                    <div className="p-6 bg-[var(--color-dark-alt)]">
                      <h3 className="text-xl font-semibold text-[var(--color-light)] mb-4">{exercise.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[var(--color-light-alt)] mb-2">
                            <span className="text-[var(--color-primary-light)]">Duration/Reps:</span> {exercise.duration}
                          </p>
                          {exercise.calories && (
                            <p className="text-[var(--color-light-alt)] mb-2">
                              <span className="text-[var(--color-primary-light)]">Calories:</span> {exercise.calories}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--color-light-alt)] mb-4">{exercise.description}</p>
                          <a 
                            href={exercise.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg"
                          >
                            Watch Tutorial
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Workouts; 
