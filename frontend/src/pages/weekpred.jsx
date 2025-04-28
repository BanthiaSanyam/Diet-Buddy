import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';  // Import jsPDF

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const WeeklyPredictions = () => {
  const [predictions, setPredictions] = useState([]); // Initialize predictions as an empty array
  const [date, setDate] = useState(formatDate(new Date())); // Default to today's date
  const defaultGoal = localStorage.getItem('user_goal') || 'weight_loss';
  const defaultDiet = localStorage.getItem('user_diet') || 'veg';


  // Function to fetch predictions from the backend
    const fetchPredictions = () => {
        fetch(`https://ai-meal-recommend.onrender.com/predict_week?user_id=default_user&start_date=${date}&goal=${defaultGoal}&diet_type=${defaultDiet}`)
          .then(res => res.json())
          .then(data => {
            // console.log("Fetched predictions:", data); // Log the data to see what is being returned
            if (Array.isArray(data)) {
              setPredictions(data);
            } else {
              console.error("Data is not in expected format", data);
            }
          })
          .catch((error) => console.error("Error fetching predictions:", error));
      };
      
  

  console.log(predictions);

  // Fetch predictions whenever the date is updated
  useEffect(() => {
    fetchPredictions();
  }, [date]); // This will trigger when `date` changes

  // Function to generate PDF using jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Weekly Meal Predictions', 20, 20); // Add a title to the PDF
    doc.setFontSize(12);

    // Loop through the predictions and add them to the PDF
    let yOffset = 30; // Starting Y position for the content
    predictions.forEach((day) => {
      doc.text(`${day.date}:`, 20, yOffset);
      doc.text(`Breakfast: ${day.breakfast}`, 20, yOffset + 10);
      doc.text(`Lunch: ${day.lunch}`, 20, yOffset + 20);
      doc.text(`Dinner: ${day.dinner}`, 20, yOffset + 30);
      yOffset += 40; // Increase Y offset for next day's meals
    });

    // Save the PDF with a specific name
    doc.save('weekly_predictions.pdf');
  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-4">Predicted Meals for the Week</h2>

      <div className="mb-4">
        <label className="block mb-1 text-sm">Start Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}  // Update state when date changes
          className="p-2 rounded text-black"
        />
      </div>

      {Array.isArray(predictions) && predictions.length > 0 ? (
        <ul className="space-y-3">
          {predictions.map((day, index) => (
            <li key={index} className="bg-[var(--color-dark)] p-4 rounded-lg shadow">
              <strong>{day.date}</strong>
              <ul className="ml-4 list-disc">
                <li><strong>Breakfast:</strong> {day.breakfast}</li>
                <li><strong>Lunch:</strong> {day.lunch}</li>
                <li><strong>Dinner:</strong> {day.dinner}</li>
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No predictions available.</p>
      )}

      <button
        onClick={handleDownloadPDF}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Download Weekly Predictions PDF
      </button>
    </div>
  );
};

export default WeeklyPredictions;
