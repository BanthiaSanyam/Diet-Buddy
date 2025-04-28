import { useState, useRef } from 'react';
import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5007/api';

// Cache duration in milliseconds (5 seconds)
const CACHE_DURATION = 5000;

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add request cache to prevent duplicate requests
  const requestCache = useRef(new Map());
  
  const getCacheKey = (method, endpoint, data) => {
    return `${method}:${endpoint}:${data ? JSON.stringify(data) : 'null'}`;
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    console.log('API request with token:', token ? 'Token present' : 'No token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const makeRequest = async (method, endpoint, data = null, includeAuth = false) => {
    setLoading(true);
    setError(null);
    
    // Create cache key
    const cacheKey = getCacheKey(method, endpoint, data);
    
    // Check cache for GET requests
    if (method.toLowerCase() === 'get') {
      const cachedResponse = requestCache.current.get(cacheKey);
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        console.log('Using cached response for:', endpoint);
        setLoading(false);
        return cachedResponse.data;
      }
    }
    
    try {
      const config = includeAuth ? getAuthConfig() : { headers: { 'Content-Type': 'application/json' } };
      let response;
      
      // Log request details for debugging
      console.log(`API ${method.toUpperCase()} request to ${endpoint}`, data ? 'with data' : 'without data');
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(`${API_URL}/${endpoint}`, config);
          break;
        case 'post':
          if (endpoint.includes('payments') && data) {
            config.headers['Content-Type'] = 'application/json';
            response = await axios.post(`${API_URL}/${endpoint}`, JSON.stringify(data), config);
          } else {
            // Ensure data is not null for POST requests
            const postData = data || {};
            response = await axios.post(`${API_URL}/${endpoint}`, postData, config);
          }
          break;
        case 'put':
          response = await axios.put(`${API_URL}/${endpoint}`, data, config);
          break;
        case 'delete':
          response = await axios.delete(`${API_URL}/${endpoint}`, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      // Cache GET responses
      if (method.toLowerCase() === 'get') {
        requestCache.current.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      } else {
        // Clear any related GET caches when POST/PUT/DELETE to ensure data is fresh
        const relatedEndpoint = endpoint.split('/')[0];
        [...requestCache.current.keys()].forEach(key => {
          if (key.includes(relatedEndpoint)) {
            requestCache.current.delete(key);
          }
        });
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      
      // Better error handling
      let errorMessage = 'Something went wrong';
      let errorDetails = {};
      
      // Handle axios response errors
      if (err.response) {
        // Server responded with error status
        errorDetails.status = err.response.status;
        
        // Check if the response data is JSON
        if (err.response.data) {
          if (typeof err.response.data === 'object') {
            errorMessage = err.response.data.message || 'Server error';
            errorDetails.data = err.response.data;
          } else if (typeof err.response.data === 'string') {
            try {
              // Try to parse the string as JSON
              const parsedData = JSON.parse(err.response.data);
              errorMessage = parsedData.message || 'Server error';
              errorDetails.data = parsedData;
            } catch (parseError) {
              // If it's not JSON, use the string directly
              errorMessage = err.response.data;
            }
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server';
        errorDetails.request = true;
      } else {
        // Error in setting up the request
        errorMessage = err.message || 'Request configuration error';
      }
      
      console.error('API Error:', errorDetails, err);
      setError(errorMessage);
      
      // For payment-related errors, provide more details
      if (endpoint.includes('payments')) {
        throw new Error(`Payment error: ${errorMessage}`);
      }
      
      throw new Error(errorMessage);
    }
  };

  // Auth endpoints
  const register = (userData) => makeRequest('post', 'auth/register', userData);
  
  const login = (credentials) => {
    console.log('API login called with:', credentials);
    return makeRequest('post', 'auth/login', credentials);
  };
  const getProfile = () => makeRequest('get', 'auth/profile', null, true);
  const updateProfile = (userData) => makeRequest('put', 'auth/profile', userData, true);
  const updateFitnessGoal = (fitnessGoal) => makeRequest('put', 'auth/fitness-goal', { fitnessGoal }, true);

  // Workout endpoints
  const getAllWorkouts = () => makeRequest('get', 'workouts');
  const getWorkoutById = (id) => makeRequest('get', `workouts/${id}`);
  const getWorkoutsByCategory = (category) => makeRequest('get', `workouts/category/${category}`);
  const getWorkoutsByDifficulty = (difficulty) => makeRequest('get', `workouts/difficulty/${difficulty}`);
  const getWorkoutsByCategoryAndDifficulty = (category, difficulty) => 
    makeRequest('get', `workouts/category/${category}/difficulty/${difficulty}`);
  const getFeaturedWorkouts = () => makeRequest('get', 'workouts/featured');
  const searchWorkouts = (query) => makeRequest('get', `workouts/search/${query}`);

  // Meal endpoints
  const getAllMeals = () => makeRequest('get', 'meals');
  const getMealById = (id) => makeRequest('get', `meals/${id}`);
  const getMealsByCategory = (category) => makeRequest('get', `meals/category/${category}`);
  const getMealsByType = (type) => makeRequest('get', `meals/type/${type}`);
  const getMealsByCategoryAndType = (category, type) => 
    makeRequest('get', `meals/category/${category}/type/${type}`);
  const getFeaturedMeals = () => makeRequest('get', 'meals/featured');
  const searchMeals = (query) => makeRequest('get', `meals/search/${query}`);

  // Progress endpoints (require authentication)
  const addWorkoutToHistory = (workoutId) => 
    makeRequest('post', 'progress/workouts', { workoutId }, true);
  const addMealToHistory = (mealId) => 
    makeRequest('post', 'progress/meals', { mealId }, true);
  const getWorkoutHistory = () => makeRequest('get', 'progress/workouts', null, true);
  const getMealHistory = () => makeRequest('get', 'progress/meals', null, true);
  const getProgressSummary = () => makeRequest('get', 'progress/summary', null, true);

  // User favorites
  const addWorkoutToFavorites = (workoutId) => 
    makeRequest('post', `users/favorites/workouts/${workoutId}`, null, true);
  const removeWorkoutFromFavorites = (workoutId) => 
    makeRequest('delete', `users/favorites/workouts/${workoutId}`, null, true);
  const addMealToFavorites = (mealId) => 
    makeRequest('post', `users/favorites/meals/${mealId}`, null, true);
  const removeMealFromFavorites = (mealId) => 
    makeRequest('delete', `users/favorites/meals/${mealId}`, null, true);
    
  // Payment related
  const createOrder = () => makeRequest('post', 'payments/create-order', null, true);
  const verifyPayment = (paymentData) => makeRequest('post', 'payments/verify', paymentData, true);
  const testUpgrade = (data = {}) => makeRequest('post', 'payments/test-upgrade', data, true);
  const createMonthlyOrder = () => makeRequest('post', 'payments/create-monthly-order', null, true);
  const verifyMonthlyPayment = (paymentData) => makeRequest('post', 'payments/verify-monthly', paymentData, true);
  const getPaymentHistory = () => makeRequest('get', 'payments/history', null, true);
  const getSubscriptionStatus = () => makeRequest('get', 'payments/subscription-status', null, true);

  // Journey tracking endpoints
  const getJourneyData = () => makeRequest('get', 'journey', null, true);
  const getLatestProgress = () => makeRequest('get', 'journey/latest', null, true);
  const addProgressRecord = (progressData) => makeRequest('post', 'journey', progressData, true);
  const updateProgressRecord = (id, progressData) => makeRequest('put', `journey/${id}`, progressData, true);
  const getJourneySummary = () => makeRequest('get', 'journey/summary', null, true);
  
  // Rewards endpoints
  const getUserRewards = () => makeRequest('get', 'rewards', null, true);
  const getRewardActivities = () => makeRequest('get', 'rewards/activities', null, true);
  const addReward = (rewardData) => makeRequest('post', 'rewards/add', rewardData, true);
  const addStepsReward = (steps) => makeRequest('post', 'rewards/steps', { steps }, true);
  const spendCoins = (amount, item) => makeRequest('post', 'rewards/spend', { amount, item }, true);
  
  // Tracking panel endpoints
  const trackDailyActivity = (trackingData) => makeRequest('post', 'rewards/track-activity', trackingData, true);
  const getStreaksAndAchievements = () => makeRequest('get', 'rewards/streaks', null, true);
  
  // Blog endpoints
  const getAllBlogs = () => makeRequest('get', 'blogs');
  const getFeaturedBlogs = () => makeRequest('get', 'blogs/featured');
  const getBlogById = (id) => makeRequest('get', `blogs/${id}`);
  const getBlogsByTag = (tag) => makeRequest('get', `blogs/tag/${tag}`);
  
  // Community endpoints
  const getAllPosts = () => makeRequest('get', 'community/posts', null, false);
  const getPostById = (id) => makeRequest('get', `community/posts/${id}`, null, true);
  const createPost = (postData) => makeRequest('post', 'community/posts', postData, true);
  const likePost = (id) => makeRequest('put', `community/posts/${id}/like`, null, true);
  const commentOnPost = (id, commentData) => makeRequest('post', `community/posts/${id}/comment`, commentData, true);
  const uploadImage = (imageData) => makeRequest('post', 'community/upload-image', { image: imageData }, true);

  // Progress Photos endpoints
  const getProgressPhotos = () => makeRequest('get', 'progress-photos', null, true);
  const saveProgressPhoto = (photoData) => {
    console.log('API saveProgressPhoto called with:', photoData);
    return makeRequest('post', 'progress-photos', photoData, true);
  };
  const likeProgressPhoto = (id) => makeRequest('put', `progress-photos/${id}/like`, null, true);
  const deleteProgressPhoto = (id) => makeRequest('delete', `progress-photos/${id}`, null, true);

  // User logs endpoints (admin functions)
  const getLogs = (page = 1, limit = 50, action = '', userId = '', startDate = '', endDate = '') => {
    let queryParams = `?page=${page}&limit=${limit}`;
    if (action) queryParams += `&action=${action}`;
    if (userId) queryParams += `&userId=${userId}`;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;
    
    return makeRequest('get', `logs${queryParams}`, null, true);
  };
  
  const getLogAnalytics = (startDate = '', endDate = '') => {
    let queryParams = '';
    if (startDate || endDate) {
      queryParams = '?';
      if (startDate) queryParams += `startDate=${startDate}`;
      if (startDate && endDate) queryParams += '&';
      if (endDate) queryParams += `endDate=${endDate}`;
    }
    
    return makeRequest('get', `logs/analytics${queryParams}`, null, true);
  };
  
  const getUserActivity = (page = 1, limit = 20, action = '', startDate = '', endDate = '') => {
    let queryParams = `?page=${page}&limit=${limit}`;
    if (action) queryParams += `&action=${action}`;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;
    
    return makeRequest('get', `logs/my-activity${queryParams}`, null, true);
  };

  return {
    loading,
    error,
    // Auth
    register,
    login,
    getProfile,
    updateProfile,
    updateFitnessGoal,
    // Workouts
    getAllWorkouts,
    getWorkoutById,
    getWorkoutsByCategory,
    getWorkoutsByDifficulty,
    getWorkoutsByCategoryAndDifficulty,
    getFeaturedWorkouts,
    searchWorkouts,
    // Meals
    getAllMeals,
    getMealById,
    getMealsByCategory,
    getMealsByType,
    getMealsByCategoryAndType,
    getFeaturedMeals,
    searchMeals,
    // Progress
    addWorkoutToHistory,
    addMealToHistory,
    getWorkoutHistory,
    getMealHistory,
   
    getProgressSummary,
    // Favorites
    addWorkoutToFavorites,
    removeWorkoutFromFavorites,
    addMealToFavorites,
    removeMealFromFavorites,
    // Payment
    createOrder,
    verifyPayment,
    testUpgrade,
    createMonthlyOrder,
    verifyMonthlyPayment,
    getPaymentHistory,
    getSubscriptionStatus,
    // Journey
    getJourneyData,
    getLatestProgress,
    addProgressRecord,
    updateProgressRecord,
    getJourneySummary,
    // Rewards
    getUserRewards,
    getRewardActivities,
    addReward,
    addStepsReward,
    spendCoins,
    // Tracking panel
    trackDailyActivity,
    getStreaksAndAchievements,
    // Blogs
    getAllBlogs,
    getFeaturedBlogs,
    getBlogById,
    getBlogsByTag,
    // Community
    getAllPosts,
    getPostById,
    createPost,
    likePost,
    commentOnPost,
    uploadImage,
    // Progress Photos
    getProgressPhotos,
    saveProgressPhoto,
    likeProgressPhoto,
    deleteProgressPhoto,
    // Logs
    getLogs,
    getLogAnalytics,
    getUserActivity
  };
};

export default useApi; 