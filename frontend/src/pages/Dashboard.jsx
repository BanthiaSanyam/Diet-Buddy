import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Link, useLocation } from 'react-router-dom';
import TrackingPanel from '../components/TrackingPanel';
import MealRecommendation from './mealRecomm';
import React from 'react';
import MembershipStatus from '../components/MembershipStatus';
import StatsPage from './statepage';
import DashboardTabs from './dashboardtabs';
import FoodAnalyzer from './Buttondatapred';

const workoutCategories = [
  { id: 1, name: 'Strength Training', description: 'Build muscle and increase strength' },
  { id: 2, name: 'Cardio', description: 'Improve heart health and burn calories' },
  { id: 3, name: 'HIIT', description: 'High intensity interval training for maximum results' },
  { id: 4, name: 'Flexibility', description: 'Enhance mobility, balance and reduce injury risk' }
];

const generateWorkoutPlan = (category) => {
  // More targeted workout routines based on specific fitness goals
  const workoutPlans = {
    'Strength Training': [
      { day: 'Monday', name: 'Upper Body Focus', duration: '60 mins', exercises: ['Bench Press (4x8-10)', 'Overhead Press (3x8-10)', 'Bent Over Rows (3x10-12)', 'Lat Pulldowns (3x10-12)', 'Bicep Curls (3x12)', 'Tricep Extensions (3x12)'] },
      { day: 'Wednesday', name: 'Lower Body Power', duration: '60 mins', exercises: ['Squats (4x8-10)', 'Deadlifts (3x6-8)', 'Leg Press (3x10-12)', 'Romanian Deadlifts (3x10)', 'Calf Raises (4x15)', 'Leg Curls (3x12)'] },
      { day: 'Friday', name: 'Compound Movement Focus', duration: '60 mins', exercises: ['Barbell Rows (4x8)', 'Pull-ups (3x max)', 'Dips (3x max)', 'Lunges with Dumbbells (3x10/leg)', 'Face Pulls (3x15)', 'Planks (3x60s)'] }
    ],
    'Cardio': [
      { day: 'Monday', name: 'Aerobic Endurance', duration: '45-60 mins', exercises: ['5 min warm-up', '30-40 min steady-state running/cycling at 65-75% max HR', '5 min cool down', '10 min dynamic stretching'] },
      { day: 'Wednesday', name: 'Interval Training', duration: '40 mins', exercises: ['5 min warm-up', '30 sec sprint / 90 sec recovery x 10 rounds', '5 min cool down', 'Full body stretching routine'] },
      { day: 'Friday', name: 'Cross Training', duration: '50 mins', exercises: ['Rowing (15 mins)', 'Cycling (15 mins)', 'Stair Climber (10 mins)', 'Elliptical (10 mins)', 'Comprehensive stretching'] }
    ],
    'HIIT': [
      { day: 'Monday', name: 'Total Body Burn', duration: '35 mins', exercises: ['5 min dynamic warm-up', 'Circuit: 40s Burpees / 40s Mountain Climbers / 40s Jump Squats / 40s Push-ups / 40s Plank', '15s rest between exercises, 60s between rounds', '4 complete rounds', '5 min cool down'] },
      { day: 'Wednesday', name: 'Tabata Protocol', duration: '25 mins', exercises: ['5 min warm-up', '8 rounds of: 20s max effort, 10s rest for each exercise', 'Exercises: High Knees, Kettlebell Swings, Squat Jumps, Push-up Variations', '5 min cool down'] },
      { day: 'Friday', name: 'Metabolic Conditioning', duration: '40 mins', exercises: ['5 min mobility work', 'AMRAP in 20 mins: 15 Box Jumps, 12 Thrusters, 9 Pull-ups', 'Rest as needed', '5 min cooldown and stretching'] }
    ],
    'Flexibility': [
      { day: 'Monday', name: 'Dynamic Mobility Flow', duration: '45 mins', exercises: ['Joint Rotations (2 mins each joint)', 'Dynamic Stretching (10 mins)', 'Sun Salutations (5 rounds)', 'Standing Flow Sequence (15 mins)', 'Balance Poses (10 mins)', 'Cooldown (5 mins)'] },
      { day: 'Wednesday', name: 'Yoga and Core Stability', duration: '60 mins', exercises: ['Pranayama Breathing (5 mins)', 'Vinyasa Flow (20 mins)', 'Core Focused Poses (15 mins)', 'Hip Opening Sequence (15 mins)', 'Savasana (5 mins)'] },
      { day: 'Friday', name: 'Deep Stretch and Recovery', duration: '50 mins', exercises: ['Foam Rolling (10 mins)', 'Static Stretching (20 mins holding each pose 45-60s)', 'PNF Stretching Techniques (15 mins)', 'Meditation and Breathing (5 mins)'] }
    ]
  };

  return workoutPlans[category] || [];
};

const generateMealPlan = (goal) => {
  // Targeted meal plans based on specific fitness goals
  const mealPlans = {
    'Strength Training': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Protein-Rich Breakfast', calories: 550, description: 'Eggs (4 whites, 2 whole), oatmeal with berries, Greek yogurt with honey and nuts' },
          { name: 'Mid-Morning Snack', calories: 250, description: 'Protein shake with banana and peanut butter' },
          { name: 'Muscle-Building Lunch', calories: 650, description: 'Grilled chicken breast (6 oz), brown rice (1 cup), mixed vegetables, avocado' },
          { name: 'Pre-Workout Snack', calories: 200, description: 'Apple with almond butter or rice cakes with tuna' },
          { name: 'Post-Workout Recovery', calories: 350, description: 'Whey protein shake with dextrose/maltodextrin for glycogen replenishment' },
          { name: 'Protein-Focused Dinner', calories: 550, description: 'Salmon/lean beef (6 oz), sweet potato, roasted vegetables, olive oil' }
        ]
      }
    ],
    'Cardio': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Light Energy Breakfast', calories: 400, description: 'Whole grain toast with avocado, poached egg, and fruit' },
          { name: 'Mid-Morning Fuel', calories: 150, description: 'Banana with a small handful of nuts or apple with string cheese' },
          { name: 'Balanced Lunch', calories: 450, description: 'Mediterranean salad with grilled chicken, olive oil and balsamic vinegar, whole grain roll' },
          { name: 'Afternoon Energy Boost', calories: 200, description: 'Greek yogurt with berries or hummus with vegetable sticks' },
          { name: 'Light Pre-Cardio Snack', calories: 100, description: 'Small piece of fruit or half energy bar 30-45 mins before workout' },
          { name: 'Recovery Dinner', calories: 500, description: 'Baked fish, quinoa, steamed vegetables, and leafy green salad' }
        ]
      }
    ],
    'HIIT': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Power Breakfast', calories: 450, description: 'Protein pancakes made with oats, egg whites, and protein powder topped with fruit' },
          { name: 'Mid-Morning Stabilizer', calories: 200, description: 'Apple with 1-2 tbsp natural almond butter' },
          { name: 'Balanced Energy Lunch', calories: 550, description: 'Lean turkey or chicken wrap with avocado, vegetables, and a side of sweet potato' },
          { name: 'Pre-HIIT Fuel', calories: 200, description: 'Rice cake with honey or half banana with small protein shake (1 hour before workout)' },
          { name: 'Immediate Post-Workout', calories: 300, description: 'Protein shake with easily digestible carbs like banana or dextrose' },
          { name: 'Recovery Dinner', calories: 500, description: 'Lean protein source, complex carbs like brown rice or quinoa, and anti-inflammatory vegetables' }
        ]
      }
    ],
    'Flexibility': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Anti-Inflammatory Breakfast', calories: 350, description: 'Smoothie with berries, spinach, flaxseed, ginger, turmeric, and plant protein' },
          { name: 'Hydrating Mid-Morning', calories: 150, description: 'Fresh fruit with coconut water or green tea with honey' },
          { name: 'Plant-Based Lunch', calories: 400, description: 'Quinoa bowl with roasted vegetables, avocado, nuts, and seeds with olive oil dressing' },
          { name: 'Flexibility Support Snack', calories: 180, description: 'Chia seed pudding with berries or celery with almond butter' },
          { name: 'Hydration Boost', calories: 100, description: 'Coconut water with lemon or fresh vegetable juice' },
          { name: 'Light Anti-Inflammatory Dinner', calories: 450, description: 'Grilled fish with turmeric and ginger, steamed vegetables, and quinoa or sweet potato' }
        ]
      }
    ]
  };

  return mealPlans[goal] || [];
};

const generateIndianMealPlan = (goal) => {
  // Targeted Indian meal plans based on specific fitness goals
  const indianMealPlans = {
    'Strength Training': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Protein-Rich Breakfast', calories: 550, description: 'Paneer bhurji with whole wheat parathas, sprouts salad, and a glass of buttermilk' },
          { name: 'Mid-Morning Snack', calories: 250, description: 'Paneer tikka (4-5 pieces) with mint chutney or roasted chana with spices' },
          { name: 'Muscle-Building Lunch', calories: 650, description: 'Chicken curry (or paneer curry for vegetarians), brown rice, dal, and mixed vegetable sabzi' },
          { name: 'Pre-Workout Snack', calories: 200, description: 'Ragi porridge with nuts or multigrain roti wrap with paneer filling' },
          { name: 'Post-Workout Recovery', calories: 350, description: 'Homemade protein shake with milk, banana, and 1 tbsp peanut butter' },
          { name: 'Protein-Focused Dinner', calories: 550, description: 'Tandoori fish (or soya chunks masala for vegetarians), jowar roti, vegetable raita, and palak paneer' }
        ]
      }
    ],
    'Cardio': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Light Energy Breakfast', calories: 400, description: 'Vegetable upma, idli with sambar, or masala oats with vegetables and a small bowl of fruits' },
          { name: 'Mid-Morning Fuel', calories: 150, description: 'Fruit chaat with a handful of mixed nuts or roasted makhana (fox nuts)' },
          { name: 'Balanced Lunch', calories: 450, description: 'Multigrain roti, moong dal, mixed vegetable sabzi, and a small bowl of curd' },
          { name: 'Afternoon Energy Boost', calories: 200, description: 'Dhokla with green chutney or cucumber and carrot sticks with hummus' },
          { name: 'Light Pre-Cardio Snack', calories: 100, description: 'A small banana or a piece of jaggery with roasted sesame seeds' },
          { name: 'Recovery Dinner', calories: 500, description: 'Grilled fish curry (or rajma for vegetarians), brown rice, cucumber raita, and stir-fried vegetables' }
        ]
      }
    ],
    'HIIT': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Power Breakfast', calories: 450, description: 'Vegetable poha with sprouts or besan cheela with paneer stuffing and a glass of lassi' },
          { name: 'Mid-Morning Stabilizer', calories: 200, description: 'Ragi cookies or nuts and seed mix with jaggery' },
          { name: 'Balanced Energy Lunch', calories: 550, description: 'Chicken/paneer tikka wrap with whole wheat roti, green chutney, and a side of mixed vegetable salad' },
          { name: 'Pre-HIIT Fuel', calories: 200, description: 'A small bowl of muesli with milk or a paratha with minimal oil' },
          { name: 'Immediate Post-Workout', calories: 300, description: 'Homemade protein shake with milk, banana, and honey' },
          { name: 'Recovery Dinner', calories: 500, description: 'Grilled chicken (or tofu/paneer for vegetarians), quinoa pulao, dal, and a side of seasonal vegetable sabzi' }
        ]
      }
    ],
    'Flexibility': [
      {
        day: 'Daily Plan', meals: [
          { name: 'Anti-Inflammatory Breakfast', calories: 350, description: 'Turmeric milk with overnight soaked oats topped with fresh fruits and honey' },
          { name: 'Hydrating Mid-Morning', calories: 150, description: 'Coconut water with a handful of soaked almonds or fresh fruit with a dash of rock salt' },
          { name: 'Plant-Based Lunch', calories: 400, description: 'Khichdi with vegetables, a side of kadhi, and cucumber raita' },
          { name: 'Flexibility Support Snack', calories: 180, description: 'Homemade trail mix with nuts, seeds, and dried fruits or roasted makhana' },
          { name: 'Hydration Boost', calories: 100, description: 'Fresh lime water with mint and honey or fresh amla juice' },
          { name: 'Light Anti-Inflammatory Dinner', calories: 450, description: 'Steamed fish (or mixed vegetable daliya for vegetarians) with minimal spices, lightly sautéed vegetables, and a small bowl of curd' }
        ]
      }
    ]
  };

  return indianMealPlans[goal] || [];
};

const Dashboard = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const {
    loading,
    getAllWorkouts: apiGetAllWorkouts,
    getFeaturedMeals: apiGetFeaturedMeals,
    getSubscriptionStatus: apiGetSubscriptionStatus,
    getPaymentHistory: apiGetPaymentHistory,
    updateFitnessGoal: apiUpdateFitnessGoal,
    getStreaksAndAchievements: apiGetStreaksAndAchievements,
    uploadImage: apiUploadImage,
    saveProgressPhoto: apiSaveProgressPhoto,
    getProgressPhotos: apiGetProgressPhotos,
    likeProgressPhoto: apiLikeProgressPhoto,
    deleteProgressPhoto: apiDeleteProgressPhoto
  } = useApi();
  const location = useLocation();

  // Use useCallback to memoize API function calls to prevent infinite loops
  const getAllWorkouts = React.useCallback(apiGetAllWorkouts, []);
  const getFeaturedMeals = React.useCallback(apiGetFeaturedMeals, []);
  const getSubscriptionStatus = React.useCallback(apiGetSubscriptionStatus, []);
  const getPaymentHistory = React.useCallback(apiGetPaymentHistory, []);
  const updateFitnessGoal = React.useCallback(apiUpdateFitnessGoal, []);
  const getStreaksAndAchievements = React.useCallback(apiGetStreaksAndAchievements, []);
  const getProgressPhotos = React.useCallback(apiGetProgressPhotos, []);

  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [indianMealPlan, setIndianMealPlan] = useState([]);
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [goalSaving, setGoalSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New state variables for photo uploads
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userPhotos, setUserPhotos] = useState([]);
  const [photoLikes, setPhotoLikes] = useState({});
  const fileInputRef = useRef(null);
  const premium = localStorage.getItem('premium') || false;

  // Calculate calories burned based on steps (roughly 0.04 calories per step for average person)
  const calculateCaloriesFromSteps = (steps) => {
    return Math.round(steps * 0.04);
  };

  // Handle step input change
  const handleStepsChange = (e) => {
    const newSteps = parseInt(e.target.value) || 0;
    setSteps(newSteps);
    const stepCalories = calculateCaloriesFromSteps(newSteps);

    // Add workout calories (estimated at 300 for a typical hour-long session)
    const workoutCalories = 300;
    setCaloriesBurned(stepCalories + workoutCalories);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!isAuthenticated || !isMounted) return;

      try {
        console.log('Fetching data for authenticated user');
        setIsLoading(true);

        // For a real application, fetch actual data from API
        const workoutData = await getAllWorkouts();
        if (isMounted && workoutData && workoutData.length > 0) {
          setWorkouts(workoutData.slice(0, 3));
        } else if (isMounted) {
          // Empty state, no prefed data
          setWorkouts([]);
        }

        const mealData = await getFeaturedMeals();
        if (isMounted && mealData && mealData.length > 0) {
          setMeals(mealData.slice(0, 3));
        } else if (isMounted) {
          // Empty state, no prefed data
          setMeals([]);
        }

        // Fetch subscription status if user is authenticated
        if (user && isMounted) {
          try {
            const subscriptionData = await getSubscriptionStatus();
            if (isMounted) {
              setSubscriptionInfo(subscriptionData);
            }

            // Also fetch achievements data
            const streakData = await getStreaksAndAchievements();

            // Fetch payment history for members
            if (user.isMember && isMounted) {
              const paymentsData = await getPaymentHistory();
              if (isMounted && paymentsData && paymentsData.payments) {
                setPaymentHistory(paymentsData.payments);
              }
            }
          } catch (error) {
            console.error('Error fetching subscription data:', error);
          }
        }

        // Check if there's a URL parameter to show the goal dialog
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('showGoalDialog') === 'true') {
          setShowCategoryDialog(true);
        }
        // Check if user has selected a workout category before and is a premium member
        else if (user?.fitnessGoal && user?.isMember && isMounted) {
          const category = user.fitnessGoal;
          setSelectedCategory(category);
          setWorkoutPlan(generateWorkoutPlan(category));
          setMealPlan(generateMealPlan(category));
          setIndianMealPlan(generateIndianMealPlan(category));
        } else if (isAuthenticated && user?.isMember && !user?.fitnessGoal && isMounted) {
          // Ask for category if premium user but no category selected
          setShowCategoryDialog(true);
        } else if (user?.fitnessGoal && !user?.isMember && isMounted) {
          // User has a goal but is not premium - we'll still store their preference
          setSelectedCategory(user.fitnessGoal);
          // But won't generate premium plans
          setWorkoutPlan([]);
          setMealPlan([]);
          setIndianMealPlan([]);
        }

        // Fetch user's progress photos
        try {
          const photoData = await getProgressPhotos();
          if (photoData && isMounted) {
            setUserPhotos(photoData);
          }
        } catch (photoError) {
          console.error('Error fetching progress photos:', photoError);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Empty arrays for fallback
        if (isMounted) {
          setWorkouts([]);
          setMeals([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    getAllWorkouts,
    getFeaturedMeals,
    getSubscriptionStatus,
    getPaymentHistory,
    user?.id,
    user?.isMember,
    user?.fitnessGoal,
    location.search, // Add location.search as a dependency to react to URL changes
    getStreaksAndAchievements,
    getProgressPhotos
  ]);

  const handleCategorySelect = async (category) => {
    try {
      console.log('handleCategorySelect called with:', category);
      setGoalSaving(true);

      // Update local state immediately for better UX
      setSelectedCategory(category);

      // Only generate plans for premium users
      if (premium) {
        console.log('Generating plans for premium user');
        setWorkoutPlan(generateWorkoutPlan(category));
        setMealPlan(generateMealPlan(category));
        setIndianMealPlan(generateIndianMealPlan(category));
      } else {
        console.log('User is not premium, not generating plans');
      }

      // Close the dialog to show something is happening
      setShowCategoryDialog(false);

      // Save the fitness goal using the dedicated API endpoint
      console.log('Calling updateFitnessGoal API');
      const response = await updateFitnessGoal(category);
      console.log('API response:', response);

      if (response && response.success) {
        console.log('Fitness goal saved successfully:', response);

        // If this was triggered by a URL parameter, clear it by redirecting
        if (location.search.includes('showGoalDialog=true')) {
          // Use history to replace the current URL without the parameter
          window.history.replaceState({}, document.title, '/dashboard');
        }
      } else {
        console.warn('Unexpected response from server:', response);
      }
    } catch (error) {
      console.error('Error saving fitness goal:', error);
      alert('Failed to save your fitness goal. Please try again.');
      // Reopen the dialog if there was an error
      setShowCategoryDialog(true);
    } finally {
      setGoalSaving(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Membership card with subscription details
  const SubscriptionCard = () => (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h3 className="text-lg font-medium text-gray-300 mb-3">Membership Status</h3>
      {subscriptionInfo ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-white">Status:</p>
            <span className={`px-2 py-1 rounded text-sm ${subscriptionInfo.isActive
                ? 'bg-green-500 bg-opacity-20 text-green-300'
                : 'bg-red-500 bg-opacity-20 text-red-300'
              }`}>
              {subscriptionInfo.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-white">Plan:</p>
            <span className="text-gray-300">
              {subscriptionInfo.membershipType === 'premium'
                ? 'Premium Yearly'
                : subscriptionInfo.membershipType === 'monthly'
                  ? 'Premium Monthly'
                  : 'Basic'}
            </span>
          </div>
          {subscriptionInfo.isActive && (
            <>
              <div className="flex justify-between items-center mb-2">
                <p className="text-white">Expires:</p>
                <span className="text-gray-300">{formatDate(subscriptionInfo.expiryDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-white">Days remaining:</p>
                <span className={`font-bold ${subscriptionInfo.daysRemaining > 30
                    ? 'text-green-400'
                    : subscriptionInfo.daysRemaining > 7
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                  {subscriptionInfo.daysRemaining}
                </span>
              </div>
            </>
          )}

          {!subscriptionInfo.isActive && (
            <Link
              to="/membership"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 text-sm hover:bg-blue-700 transition-colors w-full text-center"
            >
              Renew Membership
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400">Loading subscription details...</p>
        </div>
      )}
    </div>
  );

  // Payment History Card
  const PaymentHistoryCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Payment History</h2>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {paymentHistory.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {paymentHistory.map((payment, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-medium">
                    {payment.planType === 'premium' ? 'Premium Yearly' : 'Premium Monthly'}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${payment.status === 'successful'
                      ? 'bg-green-500 bg-opacity-20 text-green-300'
                      : payment.status === 'created' || payment.status === 'attempted'
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                        : 'bg-red-500 bg-opacity-20 text-red-300'
                    }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-300">Amount: ₹{(payment.amount / 100).toFixed(2)}</p>
                  <p className="text-gray-400">{formatDate(payment.paymentDate)}</p>
                </div>
                {payment.razorpayPaymentId && (
                  <p className="text-gray-400 text-xs mt-1">
                    Transaction ID: {payment.razorpayPaymentId.substring(0, 18)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            No payment records found
          </div>
        )}
      </div>
    </motion.div>
  );

  // Goal selection dialog component with improved event handling
  const GoalSelectionDialog = () => {
    console.log('Rendering GoalSelectionDialog');

    const handleClick = (category) => {
      console.log('GoalSelectionDialog handleClick:', category);
      handleCategorySelect(category);
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-white mb-4">What's your fitness goal?</h3>
          <p className="text-gray-300 mb-6">Select a category to get personalized recommendations:</p>

          <div className="space-y-3">
            {workoutCategories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleClick(category.name)}
                disabled={goalSaving && selectedCategory === category.name}
                className={`w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors ${goalSaving && selectedCategory === category.name ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-gray-300 text-sm">{category.description}</p>
                  </div>
                  {goalSaving && selectedCategory === category.name && (
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin ml-2"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Personalized Meal Plan Component
  const PersonalizedMealPlan = () => {
    if (!premium || !selectedCategory || !indianMealPlan.length) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-light)]">Your Personalized Indian Meal Plan</h2>
          <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full">
            Premium
          </span>
        </div>

        <p className="text-[var(--color-light-alt)] mb-4">
          Based on your {selectedCategory} goal, we've crafted this Indian meal plan to support your fitness journey:
        </p>

        <div className="space-y-6">
          {indianMealPlan.map((plan, planIndex) => (
            <div key={planIndex}>
              <h3 className="text-lg font-medium text-[var(--color-light)] mb-2">{plan.day}</h3>
              <div className="space-y-4">
                {plan.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="bg-[var(--color-dark)] p-4 rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="text-[var(--color-light)] font-medium">{meal.name}</h4>
                      <span className="text-[var(--color-light-alt)] text-sm">{meal.calories} cal</span>
                    </div>
                    <p className="text-[var(--color-light-alt)] text-sm mt-1">{meal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-[var(--color-light-alt)] text-sm">
            <span className="text-yellow-500">✓</span> Tailored to Indian preferences with authentic ingredients
          </p>
          <p className="text-[var(--color-light-alt)] text-sm mt-1">
            <span className="text-yellow-500">✓</span> Balanced nutrition to support your {selectedCategory.toLowerCase()} goals
          </p>
        </div>
      </motion.div>
    );
  };

  // Handle image upload - updated to use backend API
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
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
      setUploadingImage(true);

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Image = reader.result;

          // Upload image to server
          const uploadResult = await apiUploadImage(base64Image);

          if (uploadResult && uploadResult.imageUrl) {
            // Save progress photo record
            const caption = `Progress photo from ${new Date().toLocaleDateString()}`;
            const photoData = {
              imageUrl: uploadResult.imageUrl,
              caption: caption
            };

            console.log('Saving progress photo with data:', photoData);
            const savedPhoto = await apiSaveProgressPhoto(photoData);

            if (savedPhoto) {
              // Add to state
              setUserPhotos(prev => [savedPhoto, ...prev]);
              alert('Progress photo uploaded successfully!');
            } else {
              throw new Error('Failed to save photo record');
            }
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Error processing upload:', error);
          alert(`Failed to upload image: ${error.message}`);
        } finally {
          setUploadingImage(false);
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
      setUploadingImage(false);
    }
  };

  // Handle liking a photo - updated to use backend API
  const handleLikePhoto = async (photoId) => {
    if (!isAuthenticated) {
      alert('Please log in to like photos');
      return;
    }

    try {
      // Call API to like/unlike the photo
      const response = await apiLikeProgressPhoto(photoId);

      if (response && response.likes) {
        // Update the photos in state to reflect the new likes
        setUserPhotos(prev =>
          prev.map(photo => {
            if (photo._id === photoId) {
              return {
                ...photo,
                likes: response.likes
              };
            }
            return photo;
          })
        );
      }
    } catch (error) {
      console.error('Error liking photo:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  // Handle deleting a photo
  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await apiDeleteProgressPhoto(photoId);
      // Remove from state
      setUserPhotos(prev => prev.filter(photo => photo._id !== photoId));
      alert('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-[var(--color-dark)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-light)]">Dashboard</h1>
          <p className="text-[var(--color-light-alt)]">
            Welcome back, {user?.name || 'User'}!
          </p>
        </div>

        {/* Check for upgraded param to show welcome message */}
        {location.search.includes('upgraded=true') && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 text-green-100 p-4 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Welcome to your premium experience! Enjoy all the features and benefits of your membership.</p>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity tracking panel */}
            <TrackingPanel user={user} />

            

            {/* Personalized Meal Plan (only for premium users) */}
            { premium && <PersonalizedMealPlan />}

            {/* Recent activities */}
            <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-[var(--color-light)] mb-4">Recent Activities</h2>
              {/* ... existing recent activities content ... */}
            </div>

            {/* ... other content ... */}

            <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg">
            <FoodAnalyzer />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Membership Status Card */}
            <MembershipStatus user={user} />

            {/* Quick Actions */}
            <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg">
              {/* ... existing quick actions content ... */}
            </div>

            {/* ... any other content ... */}
          </div>



        </div>

        
        { premium?
          <div className="space-y-6">
          <MembershipStatus user={user} />
          <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg">
          <DashboardTabs />
          </div>
        </div>:""
        }


        {/* Goal Selection Dialog */}
        {showCategoryDialog && <GoalSelectionDialog />}



        {/* Progress photos section - updated to use backend data */}
        <div className=" mt-6 container mx-auto px-4 mb-10">
          <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Progress Photos</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center bg-[var(--color-accent)] text-[var(--color-dark)] py-2 px-4 rounded-md hover:bg-[var(--color-accent-light)] transition"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload New Photo
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : userPhotos.length === 0 ? (
              <div className="bg-[var(--color-dark)] rounded-lg p-8 text-center">
                <p className="text-[var(--color-light-alt)] mb-4">No progress photos yet. Upload your first photo to track your fitness journey!</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-[var(--color-primary-dark)] transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload First Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPhotos.map((photo) => (
                  <div key={photo._id} className="bg-[var(--color-dark)] rounded-lg overflow-hidden">
                    <div className="h-64 overflow-hidden">
                      <img
                        src={`http://localhost:5007${photo.imageUrl}`}
                        alt={`Progress photo from ${new Date(photo.date).toLocaleDateString()}`}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-[var(--color-light-alt)]">
                          {new Date(photo.date).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeletePhoto(photo._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="mb-3">{photo.caption}</p>
                      <button
                        onClick={() => handleLikePhoto(photo._id)}
                        className={`flex items-center space-x-1 ${photo.likes?.some(like => like.user === user?._id)
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-light-alt)]'
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${photo.likes?.some(like => like.user === user?._id) ? 'fill-current' : ''
                            }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{photo.likes?.length || 0} {photo.likes?.length === 1 ? 'like' : 'likes'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
