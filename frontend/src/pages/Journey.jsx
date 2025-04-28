import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

const Journey = () => {
  const api = useApi();
  const [journeyData, setJourneyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    weight: '',
    height: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: ''
    },
    notes: ''
  });

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        setLoading(true);
        const data = await api.getJourneyData();
        const summaryData = await api.getJourneySummary();
        setJourneyData(data);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching journey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewRecord(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewRecord(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addProgressRecord(newRecord);
      // Refresh data
      const data = await api.getJourneyData();
      const summaryData = await api.getJourneySummary();
      setJourneyData(data);
      setSummary(summaryData);
      // Reset form
      setNewRecord({
        weight: '',
        height: '',
        measurements: {
          chest: '',
          waist: '',
          hips: '',
          arms: '',
          thighs: ''
        },
        notes: ''
      });
    } catch (error) {
      console.error('Error adding progress record:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16">
        <h1 className="text-3xl font-bold mb-6 text-[var(--color-light)]">Your Fitness Journey</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-light)]">Your Fitness Journey</h1>
      
      {summary && (
        <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-light)]">Your Progress Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-dark)] rounded-lg p-4 border border-green-600 border-opacity-20">
              <h3 className="text-lg font-medium mb-2 text-[var(--color-light)]">Current Weight</h3>
              <p className="text-3xl font-bold text-green-400">{summary.currentWeight} kg</p>
            </div>
            <div className="bg-[var(--color-dark)] rounded-lg p-4 border border-blue-600 border-opacity-20">
              <h3 className="text-lg font-medium mb-2 text-[var(--color-light)]">Current BMI</h3>
              <p className="text-3xl font-bold text-blue-400">{summary.currentBMI}</p>
            </div>
            <div className="bg-[var(--color-dark)] rounded-lg p-4 border border-purple-600 border-opacity-20">
              <h3 className="text-lg font-medium mb-2 text-[var(--color-light)]">Weight Change</h3>
              <p className={`text-3xl font-bold ${parseFloat(summary.weightChange) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.weightChange > 0 ? '+' : ''}{summary.weightChange} kg
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-light)]">Add New Measurement</h2>
          <form onSubmit={handleSubmit} className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--color-light-alt)] mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={newRecord.weight}
                  onChange={handleInputChange}
                  className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--color-light-alt)] mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={newRecord.height}
                  onChange={handleInputChange}
                  className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2 text-[var(--color-light)]">Body Measurements (cm)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[var(--color-light-alt)] mb-2">Chest</label>
                  <input
                    type="number"
                    name="measurements.chest"
                    value={newRecord.measurements.chest}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-light-alt)] mb-2">Waist</label>
                  <input
                    type="number"
                    name="measurements.waist"
                    value={newRecord.measurements.waist}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-light-alt)] mb-2">Hips</label>
                  <input
                    type="number"
                    name="measurements.hips"
                    value={newRecord.measurements.hips}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-light-alt)] mb-2">Arms</label>
                  <input
                    type="number"
                    name="measurements.arms"
                    value={newRecord.measurements.arms}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-light-alt)] mb-2">Thighs</label>
                  <input
                    type="number"
                    name="measurements.thighs"
                    value={newRecord.measurements.thighs}
                    onChange={handleInputChange}
                    className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-[var(--color-light-alt)] mb-2">Notes</label>
              <textarea
                name="notes"
                value={newRecord.notes}
                onChange={handleInputChange}
                className="w-full p-2 border bg-[var(--color-dark)] text-[var(--color-light)] border-gray-600 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                rows="3"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
              Save Progress
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-light)]">Progress History</h2>
          {journeyData.length === 0 ? (
            <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6 text-center">
              <p className="text-[var(--color-light-alt)]">No progress records found. Add your first measurement!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journeyData.map((record, index) => (
                <div key={index} className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-[var(--color-light)]">
                      {new Date(record.date).toLocaleDateString()}
                    </h3>
                    <span className="bg-[var(--color-dark)] text-blue-400 text-xs font-medium py-1 px-2 rounded-full border border-blue-500 border-opacity-20">
                      BMI: {record.bmi}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-[var(--color-light-alt)]">
                      <span className="text-[var(--color-primary-light)]">Weight:</span> {record.weight} kg
                    </div>
                    <div className="text-[var(--color-light-alt)]">
                      <span className="text-[var(--color-primary-light)]">Height:</span> {record.height} cm
                    </div>
                  </div>
                  
                  {record.measurements && Object.keys(record.measurements).some(key => record.measurements[key]) && (
                    <div className="mb-3">
                      <h4 className="text-sm text-[var(--color-primary-light)] mb-2">Measurements</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {record.measurements.chest && (
                          <div className="text-[var(--color-light-alt)]">
                            <span className="text-[var(--color-primary-light)]">Chest:</span> {record.measurements.chest} cm
                          </div>
                        )}
                        {record.measurements.waist && (
                          <div className="text-[var(--color-light-alt)]">
                            <span className="text-[var(--color-primary-light)]">Waist:</span> {record.measurements.waist} cm
                          </div>
                        )}
                        {record.measurements.hips && (
                          <div className="text-[var(--color-light-alt)]">
                            <span className="text-[var(--color-primary-light)]">Hips:</span> {record.measurements.hips} cm
                          </div>
                        )}
                        {record.measurements.arms && (
                          <div className="text-[var(--color-light-alt)]">
                            <span className="text-[var(--color-primary-light)]">Arms:</span> {record.measurements.arms} cm
                          </div>
                        )}
                        {record.measurements.thighs && (
                          <div className="text-[var(--color-light-alt)]">
                            <span className="text-[var(--color-primary-light)]">Thighs:</span> {record.measurements.thighs} cm
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h4 className="text-sm text-[var(--color-primary-light)] mb-1">Notes</h4>
                      <p className="text-[var(--color-light-alt)] text-sm p-2 bg-[var(--color-dark)] rounded-md">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journey; 