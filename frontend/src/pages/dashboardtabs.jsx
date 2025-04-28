// DashboardTabs.jsx
import React, { useState } from 'react';
import MealRecommendation from './mealRecomm';
import StatsPage from './statepage';
import MealHistory from './mealhistory';
import WeeklyPredictions from './weekpred';

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('recommendation');

  const renderTab = () => {

    switch (activeTab) {
      case 'recommendation':
        return <MealRecommendation />;
      case 'stats':
        return <StatsPage />;
      case 'history':
        return <MealHistory />;
      case 'predictions':
        return <WeeklyPredictions />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl text-white">
    <div className="flex justify-between items-center mb-4 border-b border-[var(--color-light-alt)]">
      
      {/* Tab Buttons Group */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('recommendation')}
          className={`py-2 px-4 font-semibold ${activeTab === 'recommendation' ? 'border-b-2 border-[var(--color-accent)]' : ''}`}
        >
          Meal Recommendation
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2 px-4 font-semibold ${activeTab === 'stats' ? 'border-b-2 border-[var(--color-accent)]' : ''}`}
        >
          Weekly Stats
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 font-semibold ${activeTab === 'history' ? 'border-b-2 border-[var(--color-accent)]' : ''}`}
        >
          Meal History
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`py-2 px-4 font-semibold ${activeTab === 'predictions' ? 'border-b-2 border-[var(--color-accent)]' : ''}`}
        >
          Weekly Prediction
        </button>
      </div>
  
      {/* Premium Badge on the Right */}
      <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full">
        Premium
      </span>
    </div>
  
    <div>{renderTab()}</div>
  </div>
  
  );
};

export default DashboardTabs;
