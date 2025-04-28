const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Get workout videos by category
router.get('/videos/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['Weight Loss', 'Muscle Building', 'Calisthenics', 'HIIT'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', validCategories });
    }

    // Structured workout programs by difficulty level
    const workoutPrograms = {
      'Weight Loss': {
        beginner: [
          { id: 'wl-b1', name: 'Walking', duration: '30 minutes', calories: '150-200', description: 'Brisk walking to increase heart rate', videoUrl: 'https://youtube.com/watch?v=walking' },
          { id: 'wl-b2', name: 'Basic Jumping Jacks', duration: '2 minutes × 3 sets', calories: '100-120', description: 'Simple cardio to elevate heart rate', videoUrl: 'https://youtube.com/watch?v=jumping-jacks' },
          { id: 'wl-b3', name: 'Step-Ups', duration: '1 minute per leg × 3 sets', calories: '80-100', description: 'Step up and down on a raised platform', videoUrl: 'https://youtube.com/watch?v=step-ups' },
          { id: 'wl-b4', name: 'Arm Circles', duration: '1 minute × 3 sets', calories: '40-60', description: 'Simple arm rotation exercise', videoUrl: 'https://youtube.com/watch?v=arm-circles' },
          { id: 'wl-b5', name: 'Knee Push-Ups', duration: '8 reps × 3 sets', calories: '50-80', description: 'Modified push-ups for beginners', videoUrl: 'https://youtube.com/watch?v=knee-pushups' },
          { id: 'wl-b6', name: 'Seated Leg Raises', duration: '10 reps × 3 sets', calories: '50-70', description: 'Simple leg raises while seated', videoUrl: 'https://youtube.com/watch?v=seated-leg-raises' }
        ],
        intermediate: [
          { id: 'wl-i1', name: 'Jogging', duration: '20 minutes', calories: '200-250', description: 'Moderate pace jogging', videoUrl: 'https://youtube.com/watch?v=jogging' },
          { id: 'wl-i2', name: 'Mountain Climbers', duration: '30 seconds × 4 sets', calories: '120-150', description: 'Dynamic plank with alternating knee drives', videoUrl: 'https://youtu.be/kLh-uczlPLg?si=xjcCqpYj7ExMNl9C' },
          { id: 'wl-i3', name: 'Bicycle Crunches', duration: '20 reps × 3 sets', calories: '100-120', description: 'Alternating elbow-to-knee crunches', videoUrl: 'https://youtube.com/watch?v=bicycle-crunches' },
          { id: 'wl-i4', name: 'Jump Squats', duration: '15 reps × 3 sets', calories: '150-180', description: 'Explosive squats with jump at top', videoUrl: 'https://youtube.com/watch?v=jump-squats' },
          { id: 'wl-i5', name: 'Russian Twists', duration: '15 reps × 3 sets', calories: '80-100', description: 'Seated twisting motion targeting obliques', videoUrl: 'https://youtu.be/5xv0DKqe5XQ?si=Z_38z081zXMTMpgP' },
          { id: 'wl-i6', name: 'Lateral Lunges', duration: '12 reps per side × 3 sets', calories: '120-140', description: 'Side lunges to target inner and outer thighs', videoUrl: 'https://youtu.be/gwWv7aPcD88?si=yX_OLmIzpyVxrN84' }
        ],
        hardcore: [
          { id: 'wl-h1', name: 'HIIT Sprints', duration: '30 seconds sprint, 30 seconds rest × 10', calories: '300-350', description: 'Maximum effort sprint intervals', videoUrl: 'https://youtu.be/T401iOs5ZpE?si=pNaJ3Fmoxey1y-KC' },
          { id: 'wl-h2', name: 'Burpees', duration: '20 reps × 4 sets', calories: '200-250', description: 'Full-body explosive exercise combining squat, plank, and jump', videoUrl: 'https://youtu.be/auBLPXO8Fww?si=fvnG_hrc10tHyOJs' },
          { id: 'wl-h3', name: 'Box Jumps', duration: '15 reps × 4 sets', calories: '180-220', description: 'Explosive jumps onto an elevated platform', videoUrl: 'https://youtu.be/DhTd3Gb4gNU?si=up0ONGwPOjSXMUwC' },
          { id: 'wl-h4', name: 'Kettlebell Swings', duration: '20 reps × 4 sets', calories: '200-240', description: 'Dynamic swing exercise with kettlebell', videoUrl: 'https://youtu.be/cY38L70lxro?si=34k2e9tFHifEAJ_B' },
          { id: 'wl-h5', name: 'Medicine Ball Slams', duration: '15 reps × 4 sets', calories: '150-180', description: 'Explosive slamming of medicine ball', videoUrl: 'https://youtu.be/QxYhFwMd1Ks?si=j4Mfg5ffq61QMifj' },
          { id: 'wl-h6', name: 'Battle Ropes', duration: '30 seconds × 5 sets', calories: '200-250', description: 'High-intensity rope exercise', videoUrl: 'https://youtu.be/zw0OMi00X5g?si=sErMi2g2s9aGg8k5' }
        ]
      },
      'Muscle Building': {
        beginner: [
          // Chest
          { id: 'mb-chest-b1', name: 'Wall Push-Ups', duration: '12 reps × 3 sets', calories: '50-70', description: 'Push-ups against a wall for beginners', videoUrl: 'https://youtube.com/watch?v=wall-pushups', bodyPart: 'Chest' },
          { id: 'mb-chest-b2', name: 'Incline Push-Ups', duration: '10 reps × 3 sets', calories: '60-80', description: 'Push-ups with hands elevated for reduced difficulty', videoUrl: 'https://youtube.com/watch?v=incline-pushups', bodyPart: 'Chest' },
          
          // Back
          { id: 'mb-back-b1', name: 'Resistance Band Rows', duration: '12 reps × 3 sets', calories: '60-80', description: 'Pulling motion with resistance bands', videoUrl: 'https://youtube.com/watch?v=band-rows', bodyPart: 'Back' },
          { id: 'mb-back-b2', name: 'Supermans', duration: '10 reps × 3 sets', calories: '50-70', description: 'Back extension exercise while lying on stomach', videoUrl: 'https://youtube.com/watch?v=supermans', bodyPart: 'Back' },
          
          // Legs
          { id: 'mb-legs-b1', name: 'Assisted Squats', duration: '15 reps × 3 sets', calories: '80-100', description: 'Squats holding onto support for balance', videoUrl: 'https://youtube.com/watch?v=assisted-squats', bodyPart: 'Legs' },
          { id: 'mb-legs-b2', name: 'Glute Bridges', duration: '15 reps × 3 sets', calories: '60-80', description: 'Hip raises to target glutes', videoUrl: 'https://youtu.be/C7qnbmpLNGI?si=s3ZcxzYJfzVBhRHls', bodyPart: 'Legs' },
          
          // Shoulders
          { id: 'mb-shoulders-b1', name: 'Seated Shoulder Press', duration: '10 reps × 3 sets', calories: '70-90', description: 'Overhead press while seated for stability', videoUrl: 'https://youtube.com/watch?v=shoulder-press', bodyPart: 'Shoulders' },
          { id: 'mb-shoulders-b2', name: 'Lateral Raises', duration: '10 reps × 3 sets', calories: '60-80', description: 'Raising arms to sides with light weights', videoUrl: 'https://youtube.com/watch?v=lateral-raises', bodyPart: 'Shoulders' }
        ],
        intermediate: [
          // Chest
          { id: 'mb-chest-i1', name: 'Push-Ups', duration: '15 reps × 4 sets', calories: '100-120', description: 'Standard push-ups from plank position', videoUrl: 'https://youtube.com/watch?v=pushups', bodyPart: 'Chest' },
          { id: 'mb-chest-i2', name: 'Dumbbell Bench Press', duration: '12 reps × 4 sets', calories: '110-130', description: 'Chest press while lying on bench', videoUrl: 'https://youtube.com/watch?v=dumbbell-bench', bodyPart: 'Chest' },
          { id: 'mb-chest-i3', name: 'Dumbbell Flyes', duration: '12 reps × 3 sets', calories: '90-110', description: 'Opening arms wide while lying on bench', videoUrl: 'https://youtu.be/FDay9wFe5uE?si=8_-xRnP1a1YFUA0o', bodyPart: 'Chest' },
          
          // Back
          { id: 'mb-back-i1', name: 'Bent-Over Rows', duration: '12 reps × 4 sets', calories: '100-120', description: 'Back exercise pulling weights from bent position', videoUrl: 'https://youtu.be/6FZHJGzMFEc?si=tMwSFR3nujeRuNfG', bodyPart: 'Back' },
          { id: 'mb-back-i2', name: 'One-Arm Dumbbell Rows', duration: '10 reps per arm × 3 sets', calories: '90-110', description: 'Single-arm rowing motion with dumbbell', videoUrl: 'https://youtube.com/watch?v=one-arm-rows', bodyPart: 'Back' },
          { id: 'mb-back-i3', name: 'Face Pulls', duration: '15 reps × 3 sets', calories: '80-100', description: 'Pulling resistance band toward face to work rear deltoids', videoUrl: 'https://youtube.com/watch?v=face-pulls', bodyPart: 'Back' },
          
          // Legs
          { id: 'mb-legs-i1', name: 'Dumbbell Squats', duration: '15 reps × 4 sets', calories: '120-150', description: 'Squats while holding dumbbells', videoUrl: 'https://youtube.com/watch?v=dumbbell-squats', bodyPart: 'Legs' },
          { id: 'mb-legs-i2', name: 'Bulgarian Split Squats', duration: '10 reps per leg × 3 sets', calories: '120-150', description: 'Single-leg squats with rear foot elevated', videoUrl: 'https://youtube.com/watch?v=bulgarian-squats', bodyPart: 'Legs' },
          { id: 'mb-legs-i3', name: 'Dumbbell Lunges', duration: '12 reps per leg × 3 sets', calories: '110-140', description: 'Forward lunges while holding dumbbells', videoUrl: 'https://youtube.com/watch?v=dumbbell-lunges', bodyPart: 'Legs' },
          
          // Shoulders
          { id: 'mb-shoulders-i1', name: 'Standing Shoulder Press', duration: '12 reps × 3 sets', calories: '90-110', description: 'Overhead press while standing', videoUrl: 'https://youtube.com/watch?v=standing-press', bodyPart: 'Shoulders' },
          { id: 'mb-shoulders-i2', name: 'Lateral Raises', duration: '12 reps × 3 sets', calories: '80-100', description: 'Raising dumbbells to sides at shoulder level', videoUrl: 'https://youtu.be/lq7eLC30b9w?si=miggXZdIQw1K-aYZ', bodyPart: 'Shoulders' },
          { id: 'mb-shoulders-i3', name: 'Front Raises', duration: '12 reps × 3 sets', calories: '80-100', description: 'Raising dumbbells to front at shoulder level', videoUrl: 'https://youtube.com/watch?v=front-raises', bodyPart: 'Shoulders' }
        ],
        hardcore: [
          // Chest
          { id: 'mb-chest-h1', name: 'Bench Press', duration: '8 reps × 5 sets', calories: '150-180', description: 'Barbell chest press on bench', videoUrl: 'https://youtu.be/SCVCLChPQFY?si=az4tTWxg908rcMxv', bodyPart: 'Chest' },
          { id: 'mb-chest-h2', name: 'Incline Dumbbell Press', duration: '10 reps × 4 sets', calories: '130-160', description: 'Pressing dumbbells on inclined bench', videoUrl: 'https://youtu.be/lJ2o89kcnxY?si=-UfKOYwO5CPbEgGa', bodyPart: 'Chest' },
          { id: 'mb-chest-h3', name: 'Weighted Dips', duration: '8 reps × 4 sets', calories: '140-170', description: 'Dips with additional weight for chest', videoUrl: 'https://youtube.com/watch?v=weighted-dips', bodyPart: 'Chest' },
          
          // Back
          { id: 'mb-back-h1', name: 'Pull-Ups', duration: '8 reps × 4 sets', calories: '120-150', description: 'Bodyweight pulling exercise on bar', videoUrl: 'https://youtube.com/watch?v=pullups', bodyPart: 'Back' },
          { id: 'mb-back-h2', name: 'Barbell Rows', duration: '10 reps × 4 sets', calories: '140-170', description: 'Bent-over rowing with barbell', videoUrl: 'https://youtube.com/watch?v=barbell-rows', bodyPart: 'Back' },
          { id: 'mb-back-h3', name: 'Deadlifts', duration: '6 reps × 5 sets', calories: '180-220', description: 'Full posterior chain exercise with barbell', videoUrl: 'https://youtu.be/AweC3UaM14o?si=uINZjvwcpqmOEaA9', bodyPart: 'Back' },
          
          // Legs
          { id: 'mb-legs-h1', name: 'Barbell Squats', duration: '8 reps × 5 sets', calories: '170-200', description: 'Full squats with barbell', videoUrl: 'https://youtu.be/rrJIyZGlK8c?si=R5yQDkBEQEhbcWtF', bodyPart: 'Legs' },
          { id: 'mb-legs-h2', name: 'Weighted Lunges', duration: '8 reps per leg × 4 sets', calories: '150-180', description: 'Heavy lunges with barbell or dumbbells', videoUrl: 'https://youtu.be/_qwLdYywo_A?si=a6BAR4PENBpUZJgO', bodyPart: 'Legs' },
          { id: 'mb-legs-h3', name: 'Leg Press', duration: '10 reps × 4 sets', calories: '160-190', description: 'Machine-based leg pressing exercise', videoUrl: 'https://youtube/MpEydcQ1oDw?si=kKSGAW6NbT_SkLGa', bodyPart: 'Legs' },
          
          // Shoulders
          { id: 'mb-shoulders-h1', name: 'Military Press', duration: '8 reps × 4 sets', calories: '130-160', description: 'Strict overhead press with barbell', videoUrl: 'https://youtube.com/watch?v=military-press', bodyPart: 'Shoulders' },
          { id: 'mb-shoulders-h2', name: 'Arnold Press', duration: '10 reps × 4 sets', calories: '120-150', description: 'Rotational dumbbell press for shoulders', videoUrl: 'https://youtube.com/watch?v=arnold-press', bodyPart: 'Shoulders' },
          { id: 'mb-shoulders-h3', name: 'Upright Rows', duration: '12 reps × 4 sets', calories: '110-140', description: 'Vertical pulling motion for shoulders', videoUrl: 'https://youtube.com/watch?v=upright-rows', bodyPart: 'Shoulders' }
        ]
      },
      'Calisthenics': {
        beginner: [
          // Upper Body
          { id: 'cal-upper-b1', name: 'Incline Push-Ups', duration: '12 reps × 3 sets', calories: '60-80', description: 'Push-ups with hands elevated for reduced difficulty', videoUrl: 'https://youtube.com/watch?v=incline-pushups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-b2', name: 'Australian Pull-Ups', duration: '10 reps × 3 sets', calories: '70-90', description: 'Horizontal body-weight rows', videoUrl: 'https://youtube.com/watch?v=australian-pullups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-b3', name: 'Bench Dips', duration: '12 reps × 3 sets', calories: '60-80', description: 'Tricep dips using a bench with feet on floor', videoUrl: 'https://youtube.com/watch?v=bench-dips', bodyPart: 'Upper Body' },
          { id: 'cal-upper-b4', name: 'Plank', duration: '30 seconds × 3 sets', calories: '40-60', description: 'Core exercise holding push-up position', videoUrl: 'https://youtube.com/watch?v=plank', bodyPart: 'Upper Body' },
          { id: 'cal-upper-b5', name: 'Wall Angels', duration: '10 reps × 3 sets', calories: '30-50', description: 'Shoulder mobility exercise against wall', videoUrl: 'https://youtube.com/watch?v=wall-angels', bodyPart: 'Upper Body' },
          
          // Lower Body
          { id: 'cal-lower-b1', name: 'Bodyweight Squats', duration: '15 reps × 3 sets', calories: '80-100', description: 'Basic squats using only body weight', videoUrl: 'https://youtube.com/watch?v=bodyweight-squats', bodyPart: 'Lower Body' },
          { id: 'cal-lower-b2', name: 'Lying Leg Raises', duration: '12 reps × 3 sets', calories: '50-70', description: 'Core exercise raising legs while lying on back', videoUrl: 'https://youtube.com/watch?v=leg-raises', bodyPart: 'Lower Body' },
          { id: 'cal-lower-b3', name: 'Glute Bridges', duration: '15 reps × 3 sets', calories: '60-80', description: 'Hip raises to target glutes', videoUrl: 'https://youtube.com/watch?v=glute-bridges', bodyPart: 'Lower Body' },
          { id: 'cal-lower-b4', name: 'Lunges', duration: '10 reps per leg × 3 sets', calories: '70-90', description: 'Forward stepping exercise for legs', videoUrl: 'https://youtube.com/watch?v=lunges', bodyPart: 'Lower Body' }
        ],
        intermediate: [
          // Upper Body
          { id: 'cal-upper-i1', name: 'Standard Push-Ups', duration: '15 reps × 4 sets', calories: '100-120', description: 'Full push-ups from plank position', videoUrl: 'https://youtube.com/watch?v=pushups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-i2', name: 'Negative Pull-Ups', duration: '8 reps × 4 sets', calories: '100-120', description: 'Slow downward phase of pull-up', videoUrl: 'https://youtube.com/watch?v=negative-pullups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-i3', name: 'Parallel Bar Dips', duration: '10 reps × 3 sets', calories: '100-120', description: 'Full dips on parallel bars', videoUrl: 'https://youtube.com/watch?v=bar-dips', bodyPart: 'Upper Body' },
          { id: 'cal-upper-i4', name: 'Pike Push-Ups', duration: '10 reps × 3 sets', calories: '90-110', description: 'Inverted push-ups with hips raised', videoUrl: 'https://youtube.com/watch?v=pike-pushups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-i5', name: 'Tuck Front Lever', duration: '20 seconds × 4 sets', calories: '80-100', description: 'Hanging core exercise with knees tucked', videoUrl: 'https://youtube.com/watch?v=tuck-lever', bodyPart: 'Upper Body' },
          { id: 'cal-upper-i6', name: 'Handstand Wall Hold', duration: '30 seconds × 3 sets', calories: '70-90', description: 'Inverted position against wall', videoUrl: 'https://youtube.com/watch?v=handstand-wall', bodyPart: 'Upper Body' },
          
          // Lower Body
          { id: 'cal-lower-i1', name: 'Pistol Squat Progressions', duration: '8 reps per leg × 3 sets', calories: '120-150', description: 'Single leg squat preparation exercises', videoUrl: 'https://youtube.com/watch?v=pistol-progression', bodyPart: 'Lower Body' },
          { id: 'cal-lower-i2', name: 'Jump Squats', duration: '15 reps × 3 sets', calories: '110-140', description: 'Explosive squats with jump at top', videoUrl: 'https://youtube.com/watch?v=jump-squats', bodyPart: 'Lower Body' },
          { id: 'cal-lower-i3', name: 'Walking Lunges', duration: '12 reps per leg × 3 sets', calories: '100-130', description: 'Continuous forward lunges', videoUrl: 'https://youtube.com/watch?v=walking-lunges', bodyPart: 'Lower Body' },
          { id: 'cal-lower-i4', name: 'Box Jumps', duration: '10 reps × 3 sets', calories: '120-150', description: 'Jumping onto elevated platform', videoUrl: 'https://youtube.com/watch?v=box-jumps', bodyPart: 'Lower Body' }
        ],
        hardcore: [
          // Upper Body
          { id: 'cal-upper-h1', name: 'One-Arm Push-Up Progressions', duration: '5 reps per arm × 3 sets', calories: '150-180', description: 'Working toward single arm push-ups', videoUrl: 'https://youtube.com/watch?v=one-arm-pushup', bodyPart: 'Upper Body' },
          { id: 'cal-upper-h2', name: 'Muscle-Ups', duration: '5 reps × 4 sets', calories: '160-200', description: 'Combined pull-up and dip movement', videoUrl: 'https://youtube.com/watch?v=muscle-ups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-h3', name: 'Front Lever', duration: '15 seconds × 5 sets', calories: '120-150', description: 'Advanced hanging straight body hold', videoUrl: 'https://youtube.com/watch?v=front-lever', bodyPart: 'Upper Body' },
          { id: 'cal-upper-h4', name: 'Handstand Push-Ups', duration: '6 reps × 3 sets', calories: '130-160', description: 'Push-ups in handstand position', videoUrl: 'https://youtube.com/watch?v=handstand-pushups', bodyPart: 'Upper Body' },
          { id: 'cal-upper-h5', name: 'Planche Progressions', duration: '20 seconds × 4 sets', calories: '140-170', description: 'Working toward full planche hold', videoUrl: 'https://youtube.com/watch?v=planche-progression', bodyPart: 'Upper Body' },
          { id: 'cal-upper-h6', name: 'Ring Muscle-Ups', duration: '3 reps × 5 sets', calories: '170-200', description: 'Muscle-ups performed on gymnastic rings', videoUrl: 'https://youtube.com/watch?v=ring-muscle-ups', bodyPart: 'Upper Body' },
          
          // Lower Body
          { id: 'cal-lower-h1', name: 'Pistol Squats', duration: '6 reps per leg × 4 sets', calories: '150-180', description: 'Full single leg squats', videoUrl: 'https://youtube.com/watch?v=pistol-squats', bodyPart: 'Lower Body' },
          { id: 'cal-lower-h2', name: 'Shrimp Squats', duration: '5 reps per leg × 4 sets', calories: '140-170', description: 'Advanced single leg squat variation', videoUrl: 'https://youtube.com/watch?v=shrimp-squats', bodyPart: 'Lower Body' },
          { id: 'cal-lower-h3', name: 'Plyometric Lunges', duration: '8 reps per leg × 4 sets', calories: '160-190', description: 'Explosive lunge jumps', videoUrl: 'https://youtube.com/watch?v=plyometric-lunges', bodyPart: 'Lower Body' },
          { id: 'cal-lower-h4', name: 'Dragon Flags', duration: '6 reps × 4 sets', calories: '130-160', description: 'Advanced core exercise raising straight body', videoUrl: 'https://youtube.com/watch?v=dragon-flags', bodyPart: 'Lower Body' }
        ]
      },
      'HIIT': {
        beginner: [
          { id: 'hiit-b1', name: 'Marching in Place', duration: '30 seconds on, 30 seconds rest × 5', calories: '80-100', description: 'High knees while stationary', videoUrl: 'https://youtu.be/Ac8M_Osjy6s?si=WNlMqkHIMUjVDG9X' },
          { id: 'hiit-b2', name: 'Modified Jumping Jacks', duration: '30 seconds on, 30 seconds rest × 5', calories: '90-110', description: 'Lower impact jumping jacks', videoUrl: 'https://youtu.be/Ac8M_Osjy6s?si=WNlMqkHIMUjVDG9X' },
          { id: 'hiit-b3', name: 'Step Touches', duration: '30 seconds on, 30 seconds rest × 5', calories: '70-90', description: 'Side-to-side stepping motion', videoUrl: 'https://youtu.be/wH9hsR7Ck_M?si=TWwEQk7JpW7qrl0K' },
          { id: 'hiit-b4', name: 'Bodyweight Squats', duration: '30 seconds on, 30 seconds rest × 5', calories: '90-110', description: 'Basic squat movement', videoUrl: 'https://youtu.be/8uoaYwS6iFM?si=Cb9XHyAx5hvhWE5z' },
          { id: 'hiit-b5', name: 'Incline Push-Ups', duration: '30 seconds on, 30 seconds rest × 5', calories: '80-100', description: 'Push-ups with hands elevated', videoUrl: 'https://youtu.be/QAF830S96gs?si=FK7TNMBv-Zav4CiA' },
          { id: 'hiit-b6', name: 'Seated Punches', duration: '30 seconds on, 30 seconds rest × 5', calories: '60-80', description: 'Punching motion while seated', videoUrl: 'https://youtu.be/BqIryHLrTAg?si=tyoKpUUcUcH3y9Sj' }
        ],
        intermediate: [
          { id: 'hiit-i1', name: 'Jumping Jacks', duration: '40 seconds on, 20 seconds rest × 6', calories: '140-170', description: 'Full jumping jacks at moderate pace', videoUrl: 'https://youtube.com/watch?v=jumping-jacks' },
          { id: 'hiit-i2', name: 'High Knees', duration: '40 seconds on, 20 seconds rest × 6', calories: '150-180', description: 'Running in place with high knees', videoUrl: 'https://youtube.com/watch?v=high-knees' },
          { id: 'hiit-i3', name: 'Mountain Climbers', duration: '40 seconds on, 20 seconds rest × 6', calories: '160-190', description: 'Alternating knee drives in plank position', videoUrl: 'https://youtube.com/watch?v=mountain-climbers' },
          { id: 'hiit-i4', name: 'Squat Jumps', duration: '40 seconds on, 20 seconds rest × 6', calories: '170-200', description: 'Explosive jumps from squat position', videoUrl: 'https://youtube.com/watch?v=squat-jumps' },
          { id: 'hiit-i5', name: 'Push-Up to Plank Jack', duration: '40 seconds on, 20 seconds rest × 6', calories: '160-190', description: 'Push-up followed by plank with jumping feet', videoUrl: 'https://youtube.com/watch?v=pushup-plankjack' },
          { id: 'hiit-i6', name: 'Alternating Reverse Lunges', duration: '40 seconds on, 20 seconds rest × 6', calories: '150-180', description: 'Lunges alternating legs', videoUrl: 'https://youtube.com/watch?v=reverse-lunges' }
        ],
        hardcore: [
          { id: 'hiit-h1', name: 'Burpee Pull-Ups', duration: '45 seconds on, 15 seconds rest × 8', calories: '220-260', description: 'Burpee followed by pull-up', videoUrl: 'https://youtube.com/watch?v=burpee-pullups' },
          { id: 'hiit-h2', name: 'Kettlebell Swings', duration: '45 seconds on, 15 seconds rest × 8', calories: '200-240', description: 'Full swings with heavy kettlebell', videoUrl: 'https://youtube.com/watch?v=kettlebell-swings' },
          { id: 'hiit-h3', name: 'Box Jump Burpees', duration: '45 seconds on, 15 seconds rest × 8', calories: '230-270', description: 'Burpee with box jump at end', videoUrl: 'https://youtube.com/watch?v=box-jump-burpees' },
          { id: 'hiit-h4', name: 'Assault Bike Sprints', duration: '45 seconds on, 15 seconds rest × 8', calories: '220-260', description: 'Maximum effort on assault bike', videoUrl: 'https://youtube.com/watch?v=assault-bike' },
          { id: 'hiit-h5', name: 'Thrusters', duration: '45 seconds on, 15 seconds rest × 8', calories: '210-250', description: 'Squat to overhead press with barbell or dumbbells', videoUrl: 'https://youtube.com/watch?v=thrusters' },
          { id: 'hiit-h6', name: 'Double Unders', duration: '45 seconds on, 15 seconds rest × 8', calories: '190-230', description: 'Jump rope passing twice under feet per jump', videoUrl: 'https://youtube.com/watch?v=double-unders' }
        ]
      }
    };

    // Add more detailed video URLs
    const videoBasePaths = {
      'Weight Loss': 'https://www.youtube.com/watch?v=',
      'Muscle Building': 'https://www.youtube.com/watch?v=',
      'Calisthenics': 'https://www.youtube.com/watch?v=',
      'HIIT': 'https://www.youtube.com/watch?v='
    };

    const videoIds = {
      'Weight Loss': ['nCKakHXQd38', 'gC_L9qAHVJ8', 'VWj8ZxCxrYk'],
      'Muscle Building': ['eMjyvIQbn9M', 'l0gDqsSQWQw', 'pRyytPjhXCo'],
      'Calisthenics': ['_S817Ccy6MU', 'tB3X4ryt95Q', 'iXsrEo6Kt6w'],
      'HIIT': ['ml6cT4AZdqI', 'LZ1y5L_C-W4', 'xwkWRRFB-qI']
    };

    // Enhance video URLs by adding real YouTube video IDs
    Object.keys(workoutPrograms).forEach(cat => {
      Object.keys(workoutPrograms[cat]).forEach(level => {
        workoutPrograms[cat][level].forEach((workout, index) => {
          const randomId = index < videoIds[cat].length 
            ? videoIds[cat][index] 
            : videoIds[cat][index % videoIds[cat].length];
          workout.videoUrl = `${videoBasePaths[cat]}${randomId}`;
        });
      });
    });

    // Return all levels for the requested category
    res.json({ 
      category,
      workoutPrograms: workoutPrograms[category]
    });
  } catch (error) {
    console.error('Error serving workout videos:', error);
    res.status(500).json({ 
      message: 'Internal server error fetching workout videos',
      error: process.env.NODE_ENV === 'production' ? null : error.message 
    });
  }
});

// Get user's workout plan
router.get('/plan', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ workoutPlan: user.workoutPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate personalized workout plan
router.post('/plan/generate', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { fitnessGoal } = user;
    
    if (!fitnessGoal) {
      return res.status(400).json({ message: 'Please set your fitness goal first' });
    }

    // Here you would implement logic to generate a personalized workout plan
    // For now, creating a simple mock plan
    const workoutPlan = [
      {
        day: 'Monday',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12, videoUrl: 'https://youtube.com/watch?v=pushups' },
          { name: 'Squats', sets: 3, reps: 15, videoUrl: 'https://youtube.com/watch?v=squats' }
        ]
      },
      {
        day: 'Wednesday',
        exercises: [
          { name: 'Pull-ups', sets: 3, reps: 8, videoUrl: 'https://youtube.com/watch?v=pullups' },
          { name: 'Lunges', sets: 3, reps: 12, videoUrl: 'https://youtube.com/watch?v=lunges' }
        ]
      },
      {
        day: 'Friday',
        exercises: [
          { name: 'Plank', sets: 3, reps: 60, videoUrl: 'https://youtube.com/watch?v=plank' },
          { name: 'Burpees', sets: 3, reps: 10, videoUrl: 'https://youtube.com/watch?v=burpees' }
        ]
      }
    ];

    user.workoutPlan = workoutPlan;
    await user.save();

    res.json({ workoutPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track workout completion
router.post('/track', authMiddleware, authMiddleware.memberOnly, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { date = new Date(), workoutCompleted = true } = req.body;

    const progress = {
      date,
      workoutCompleted,
      weight: user.measurements?.weight
    };

    user.progress.push(progress);
    await user.save();

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get difficulty levels for a category
router.get('/difficulty/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['cardio', 'strength', 'flexibility', 'hiit', 'yoga'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Return all available difficulty levels for the requested category
    res.json({ 
      category,
      difficulties: ['beginner', 'intermediate', 'advanced']
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public routes
router.get('/', workoutController.getAllWorkouts);
router.get('/featured', workoutController.getFeaturedWorkouts);
router.get('/search/:query', workoutController.searchWorkouts);
router.get('/category/:category', workoutController.getWorkoutsByCategory);
router.get('/difficulty/:difficulty', workoutController.getWorkoutsByDifficulty);
router.get('/category/:category/difficulty/:difficulty', workoutController.getWorkoutsByCategoryAndDifficulty);
router.get('/:id', workoutController.getWorkoutById);

// Protected routes - require authentication
router.post('/', authMiddleware, workoutController.createWorkout);
router.put('/:id', authMiddleware, workoutController.updateWorkout);
router.delete('/:id', authMiddleware, workoutController.deleteWorkout);

module.exports = router; 