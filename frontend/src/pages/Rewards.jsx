import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import StatsPage from './statepage';

const Rewards = () => {
  const api = useApi();
  const [rewards, setRewards] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState('');
  const [rewardItems, setRewardItems] = useState([
    { id: 1, name: 'Premium Workout Plan', cost: 100, image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
    { id: 2, name: 'Nutrition Consultation', cost: 150, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
    { id: 3, name: 'Extra Month Membership', cost: 500, image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
    { id: 4, name: 'Fitness Accessories', cost: 75, image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' }
  ]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const rewardsData = await api.getUserRewards();
        const activitiesData = await api.getRewardActivities();
        setRewards(rewardsData);
        setActivities(activitiesData.activities || []);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const handleStepsSubmit = async (e) => {
    e.preventDefault();
    if (!steps || isNaN(steps) || steps <= 0) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.addStepsReward(parseInt(steps));
      
      // Refresh rewards data
      const rewardsData = await api.getUserRewards();
      const activitiesData = await api.getRewardActivities();
      
      setRewards(rewardsData);
      setActivities(activitiesData.activities || []);
      setSteps('');
      
      alert(`You earned ${result.coinsEarned} coins for ${steps} steps!`);
    } catch (error) {
      console.error('Error adding steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (item) => {
    if (!rewards || rewards.coins < item.cost) {
      alert('Not enough coins to redeem this reward!');
      return;
    }

    try {
      setLoading(true);
      await api.spendCoins(item.cost, item.name);
      
      // Refresh rewards data
      const rewardsData = await api.getUserRewards();
      const activitiesData = await api.getRewardActivities();
      
      setRewards(rewardsData);
      setActivities(activitiesData.activities || []);
      
      alert(`Successfully redeemed ${item.name}!`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !rewards) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16">
        <h1 className="text-3xl font-bold mb-6 text-[var(--color-light)]">Rewards</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-light)]">Rewards</h1>
      
      {rewards && (
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg shadow-md p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Your Coins</h2>
              <p className="text-sm mb-4">Earn coins by completing workouts, tracking steps, and engaging with the community</p>
            </div>
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-6 py-3">
              <span className="text-4xl font-bold mr-2">{rewards.coins}</span>
              <span className="text-xl">🪙</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-light)]">Redeem Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardItems.map(item => (
              <div key={item.id} className="bg-[var(--color-dark-alt)] rounded-lg shadow-md overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-[var(--color-light)]">{item.name}</h3>
                    <span className="bg-yellow-900 text-yellow-100 text-xs font-medium py-1 px-2 rounded-full flex items-center">
                      {item.cost} 🪙
                    </span>
                  </div>
                  <button
                    onClick={() => handleRedeemReward(item)}
                    disabled={loading || !rewards || rewards.coins < item.cost}
                    className={`w-full py-2 px-4 rounded-md transition ${
                      !rewards || rewards.coins < item.cost
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {!rewards || rewards.coins < item.cost ? 'Not Enough Coins' : 'Redeem Reward'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-light)]">Track Steps</h2>
            <form onSubmit={handleStepsSubmit}>
              <div className="mb-4">
                <label className="block text-[var(--color-light-alt)] mb-2">How many steps did you take today?</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  min="1"
                  placeholder="Enter step count"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                Submit Steps
              </button>
            </form>
            <div className="mt-4 text-sm text-[var(--color-light-alt)]">
              <p>🪙 Earn 1 coin for every 1000 steps!</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-light)]">Activity History</h2>
          {activities.length === 0 ? (
            <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6 text-center">
              <p className="text-[var(--color-light-alt)]">No activity yet. Start earning coins!</p>
            </div>
          ) : (
            <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-4 max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-700">
                {activities.map((activity, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-[var(--color-light)]">{activity.description}</span>
                      <span className={`${activity.coins > 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                        {activity.coins > 0 ? '+' : ''}{activity.coins} 🪙
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-light-alt)] mt-1">
                      {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards; 