import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useApi from '../hooks/useApi';

// Workout plans based on fitness goals
const workoutPlans = {
  'Strength Training': [
    { day: 'Monday', name: 'Upper Body Focus', duration: '60 mins', exercises: ['Bench Press (4x8-10)', 'Overhead Press (3x8-10)', 'Bent Over Rows (3x10-12)', 'Lat Pulldowns (3x10-12)', 'Bicep Curls (3x12)', 'Tricep Extensions (3x12)'] },
    { day: 'Tuesday', name: 'Rest Day', duration: '', exercises: ['Light stretching or mobility work'] },
    { day: 'Wednesday', name: 'Lower Body Power', duration: '60 mins', exercises: ['Squats (4x8-10)', 'Deadlifts (3x6-8)', 'Leg Press (3x10-12)', 'Romanian Deadlifts (3x10)', 'Calf Raises (4x15)', 'Leg Curls (3x12)'] },
    { day: 'Thursday', name: 'Rest Day', duration: '', exercises: ['Light cardio or recovery session'] },
    { day: 'Friday', name: 'Compound Movement Focus', duration: '60 mins', exercises: ['Barbell Rows (4x8)', 'Pull-ups (3x max)', 'Dips (3x max)', 'Lunges with Dumbbells (3x10/leg)', 'Face Pulls (3x15)', 'Planks (3x60s)'] },
    { day: 'Saturday', name: 'Active Recovery', duration: '30 mins', exercises: ['Light cardio', 'Full body mobility', 'Foam rolling'] },
    { day: 'Sunday', name: 'Complete Rest', duration: '', exercises: ['Rest and recovery']}
  ],
  'Cardio': [
    { day: 'Monday', name: 'Aerobic Endurance', duration: '45-60 mins', exercises: ['5 min warm-up', '30-40 min steady-state running/cycling at 65-75% max HR', '5 min cool down', '10 min dynamic stretching'] },
    { day: 'Tuesday', name: 'Light Activity', duration: '30 mins', exercises: ['Walking', 'Light stretching', 'Mobility work'] },
    { day: 'Wednesday', name: 'Interval Training', duration: '40 mins', exercises: ['5 min warm-up', '30 sec sprint / 90 sec recovery x 10 rounds', '5 min cool down', 'Full body stretching routine'] },
    { day: 'Thursday', name: 'Active Recovery', duration: '30 mins', exercises: ['Leisure walking or cycling', 'Light yoga'] },
    { day: 'Friday', name: 'Cross Training', duration: '50 mins', exercises: ['Rowing (15 mins)', 'Cycling (15 mins)', 'Stair Climber (10 mins)', 'Elliptical (10 mins)', 'Comprehensive stretching'] },
    { day: 'Saturday', name: 'Long Duration', duration: '60-90 mins', exercises: ['Long run, bike ride, or swim at moderate intensity', 'Emphasis on endurance building'] },
    { day: 'Sunday', name: 'Rest Day', duration: '', exercises: ['Complete rest or very light activity']}
  ],
  'HIIT': [
    { day: 'Monday', name: 'Total Body Burn', duration: '35 mins', exercises: ['5 min dynamic warm-up', 'Circuit: 40s Burpees / 40s Mountain Climbers / 40s Jump Squats / 40s Push-ups / 40s Plank', '15s rest between exercises, 60s between rounds', '4 complete rounds', '5 min cool down'] },
    { day: 'Tuesday', name: 'Active Recovery', duration: '25 mins', exercises: ['Light cardio', 'Stretching', 'Foam rolling'] },
    { day: 'Wednesday', name: 'Tabata Protocol', duration: '25 mins', exercises: ['5 min warm-up', '8 rounds of: 20s max effort, 10s rest for each exercise', 'Exercises: High Knees, Kettlebell Swings, Squat Jumps, Push-up Variations', '5 min cool down'] },
    { day: 'Thursday', name: 'Low Intensity', duration: '30 mins', exercises: ['Light cardio', 'Mobility work', 'Stretching'] },
    { day: 'Friday', name: 'Metabolic Conditioning', duration: '40 mins', exercises: ['5 min mobility work', 'AMRAP in 20 mins: 15 Box Jumps, 12 Thrusters, 9 Pull-ups', 'Rest as needed', '5 min cooldown and stretching'] },
    { day: 'Saturday', name: 'Sprint Intervals', duration: '30 mins', exercises: ['5 min warm-up', '10-12 sprints: 20s max effort, 90s recovery', '5 min cool down'] },
    { day: 'Sunday', name: 'Rest Day', duration: '', exercises: ['Complete rest', 'Light stretching if desired']}
  ],
  'Flexibility': [
    { day: 'Monday', name: 'Dynamic Mobility Flow', duration: '45 mins', exercises: ['Joint Rotations (2 mins each joint)', 'Dynamic Stretching (10 mins)', 'Sun Salutations (5 rounds)', 'Standing Flow Sequence (15 mins)', 'Balance Poses (10 mins)', 'Cooldown (5 mins)'] },
    { day: 'Tuesday', name: 'Active Recovery', duration: '30 mins', exercises: ['Light walking', 'Basic stretching routine'] },
    { day: 'Wednesday', name: 'Yoga and Core Stability', duration: '60 mins', exercises: ['Pranayama Breathing (5 mins)', 'Vinyasa Flow (20 mins)', 'Core Focused Poses (15 mins)', 'Hip Opening Sequence (15 mins)', 'Savasana (5 mins)'] },
    { day: 'Thursday', name: 'Light Cardio and Stretch', duration: '30 mins', exercises: ['10-15 mins light cardio', '15-20 mins full body stretching'] },
    { day: 'Friday', name: 'Deep Stretch and Recovery', duration: '50 mins', exercises: ['Foam Rolling (10 mins)', 'Static Stretching (20 mins holding each pose 45-60s)', 'PNF Stretching Techniques (15 mins)', 'Meditation and Breathing (5 mins)'] },
    { day: 'Saturday', name: 'Pilates or Barre', duration: '45 mins', exercises: ['Pilates mat workout or barre class focusing on control and alignment'] },
    { day: 'Sunday', name: 'Gentle Yoga', duration: '40 mins', exercises: ['Restorative or yin yoga practice']}
  ]
};

const TrackingPanel = ({ user }) => {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [todayTracking, setTodayTracking] = useState({
    workoutCompleted: false,
    mealPlanFollowed: false,
    steps: 0
  });
  const [streaks, setStreaks] = useState({
    workout: 0,
    meal: 0
  });
  const [badges, setBadges] = useState([]);
  const [loginCount, setLoginCount] = useState(0);
  const [newSteps, setNewSteps] = useState('');
  const [stepsSubmitting, setStepsSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [mealImageUrl, setMealImageUrl] = useState('');
  const [showMealInput, setShowMealInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user?._id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Get streaks and achievements
      const streakData = await api.getStreaksAndAchievements();
      
      setStreaks(streakData.streaks || { workout: 0, meal: 0 });
      setBadges(streakData.badges || []);
      setLoginCount(streakData.loginCount || 0);
      
      // Get today's tracking data if it exists
      // This would come from the user's progress array for today
      let userData = user;
      if (!userData) {
        userData = await api.getProfile();
      }
      
      if (userData && userData.progress && userData.progress.length > 0) {
        // Find today's entry
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEntry = userData.progress.find(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
        
        if (todayEntry) {
          setTodayTracking({
            workoutCompleted: todayEntry.workoutCompleted || false,
            mealPlanFollowed: todayEntry.mealPlanFollowed || false,
            steps: todayEntry.steps || 0
          });
          
          // Set meal image URL if available
          if (todayEntry.mealImageUrl) {
            setMealImageUrl(todayEntry.mealImageUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = async (activityType) => {
    try {
      if (activityType !== 'workoutCompleted' && activityType !== 'mealPlanFollowed') {
        return;
      }
      
      const newValue = !todayTracking[activityType];
      
      // Optimistic UI update
      setTodayTracking(prev => ({
        ...prev,
        [activityType]: newValue
      }));
      
      console.log(`Tracking activity: ${activityType} = ${newValue}`);
      
      // Send to API
      const trackingData = { [activityType]: newValue };
      console.log('Sending tracking data to API:', trackingData);
      
      try {
        const result = await api.trackDailyActivity(trackingData);
        console.log('Activity tracking response:', result);
        
        // If the API returns updated streaks, update them
        if (result && result.streaks) {
          setStreaks(result.streaks);
        }
        
        // Check for new badges
        if (result && result.badges && result.badges.length > 0) {
          // Find badges that don't already exist in our state
          const newBadges = result.badges.filter(
            newBadge => !badges.some(existingBadge => existingBadge.id === newBadge.id)
          );
          
          if (newBadges.length > 0) {
            // Show animation for the first new badge
            setNewBadge(newBadges[0]);
            
            // Update badges state with all new badges
            setBadges(prev => [...prev, ...newBadges]);
            
            // Hide the badge animation after 5 seconds
            setTimeout(() => {
              setNewBadge(null);
            }, 5000);
          }
        }
      } catch (apiError) {
        console.error(`API Error in trackDailyActivity:`, apiError);
        throw apiError; // Rethrow to be caught by the outer try/catch
      }
    } catch (error) {
      console.error(`Error toggling ${activityType}:`, error);
      
      // Revert the optimistic update on error
      setTodayTracking(prev => ({
        ...prev,
        [activityType]: !prev[activityType]
      }));
      
      // Provide more specific error message
      let errorMessage = 'Failed to update your ';
      errorMessage += activityType === 'workoutCompleted' ? 'workout' : 'meal plan';
      errorMessage += ' status. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      // Alert user to the error
      alert(errorMessage);
      
      // Attempt to refresh the data
      fetchUserData();
    }
  };

  const handleStepsSubmit = async (e) => {
    e.preventDefault();
    if (!newSteps || isNaN(newSteps) || parseInt(newSteps) <= 0) {
      return;
    }
    
    try {
      setStepsSubmitting(true);
      const steps = parseInt(newSteps);
      
      // Track steps for rewards
      const result = await api.addStepsReward(steps);
      
      // Update today's tracking
      setTodayTracking(prev => ({
        ...prev,
        steps
      }));
      
      // Clear input
      setNewSteps('');
      
      // Refetch streaks in case steps affected them
      await fetchUserData();
      
      // Show a message or animation for coins earned
      if (result && result.coinsEarned > 0) {
        // You could show a toast or animation here
        console.log(`Earned ${result.coinsEarned} coins for steps!`);
      }
    } catch (error) {
      console.error('Error submitting steps:', error);
    } finally {
      setStepsSubmitting(false);
    }
  };

  const handleMealImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert('File size exceeds 5MB. Please select a smaller image.');
      return;
    }
    
    try {
      setIsUploading(true);
      console.log('Starting image upload process');
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          console.log('File read successful, preparing to upload');
          const base64Image = reader.result;
          
          // Upload image
          console.log('Uploading image to server...');
          const result = await api.uploadImage(base64Image);
          console.log('Upload result:', result);
          
          if (result && result.imageUrl) {
            console.log('Image uploaded successfully:', result.imageUrl);
            setMealImageUrl(result.imageUrl);
            
            // Ask user if they want to mark the meal plan as followed
            if (!todayTracking.mealPlanFollowed) {
              const markAsFollowed = window.confirm('Do you want to mark your meal plan as followed?');
              if (markAsFollowed) {
                console.log('Marking meal plan as followed');
                await handleActivityToggle('mealPlanFollowed');
              }
            }
            
            // Show success message
            alert('Meal photo uploaded successfully!');
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Error processing upload:', error);
          alert(`Failed to upload image: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
      setIsUploading(false);
    }
  };

  // Badge component for the achievement display
  const Badge = ({ badge, size = 'regular' }) => (
    <div className={`badge ${size === 'large' ? 'w-24 h-24' : 'w-16 h-16'} rounded-full flex items-center justify-center overflow-hidden relative`}>
      <div className={`absolute inset-0 ${getBadgeColor(badge.id)} opacity-20`}></div>
      <div className={`text-${size === 'large' ? '3xl' : 'xl'} font-bold`}>
        {getBadgeEmoji(badge.id)}
      </div>
    </div>
  );

  // Get badge color based on badge ID
  const getBadgeColor = (badgeId) => {
    if (badgeId.includes('day')) return 'bg-purple-500';
    if (badgeId.includes('streak')) return 'bg-green-500';
    if (badgeId.includes('meal')) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // Get badge emoji based on badge ID
  const getBadgeEmoji = (badgeId) => {
    if (badgeId === 'day1') return '🥇';
    if (badgeId === 'day5') return '🥈';
    if (badgeId === 'day10') return '🥉';
    if (badgeId === 'day30') return '💯';
    if (badgeId === 'day50') return '🏆';
    if (badgeId.includes('streak3')) return '🔥';
    if (badgeId.includes('streak7')) return '🔥🔥';
    if (badgeId.includes('streak30')) return '💯';
    if (badgeId === 'consistency') return '👑';
    if (badgeId === 'earlybird') return '🌅';
    if (badgeId === 'comeback') return '🔄';
    if (badgeId.includes('meal')) return '🍽️';
    return '🏅';
  };

  // Calculate circle stroke dash for progress circles
  const getCircleProgress = (value, max = 7) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = value / max;
    const dashoffset = circumference * (1 - progress);
    
    return {
      strokeDasharray: circumference,
      strokeDashoffset: dashoffset
    };
  };

  // Get today's workout based on the user's fitness goal
  const getTodaysWorkout = () => {
    if (!user?.fitnessGoal) return null;
    
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];
    
    const plan = workoutPlans[user.fitnessGoal] || [];
    return plan.find(workout => workout.day === todayName) || null;
  };
  
  // Get appropriate exercise icon based on workout type
  const getExerciseIcon = (exercise) => {
    if (exercise.includes('rest') || exercise.includes('Rest')) return '🛌';
    if (exercise.includes('cardio') || exercise.includes('run') || exercise.includes('sprint')) return '🏃';
    if (exercise.includes('stretch') || exercise.includes('yoga') || exercise.includes('mobility')) return '🧘';
    if (exercise.includes('Press') || exercise.includes('Bench') || exercise.includes('push')) return '💪';
    if (exercise.includes('Squat') || exercise.includes('Leg') || exercise.includes('Lunge')) return '🦵';
    if (exercise.includes('Pull') || exercise.includes('Row')) return '🏋️';
    if (exercise.includes('Curl') || exercise.includes('Bicep')) return '💪';
    if (exercise.includes('Plank') || exercise.includes('core')) return '🧍';
    return '⚡';
  };

  // Define workout types for the dropdown
  const workoutTypes = [
    { value: '', label: 'Select workout type' },
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'flexibility', label: 'Flexibility & Yoga' },
    { value: 'recovery', label: 'Active Recovery' }
  ];

  // Get meal recommendations based on workout type
  const getMealRecommendation = (workoutType) => {
    switch(workoutType) {
      case 'strength':
        return {
          title: "Strength Training Meal",
          description: "High protein with moderate carbs for muscle recovery",
          preMeal: "Pre-workout: Banana with 1 tbsp almond butter (30 mins before)",
          postMeal: "Post-workout: Protein shake with 25g protein and fast-digesting carbs"
        };
      case 'cardio':
        return {
          title: "Cardio-Optimized Meal",
          description: "Balanced carbs with moderate protein for endurance",
          preMeal: "Pre-workout: Apple or small orange (45 mins before)",
          postMeal: "Post-workout: Smoothie with fruits, yogurt and honey"
        };
      case 'hiit':
        return {
          title: "HIIT Performance Meal",
          description: "High energy with quick-digesting carbs and moderate protein",
          preMeal: "Pre-workout: Rice cake with honey (20 mins before)",
          postMeal: "Post-workout: Protein bar or smoothie with 2:1 carb to protein ratio"
        };
      case 'flexibility':
        return {
          title: "Yoga & Flexibility Meal",
          description: "Light, plant-based foods to enhance mobility",
          preMeal: "Pre-workout: Small handful of nuts or light yogurt (1 hour before)",
          postMeal: "Post-workout: Anti-inflammatory herbal tea with light fruit salad"
        };
      case 'recovery':
        return {
          title: "Recovery Day Meal",
          description: "Anti-inflammatory foods with balanced macros",
          preMeal: "Focus: Hydration with electrolytes throughout the day",
          postMeal: "Nutrient-dense foods like leafy greens, lean protein, and healthy fats"
        };
      default:
        return {
          title: "Select a workout type for meal recommendations",
          description: "Personalized meal suggestions based on your workout",
          preMeal: "",
          postMeal: ""
        };
    }
  };

  // Get a meal recommendation based on selected workout type
  const mealRecommendation = getMealRecommendation(selectedWorkoutType);

  if (loading) {
    return (
      <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-lg p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--color-light)] mb-6">
        Track Your Progress
      </h2>
      
      {/* Today's Tracking Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[var(--color-light)] mb-4">Today's Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Tracking */}
          <div className="bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-[var(--color-light)]">Workout</h4>
              <div className="flex gap-2">
                {todayTracking.workoutCompleted ? (
                  <span className="bg-green-600 bg-opacity-20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivityToggle('workoutCompleted')}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                      disabled={true}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[var(--color-light-alt)] text-sm mb-2">Have you completed today's workout?</p>
            <div className="bg-[var(--color-dark-alt)] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[var(--color-light)] text-sm">
                {todayTracking.workoutCompleted
                  ? 'Workout completed today! 💪'
                  : 'Mark as completed when done'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                todayTracking.workoutCompleted
                  ? 'bg-green-900 text-green-200'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {todayTracking.workoutCompleted ? 'Done' : 'Pending'}
              </span>
            </div>
          </div>
          
          {/* Meal Plan Tracking */}
          <div className="bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-[var(--color-light)]">Meal Plan</h4>
              <div className="flex gap-2">
                {todayTracking.mealPlanFollowed ? (
                  <span className="bg-green-600 bg-opacity-20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivityToggle('mealPlanFollowed')}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                      disabled={true}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[var(--color-light-alt)] text-sm mb-2">Did you follow your meal plan today?</p>
            
            {/* Meal Photo Upload */}
            <div className="mb-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Upload Meal Photo
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    console.log('File input changed:', e.target.files);
                    handleMealImageUpload(e);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                {mealImageUrl && (
                  <button
                    onClick={() => setMealImageUrl('')}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 rounded-lg flex items-center justify-center"
                    title="Remove uploaded photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <p className="text-xs text-[var(--color-light-alt)]">
                Upload a photo of your meal to share your progress
              </p>
            </div>
            
            {/* Show uploaded meal image */}
            {mealImageUrl && (
              <div className="mb-3 relative">
                <img 
                  src={mealImageUrl} 
                  alt="Today's meal" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                {todayTracking.mealPlanFollowed && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Verified ✓
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-[var(--color-dark-alt)] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[var(--color-light)] text-sm">
                {todayTracking.mealPlanFollowed
                  ? 'Meal plan followed today! 🍽️'
                  : 'Upload a photo of your meal'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                todayTracking.mealPlanFollowed
                  ? 'bg-green-900 text-green-200'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {todayTracking.mealPlanFollowed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Personalized Daily Workout - Only show for users with a fitness goal */}
        {user?.fitnessGoal && (
          <div className="mt-6 bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-[var(--color-light)]">Your Daily Workout Plan</h4>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-[var(--color-primary)] bg-opacity-20 text-[var(--color-primary)] text-xs">
                  {user.fitnessGoal}
                </span>
                <button 
                  onClick={() => window.location.href='/dashboard?showGoalDialog=true'}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md"
                >
                  Change Program
                </button>
              </div>
            </div>
            
            {/* Workout Type Selector */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-dark-alt)]">
              <label className="text-sm text-[var(--color-light-alt)] mb-1 block">
                Today's Workout Type
              </label>
              <div className="flex gap-2">
                <select 
                  value={selectedWorkoutType}
                  onChange={(e) => setSelectedWorkoutType(e.target.value)}
                  className="flex-1 bg-[var(--color-dark)] text-[var(--color-light)] border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                >
                  {workoutTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Display meal recommendation if workout type is selected */}
            {selectedWorkoutType && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--color-primary)] bg-opacity-10 border border-[var(--color-primary)] border-opacity-30">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[var(--color-primary)] font-medium text-sm">{mealRecommendation.title}</h5>
                  <span className="text-xs text-[var(--color-light-alt)] bg-[var(--color-dark)] px-2 py-0.5 rounded">Personalized</span>
                </div>
                <p className="text-[var(--color-light-alt)] text-xs mb-2">{mealRecommendation.description}</p>
                {mealRecommendation.preMeal && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-xs">⟡</span>
                    <p className="text-[var(--color-light-alt)] text-xs">{mealRecommendation.preMeal}</p>
                  </div>
                )}
                {mealRecommendation.postMeal && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 text-xs">⟡</span>
                    <p className="text-[var(--color-light-alt)] text-xs">{mealRecommendation.postMeal}</p>
                  </div>
                )}
              </div>
            )}
            
            {getTodaysWorkout() ? (
              <div>
                <div className="flex justify-between mb-3">
                  <div>
                    <h5 className="text-[var(--color-light)] font-medium">{getTodaysWorkout().name}</h5>
                    <p className="text-[var(--color-light-alt)] text-sm">
                      {getTodaysWorkout().duration ? `Duration: ${getTodaysWorkout().duration}` : 'Rest day'}
                    </p>
                  </div>
                  {todayTracking.workoutCompleted && (
                    <div className="bg-green-600 bg-opacity-20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 mt-4">
                  {getTodaysWorkout().exercises.map((exercise, index) => (
                    <div key={index} className="bg-[var(--color-dark-alt)] p-3 rounded-lg flex items-center">
                      <span className="text-lg mr-3">{getExerciseIcon(exercise)}</span>
                      <span className="text-[var(--color-light)] text-sm">{exercise}</span>
                    </div>
                  ))}
                </div>
                
                {/* Weekly workout schedule */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h6 className="text-sm font-medium text-[var(--color-light)] mb-3">Weekly Program</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {workoutPlans[user.fitnessGoal].map((dayPlan, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-md ${
                          dayPlan.day === getTodaysWorkout().day
                          ? 'bg-[var(--color-primary)] bg-opacity-10 border border-[var(--color-primary)] border-opacity-30'
                          : 'bg-[var(--color-dark-alt)]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-[var(--color-light)]">{dayPlan.day}</span>
                          <span className="text-xs text-[var(--color-light-alt)]">{dayPlan.duration || 'Rest'}</span>
                        </div>
                        <p className={`text-xs mt-1 ${
                          dayPlan.day === getTodaysWorkout().day
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-light-alt)]'
                        }`}>
                          {dayPlan.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {!todayTracking.workoutCompleted && (
                  <button
                    onClick={() => handleActivityToggle('workoutCompleted')}
                    className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white w-full py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mark Workout Complete
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-[var(--color-light-alt)]">
                No workout scheduled for today or fitness goal not set.
              </div>
            )}
          </div>
        )}
        
        {/* Step Tracking */}
        <div className="mt-4 bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-medium text-[var(--color-light)] mb-3">Daily Steps</h4>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1">
              <form onSubmit={handleStepsSubmit} className="flex">
                <input
                  type="number"
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  className="flex-1 bg-[var(--color-dark-alt)] border border-gray-700 rounded-l-lg px-3 py-2 text-[var(--color-light)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Enter today's steps"
                />
                <button
                  type="submit"
                  disabled={stepsSubmitting}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-r-lg flex items-center justify-center"
                >
                  {stepsSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </form>
              <p className="text-xs text-[var(--color-light-alt)] mt-1">
                Every 1000 steps earns you 1 coin!
              </p>
            </div>
            <div className="md:w-40 bg-[var(--color-dark-alt)] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[var(--color-light)]">Today's Steps:</span>
              <span className="text-[var(--color-primary)] font-bold">{todayTracking.steps}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Streak and Achievement Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Streak Circles */}
        <div className="md:col-span-2 bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
          <h3 className="text-xl font-semibold text-[var(--color-light)] mb-4">Current Streaks</h3>
          <div className="flex justify-around">
            {/* Workout Streak */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="rgba(34, 197, 94, 0.2)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    {...getCircleProgress(streaks.workout)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[var(--color-light)]">{streaks.workout}</span>
                  <span className="text-xs text-[var(--color-light-alt)]">Days</span>
                </div>
              </div>
              <p className="mt-2 text-center text-[var(--color-light)]">Workout Streak</p>
              {streaks.workout >= 3 && (
                <div className="mt-1 text-center">
                  <span className="text-yellow-500 text-xl">
                    {streaks.workout >= 30 ? '💯' : streaks.workout >= 7 ? '🔥🔥' : '🔥'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Meal Plan Streak */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="rgba(234, 179, 8, 0.2)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#eab308" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    {...getCircleProgress(streaks.meal)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[var(--color-light)]">{streaks.meal}</span>
                  <span className="text-xs text-[var(--color-light-alt)]">Days</span>
                </div>
              </div>
              <p className="mt-2 text-center text-[var(--color-light)]">Meal Plan Streak</p>
              {streaks.meal >= 3 && (
                <div className="mt-1 text-center">
                  <span className="text-yellow-500 text-xl">
                    {streaks.meal >= 10 ? '🍽️' : streaks.meal >= 7 ? '🥗🥗' : '🥗'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Achievements Gallery */}
        <div className="md:col-span-3 bg-[var(--color-dark)] rounded-lg p-4 border border-gray-700">
          <h3 className="text-xl font-semibold text-[var(--color-light)] mb-4">My Achievements</h3>
          {badges.length === 0 ? (
            <div className="h-36 flex items-center justify-center">
              <p className="text-[var(--color-light-alt)] text-center">
                Complete your first activity to earn badges!<br/>
                <span className="text-sm">Track workouts, meals and steps to earn achievements</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <Badge badge={badge} />
                  <span className="mt-2 text-xs text-center text-[var(--color-light)]">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Show login count */}
          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
            <span className="text-sm text-[var(--color-light-alt)]">Total Activity Days:</span>
            <span className="text-[var(--color-light)] font-medium">{loginCount} days</span>
          </div>
        </div>
      </div>
      
      {/* New Badge Animation */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
          >
            <motion.div 
              className="bg-[var(--color-dark-alt)] rounded-xl p-8 shadow-xl max-w-sm w-full mx-4"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-4 text-lg text-[var(--color-light)]">New Achievement Unlocked!</div>
                <Badge badge={newBadge} size="large" />
                <div className="mt-4 text-xl font-bold text-[var(--color-light)]">{newBadge.name}</div>
                <div className="mt-2 text-[var(--color-light-alt)] text-center">{newBadge.description}</div>
                <button 
                  onClick={() => setNewBadge(null)}
                  className="mt-6 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackingPanel; 