// MealHistory.jsx
import React, { useEffect, useState } from 'react';

const MealHistory = () => {
  const [history, setHistory] = useState({});

  useEffect(() => {
    fetch('https://ai-meal-recommend.onrender.com/history/default_user')
      .then(res => res.json())
      .then(data => setHistory(data.history || {}));
  }, []);

  const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-4">Meal History</h2>
      {sortedDates.length === 0 ? (
        <p>No meal history found.</p>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="bg-[var(--color-dark)] p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">{date}</h3>
              <ul className="list-disc ml-6">
                {Object.entries(history[date]).map(([mealTime, meal], index) => (
                  <li key={index} className="capitalize">{mealTime}: {meal}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealHistory;
