// MealRecommendation.jsx (Auto-fetching based on saved user preferences)
import React, { useState, useEffect } from 'react';
import './meal.css';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MealRecommendation = () => {
  const defaultGoal = localStorage.getItem('user_goal') || 'weight_loss';
  const defaultDiet = localStorage.getItem('user_diet') || 'veg';

  const [goal, setGoal] = useState(defaultGoal);
  const [dietType, setDietType] = useState(defaultDiet);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchRecommendations(selectedDate);
  }, [selectedDate, goal, dietType]);

  const fetchRecommendations = async (date) => {
    setLoading(true);
    try {
      const response = await fetch('https://ai-meal-recommend.onrender.com/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, diet_type: dietType, date, user_id: 'default_user' })
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = () => {
    localStorage.setItem('user_goal', goal);
    localStorage.setItem('user_diet', dietType);
    setEditing(false);
  };

  const renderMealCards = (mealTime, meals, details) => (
    <div className="meal-section" key={mealTime}>
      <h3 className="text-lg font-semibold mb-2 capitalize">{mealTime}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {meals?.map((meal, idx) => (
          <div key={idx} className="meal-card p-4 bg-[var(--color-dark-alt)] rounded-lg shadow">
            <p className="font-bold text-white">{meal}</p>
            <p className="text-sm text-[var(--color-light-alt)] italic">
              {details?.[idx]?.total_calories || 'N/A'} calories
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl text-white">
      <h2 className="text-2xl font-bold mb-4">Meal Recommendation</h2>
      <div className="flex justify-between mb-4">
        <p><strong>Goal:</strong> {goal.replace('_', ' ')}, <strong>Diet:</strong> {dietType.replace('_', ' ')}</p>
        <button
          onClick={() => setEditing(!editing)}
          className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
        >
          {editing ? 'Cancel' : 'Edit Preferences'}
        </button>
      </div>

      {editing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-1">Goal:</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full p-2 rounded">
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Diet Type:</label>
            <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="w-full p-2 rounded">
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-Vegetarian</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={savePreferences} className="w-full bg-green-600 p-2 rounded hover:bg-green-700">
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm">Loading recommendations...</p>
      ) : (
        ['breakfast', 'lunch', 'dinner'].map(mealTime =>
          renderMealCards(
            mealTime,
            recommendations.recommendations?.[mealTime],
            recommendations.meal_details?.[mealTime]
          )
        )
      )}
    </div>
  );
};

export default MealRecommendation;
