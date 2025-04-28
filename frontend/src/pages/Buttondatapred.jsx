import { useEffect, useRef } from "react";
import Lottie from "lottie-web";
import { useNavigate } from "react-router-dom";
// import Food from "../assests/Animaltion.json"; // Corrected typo from assests → assets

function FoodAnalyzer() {
  const animationContainer = useRef(null);
  const navigate = useNavigate(); // Correct useNavigate outside handler

  // useEffect(() => {
  //   Lottie.loadAnimation({
  //     container: animationContainer.current,
  //     renderer: "svg",
  //     loop: true,
  //     autoplay: true,
  //     // animationData: Food,
  //   });
  // }, []);

  const handleClick = () => {
    navigate('/calculate');
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[var(--color-dark-alt)] p-8 rounded-2xl shadow-2xl text-white">
      {/* Animation */}
    
      {/* Heading */}
      <h1 className="text-2xl md:text-4xl font-extrabold mb-6 text-center leading-tight">
        Upload Your Food <br />& Get Nutrition Facts 🍽️
      </h1>

      {/* Button */}
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition duration-300 animate-bounce"
        onClick={handleClick}
      >
        Analyze Food
      </button>
    </div>
  );
}

export default FoodAnalyzer;
