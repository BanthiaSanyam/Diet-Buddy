#!/bin/bash
# DietBuddy Project Setup Script (Bash)

echo -e "\e[32mDietBuddy Setup Script\e[0m"
echo -e "\e[32m----------------------\e[0m"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "\e[31mNode.js is not installed. Please install Node.js before continuing.\e[0m"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "\e[32mNode.js is installed: $NODE_VERSION\e[0m"
fi

# Install backend dependencies
echo -e "\n\e[33mInstalling backend dependencies...\e[0m"
cd backend
npm install

# Test database connection
echo -e "\n\e[33mTesting database connection...\e[0m"
npm run test:db

# Install frontend dependencies
echo -e "\n\e[33mInstalling frontend dependencies...\e[0m"
cd ../frontend
npm install --legacy-peer-deps

# Seed the database
echo -e "\n\e[33mSeeding the database with initial data...\e[0m"
cd ../backend
npm run seed

echo -e "\n\e[32mSetup completed successfully!\e[0m"
echo -e "\n\e[36mTo start the application, run:\e[0m"
echo -e "\e[36m1. Navigate to the backend directory: cd backend\e[0m"
echo -e "\e[36m2. Run both frontend and backend: npm run dev:full\e[0m"
echo -e "\n\e[36mOr start them separately:\e[0m"
echo -e "\e[36m- Frontend: cd frontend && npm run dev\e[0m"
echo -e "\e[36m- Backend: cd backend && npm run dev\e[0m"

echo -e "\n\e[36mAccess the application at:\e[0m"
echo -e "\e[36m- Frontend: http://localhost:5173\e[0m"
echo -e "\e[36m- Backend: http://localhost:5007\e[0m"

# Return to the project root directory
cd .. 