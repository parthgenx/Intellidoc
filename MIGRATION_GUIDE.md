# IntelliDoc MacBook Migration Guide

This guide will help you set up the IntelliDoc project on your new MacBook after cloning from GitHub.

## 📋 Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Clone Repository](#clone-repository)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites Installation

### Install Homebrew (macOS Package Manager)

Open Terminal and run:

\`\`\`bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
\`\`\`

After installation, follow the instructions to add Homebrew to your PATH.

### Install Python 3.9+

\`\`\`bash
brew install python@3.11
\`\`\`

Verify installation:
\`\`\`bash
python3 --version
# Should show Python 3.11.x or higher
\`\`\`

### Install Node.js 18+

\`\`\`bash
brew install node
\`\`\`

Verify installation:
\`\`\`bash
node --version
# Should show v18.x or higher

npm --version
# Should show 9.x or higher
\`\`\`

### Install Git (if not already installed)

\`\`\`bash
brew install git
\`\`\`

Configure Git:
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

---

## 2. Clone Repository

\`\`\`bash
# Navigate to where you want to store the project
cd ~/Documents  # or your preferred location

# Clone the repository
git clone <your-github-repo-url>

# Navigate into the project
cd IntelliDoc
\`\`\`

---

## 3. Backend Setup

### Create Virtual Environment

\`\`\`bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# You should see (venv) in your terminal prompt
\`\`\`

### Install Python Dependencies

\`\`\`bash
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

**Expected packages:**
- FastAPI
- Uvicorn
- Supabase
- Pinecone
- Google Generative AI
- Python-dotenv
- And other dependencies

---

## 4. Frontend Setup

Open a **new terminal window/tab** (keep backend terminal open):

\`\`\`bash
cd ~/Documents/IntelliDoc/frontend  # adjust path as needed

# Install npm packages
npm install
\`\`\`

This will install:
- React 19
- Vite
- TailwindCSS
- Axios
- React Router
- And other dependencies

---

## 5. Environment Configuration

### Create Backend .env File

\`\`\`bash
cd ~/Documents/IntelliDoc/backend

# Copy the example file
cp .env.example .env

# Open .env in your preferred editor
nano .env
# or
open -e .env
# or use VS Code
code .env
\`\`\`

### Fill in Your API Keys

**IMPORTANT:** You'll need to transfer your actual API keys from your Windows machine. Use a secure method:

**Option A: Password Manager**
- Save your `.env` contents in a password manager (1Password, Bitwarden, etc.)
- Copy to your MacBook

**Option B: Secure Cloud Storage**
- Upload encrypted file to Google Drive/Dropbox
- Download on MacBook

**Option C: Manual Transfer**
- Use AirDrop (if Windows machine has AirDrop support via third-party apps)
- Or manually type the keys (secure but tedious)

Your `.env` should contain:

\`\`\`env
SUPABASE_URL=https://dushsfnwqdcugeafheux.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
\`\`\`

---

## 6. Running the Application

### Start Backend Server

In your backend terminal (with venv activated):

\`\`\`bash
cd ~/Documents/IntelliDoc/backend
source venv/bin/activate  # if not already activated

# Start FastAPI server
uvicorn app.main:app --reload
\`\`\`

You should see:
\`\`\`
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
\`\`\`

**Backend URLs:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Start Frontend Server

In your frontend terminal:

\`\`\`bash
cd ~/Documents/IntelliDoc/frontend

# Start Vite dev server
npm run dev
\`\`\`

You should see:
\`\`\`
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
\`\`\`

**Frontend URL:** http://localhost:5173

### Access the Application

Open your browser and navigate to:
- **http://localhost:5173** - Main application

---

## 7. Troubleshooting

### Python Command Not Found

If \`python3\` is not found:
\`\`\`bash
# Check if Python is installed
which python3

# If not found, reinstall
brew install python@3.11

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
\`\`\`

### Virtual Environment Activation Issues

If \`source venv/bin/activate\` doesn't work:
\`\`\`bash
# Try with full path
source ~/Documents/IntelliDoc/backend/venv/bin/activate

# Or recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
\`\`\`

### Port Already in Use

If port 8000 or 5173 is already in use:

**Backend (port 8000):**
\`\`\`bash
# Find process using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
uvicorn app.main:app --reload --port 8001
\`\`\`

**Frontend (port 5173):**
\`\`\`bash
# Vite will automatically try the next available port
# Or specify a different port in vite.config.js
\`\`\`

### Module Not Found Errors

If you get "Module not found" errors:

**Backend:**
\`\`\`bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
\`\`\`

**Frontend:**
\`\`\`bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### CORS Errors

If you see CORS errors in the browser console, check that:
1. Backend is running on http://localhost:8000
2. Frontend is running on http://localhost:5173
3. CORS is properly configured in `backend/app/main.py`

### Supabase Connection Issues

If you can't connect to Supabase:
1. Verify your `.env` file has correct credentials
2. Check Supabase dashboard to ensure project is active
3. Verify Row-Level Security (RLS) policies are configured

### Pinecone Connection Issues

If Pinecone fails to connect:
1. Verify API key in `.env`
2. Check Pinecone dashboard for index status
3. Ensure index name matches your configuration

### macOS-Specific: Permission Denied

If you get permission errors:
\`\`\`bash
# Fix permissions for project directory
chmod -R 755 ~/Documents/IntelliDoc

# For pip installations
pip install --user -r requirements.txt
\`\`\`

---

## 🎉 Success!

If everything is working:
1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ You can upload documents
4. ✅ You can chat with AI
5. ✅ No console errors

---

## 📝 Daily Development Workflow

### Starting Work

\`\`\`bash
# Terminal 1 - Backend
cd ~/Documents/IntelliDoc/backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd ~/Documents/IntelliDoc/frontend
npm run dev
\`\`\`

### Stopping Servers

- Press **Ctrl+C** in each terminal to stop the servers

### Updating Dependencies

**Backend:**
\`\`\`bash
pip install <package-name>
pip freeze > requirements.txt
\`\`\`

**Frontend:**
\`\`\`bash
npm install <package-name>
\`\`\`

### Committing Changes

\`\`\`bash
git add .
git commit -m "Your commit message"
git push origin main
\`\`\`

---

## 🔗 Useful Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Google Gemini API](https://ai.google.dev/)

---

## 💡 Tips for macOS Development

1. **Use iTerm2** instead of default Terminal for better features
2. **Install VS Code** for a great development experience
3. **Use Homebrew** to manage all your development tools
4. **Enable Touch ID for sudo** to avoid typing password repeatedly
5. **Use Spotlight (Cmd+Space)** to quickly launch applications

Happy coding on your new MacBook! 🚀
