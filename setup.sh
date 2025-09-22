#!/bin/bash

echo "🚀 Setting up Rural STEM Quest Project..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Create virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python -c "
from database import init_db
init_db()
print('Database initialized successfully')
"

cd ..

# Setup frontend
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

echo "✅ Setup completed successfully!"
echo ""
echo "🎮 To run the project:"
echo "Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"