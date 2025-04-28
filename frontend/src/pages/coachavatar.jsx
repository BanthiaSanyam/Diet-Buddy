import React from "react";
import Lottie from "lottie-react";
import coachAnimation from "../assests/Animaltion.json"; 

export function CoachAvatar() {
  return (
    <div className="fixed bottom-0 right-0 w-32 h-32 z-50">
      <Lottie
        animationData={coachAnimation}
        loop
        autoplay
      />
    </div>
  );
}

