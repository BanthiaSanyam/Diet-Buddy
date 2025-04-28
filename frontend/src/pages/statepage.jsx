import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { FaCoffee, FaUtensils, FaMoon } from 'react-icons/fa'; // Icons

const StatsPage = () => {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ai-meal-recommend.onrender.com/weekly_stats?user_id=default_user")
      .then(res => res.json())
      .then(data => {
        setWeeklyStats(data);
        setLoading(false);
      });
  }, []);

  const retrainModel = async () => {
    const res = await fetch('https://ai-meal-recommend.onrender.com/retrain_model', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
  };

  const iconMap = {
    breakfast: <FaCoffee className="inline text-yellow-300 mr-1" />,
    lunch: <FaUtensils className="inline text-green-400 mr-1" />,
    dinner: <FaMoon className="inline text-blue-300 mr-1" />
  };

  return (
    <div className="mt-8 px-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🍽️ Weekly Meal Insights</h2>
        <button
          onClick={retrainModel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          🔄 Retrain Model
        </button>
      </div>

      {loading ? (
        <div className="text-center text-lg text-gray-300 animate-pulse">Loading stats...</div>
      ) : (
        <>
          {/* Average Calories Section */}
          <div className="bg-[var(--color-dark)] rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">🔥 Average Calories per Meal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats.calories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="meal_type" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Bar dataKey="average" fill="#34D399" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Most Common Meals Section */}
          <div className="bg-[var(--color-dark)] rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">🥗 Most Common Meals</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(weeklyStats.common_meals).map(([mealType, meal], index) => (
                <li
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg shadow hover:scale-[1.02] transition transform duration-200"
                >
                  <div className="text-md font-medium mb-2 capitalize">
                    {iconMap[mealType]} {mealType}
                  </div>
                  <div className="text-lg font-semibold text-green-300">{meal}</div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;
