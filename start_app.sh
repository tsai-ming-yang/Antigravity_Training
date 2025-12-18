#!/bin/bash

# Start Backend
echo "Starting Backend..."
cd server
npm install # Ensure deps
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend running (PID: $BACKEND_PID)"

# Start Frontend
echo "Starting Frontend..."
cd ../client
npm install # Ensure deps
npm run dev

# Cleanup on exit
kill $BACKEND_PID
