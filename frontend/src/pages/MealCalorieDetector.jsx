// MealCalorieDetector.jsx
import { useState } from "react";
import axios from "axios";

const MealCalorieDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // show preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setData(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post("https://ai-meal-recommend.onrender.com/api/estimate-calories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setData(response.data);
    } catch (error) {
      console.error("Error estimating calories:", error);
      alert("Failed to estimate calories. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <div style={{
      maxWidth: '960px', 
      marginLeft: '10px', 
      marginTop: '10px', 
      padding: '24px', 
      backgroundColor: 'var(--color-dark-alt)', 
      color: 'white', 
      borderRadius: '8px', 
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
        AI Meal Calorie Estimator
      </h2>
  
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px', width: '50%' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                border: '1px solid #d1d5db', 
                padding: '8px', 
                borderRadius: '8px', 
                backgroundColor: 'white', 
              
                color: 'black', 
                width: '156%'
              }}
            />
  
            {preview && (
              <img
                src={preview}
                alt="Meal Preview"
                style={{
                  width: '211px',
                  height: '168px',
                  objectFit: 'cover', 
                  borderRadius: '8px', 
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
  
            <button
              type="submit"
              style={{
                backgroundColor: '#16a34a', 
                hover: { backgroundColor: '#15803d' },
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                width:'170px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', 
                transition: 'all 0.3s ease'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Estimating..." : "Estimate Calories"}
            </button>
          </form>
        </div>
  
        {/* Right side for showing results */}
 
        {data !== null && (
  <div style={{ width: '50%', marginTop: '64px', textAlign: 'left' }}>
    <div style={{
      backgroundColor: '#2d2d2d', 
      padding: '24px', 
      borderRadius: '8px', 
      textAlign: 'left'
    }}>
      <table style={{
        width: '100%', 
        borderCollapse: 'collapse', 
        color: 'white', 
        fontSize: '1rem', 
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #444' }}>
            <th style={{ paddingBottom: '10px' }}>Nutrient</th>
            <th style={{ paddingBottom: '10px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Calories:</strong></td>
            <td>{data.nutrition['Calories (kcal)']} kcal</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Protein:</strong></td>
            <td>{data.nutrition['Protein (g)']} g</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Carbs:</strong></td>
            <td>{data.nutrition['Carbohydrates (g)']} g</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Fat:</strong></td>
            <td>{data.nutrition['Fat (g)']} g</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Fiber:</strong></td>
            <td>{data.nutrition['Fiber (g)']} g</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Sugars:</strong></td>
            <td>{data.nutrition['Sugars (g)']} g</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Sodium:</strong></td>
            <td>{data.nutrition['Sodium (mg)']} mg</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Cholesterol:</strong></td>
            <td>{data.nutrition['Cholesterol (mg)']} mg</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <td><strong>Water Intake:</strong></td>
            <td>{data.nutrition['Water_Intake (ml)']} ml</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}

      </div>
    </div>
  </div>
  
  );
};

export default MealCalorieDetector;
