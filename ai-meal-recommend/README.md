# DietBuddy

A fitness and nutrition platform to help users achieve their health goals through personalized workout plans and meal suggestions.

## Project Structure

The project is organized into two main folders:

- **frontend**: React application built with Vite, React Router, and Tailwind CSS
- **backend**: Node.js/Express server with MongoDB database

## Features

- User authentication (register, login, profile management)
- Workout programs based on fitness goals and difficulty levels
- Meal plans categorized by type (vegetarian/non-vegetarian) and meal time
- Responsive design that works on mobile and desktop

## Prerequisites

- Node.js (v14+)
- MongoDB (local instance or MongoDB Atlas account)

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

#### Windows
```bash
# Run the PowerShell setup script
.\setup.ps1
```

#### Mac/Linux
```bash
# Make the script executable if needed
chmod +x setup.sh

# Run the bash setup script
./setup.sh
```

### Option 2: Manual Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/dietbuddy.git
cd dietbuddy
```

2. Install dependencies
```bash
npm run install-all
```

3. Configure the backend
- Create a MongoDB database (local or Atlas)
- Set up the environment variables in `backend/.env`:
  ```
  PORT=5007
  MONGODB_URI=mongodb://127.0.0.1:27017/dietbuddy
  JWT_SECRET=your_secret_key
  RAZORPAY_KEY_ID=your_razorpay_id
  RAZORPAY_KEY_SECRET=your_razorpay_secret
  ```

4. Seed the database with initial data
```bash
cd backend
npm run seed:meals
```

5. Start the development servers
```bash
# From the root directory
npm run dev
```

This will start both the frontend (localhost:5173) and backend (localhost:5007) servers.

## Testing

The backend includes scripts to test database connectivity and API endpoints:

```bash
# Test database connection
cd backend
npm run test:db

# Test API endpoints (server must be running)
npm run test:routes
```

## API Endpoints

### User Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login
- GET `/api/users/profile` - Get user profile (requires authentication)
- PATCH `/api/users/profile` - Update user profile (requires authentication)

### Workouts
- GET `/api/workouts` - Get all workout categories
- GET `/api/workouts/difficulty/:category` - Get workouts by category and difficulty level

### Meals
- GET `/api/meals` - Get all meals
- GET `/api/meals/category/:category` - Get meals by category (Vegetarian/Non-Vegetarian)
- GET `/api/meals/type/:type` - Get meals by type (Breakfast/Lunch/Dinner/Snack)
- GET `/api/meals/featured` - Get featured meals
- GET `/api/meals/search` - Search meals by name or ingredients

## Tech Stack

### Frontend
- React (with Hooks)
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Chatbot Integration

DietBuddy now includes an AI-powered chatbot assistant (FitGenie) that can provide users with fitness and nutrition advice. The chatbot uses Google's Gemini API to generate helpful responses tailored to fitness and nutrition queries.

### Chatbot Features
- Accessible from any page via a floating chat button in the bottom right corner
- Provides concise fitness and nutrition advice in bullet point format
- Real-time chat interface with typing indicators

### Technical Implementation
- Backend: Integrated with Google's Gemini API (model: gemini-1.5-pro)
- Frontend: React component with a modern, responsive chat interface
- API: RESTful endpoint at `/api/chatbot/message` for communication with the Gemini API

### Configuration
To use the chatbot feature, you need to:
1. Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. Add your API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ``` 