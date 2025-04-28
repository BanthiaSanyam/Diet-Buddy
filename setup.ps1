# DietBuddy Project Setup Script (PowerShell)
Write-Host "DietBuddy Setup Script" -ForegroundColor Green
Write-Host "----------------------" -ForegroundColor Green

# Check Node.js installation
try {
    $nodeVersion = node -v
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js before continuing." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install

# Test database connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
npm run test:db

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "../frontend"
npm install --legacy-peer-deps

# Seed the database
Write-Host "`nSeeding the database with initial data..." -ForegroundColor Yellow
Set-Location -Path "../backend"
npm run seed

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "`nTo start the application, run:" -ForegroundColor Cyan
Write-Host "1. Navigate to the backend directory: cd backend" -ForegroundColor Cyan
Write-Host "2. Run both frontend and backend: npm run dev:full" -ForegroundColor Cyan
Write-Host "`nOr start them separately:" -ForegroundColor Cyan
Write-Host "- Frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "- Backend: cd backend && npm run dev" -ForegroundColor Cyan

Write-Host "`nAccess the application at:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5007" -ForegroundColor Cyan

# Return to the project root directory
Set-Location -Path ".." 