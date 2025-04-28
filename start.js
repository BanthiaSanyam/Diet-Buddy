const { spawn } = require('child_process');
const path = require('path');

// Build frontend
console.log('Building frontend...');
const frontendBuild = spawn('npm', ['run', 'build'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true
});

frontendBuild.stdout.on('data', (data) => {
  console.log(`Frontend build: ${data}`);
});

frontendBuild.stderr.on('data', (data) => {
  console.error(`Frontend build error: ${data}`);
});

frontendBuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`Frontend build process exited with code ${code}`);
    return;
  }
  
  console.log('Frontend built successfully');
  console.log('Starting backend server...');
  
  // Start backend server
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    shell: true
  });
  
  backend.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  
  backend.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });
  
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}); 