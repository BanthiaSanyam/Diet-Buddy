const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
    const envContent = `MONGODB_URI=mongodb+srv://dietbuddy:dietbuddy123@cluster0.mongodb.net/dietbuddy
JWT_SECRET=your_jwt_secret_key_123456789
PORT=5007
NODE_ENV=development`;
    fs.writeFileSync(envPath, envContent);
    console.log('.env file created');
}

// Install dependencies
console.log('Installing backend dependencies...');
const backendInstall = spawn('npm', ['install'], {
    cwd: path.join(__dirname, 'backend'),
    shell: true,
    stdio: 'inherit'
});

backendInstall.on('close', (code) => {
    if (code !== 0) {
        console.error('Backend dependency installation failed');
        return;
    }
    
    console.log('Installing frontend dependencies...');
    const frontendInstall = spawn('npm', ['install'], {
        cwd: path.join(__dirname, 'frontend'),
        shell: true,
        stdio: 'inherit'
    });

    frontendInstall.on('close', (code) => {
        if (code !== 0) {
            console.error('Frontend dependency installation failed');
            return;
        }

        // Start backend
        console.log('Starting backend server...');
        const backend = spawn('npm', ['start'], {
            cwd: path.join(__dirname, 'backend'),
            shell: true,
            stdio: 'inherit'
        });

        // Start frontend
        console.log('Starting frontend server...');
        const frontend = spawn('npm', ['run', 'dev'], {
            cwd: path.join(__dirname, 'frontend'),
            shell: true,
            stdio: 'inherit'
        });

        // Handle process termination
        process.on('SIGINT', () => {
            backend.kill();
            frontend.kill();
            process.exit();
        });
    });
}); 