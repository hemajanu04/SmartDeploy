# 🚀 SmartDeploy - Automated CI/CD Deployment Platform

[![Status](https://img.shields.io/badge/status-complete-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)]()
[![Node](https://img.shields.io/badge/Node-18+-339933)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)]()

> **Deploy any GitHub project to the cloud with a single click!**

SmartDeploy is a web-based automated CI/CD deployment platform that enables developers to deploy their GitHub projects to the cloud without any server knowledge. It integrates Jenkins, Docker, SonarCloud, and Render.com into a seamless, one-click deployment workflow.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **GitHub OAuth Login** | Secure authentication without storing passwords |
| 📦 **Auto Stack Detection** | Automatically detects Node.js, Java, Python, PHP |
| 🧪 **Automated Testing** | Runs unit tests before deployment |
| 🔍 **SonarCloud Integration** | Code quality analysis and security scanning |
| 🐳 **Docker Containerization** | Packages apps into portable containers |
| ☁️ **Cloud Deployment** | Deploys to Render.com with live URL |
| 📧 **Email Notifications** | Success/failure emails to users |
| 📊 **Real-time Dashboard** | 8-stage pipeline visualizer with live logs |
| 📜 **Deployment History** | Complete history stored in MongoDB |
| 🔄 **Self-Healing** | Docker restart policy for crashed apps |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React.js 18, Material UI | User Interface |
| **Backend** | Node.js, Express.js | REST API Server |
| **Database** | MongoDB | User & Deployment Data |
| **Authentication** | GitHub OAuth, Passport.js | Secure Login |
| **CI/CD** | Jenkins | Pipeline Automation |
| **Container** | Docker | Application Packaging |
| **Registry** | DockerHub | Image Storage |
| **Code Quality** | SonarCloud | Static Code Analysis |
| **Cloud** | Render.com | Application Hosting |
| **Email** | Nodemailer | Build Notifications |

---

## 🏗️ Architecture

┌─────────────┐ │ User │ │ (Browser) │ └──────┬──────┘ │ ▼ ┌─────────────────────────┐ │ Frontend (React) │ │ localhost:3000 │ └──────┬──────────────────┘ │ API Calls ▼ ┌─────────────────────────┐ │ Backend (Node.js) │ │ localhost:5000 │ └────────────────────────┘ │ ├──► MongoDB (localhost:27017) │ ├──► Jenkins (localhost:8080) │ │ │ ├──► Git Clone │ ├──► Run Tests │ ├──► SonarCloud Scan │ ├──► Docker Build │ └──► Push to DockerHub │ └──► Email (Nodemailer) │ ▼ ┌─────────────────┐ │ Render.com │ │ (Cloud URL) │ └─────────────────┘

---

## 📦 Installation

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- MongoDB ([Download](https://mongodb.com))
- Docker Desktop ([Download](https://docker.com))
- Jenkins ([Download](https://jenkins.io))
- Git ([Download](https://git-scm.com))

### Step 1: Clone Repository

```bash
git clone https://github.com/hemajanu04/SmartDeploy.git
cd SmartDeploy
Step 2: Install Backend Dependencies
cd backend
npm install
Step 3: Install Frontend Dependencies
cd ../frontend
npm install
Step 4: Configure Environment Variables
Create backend/.env file:

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smartdeploy

# Jenkins
JENKINS_URL=http://localhost:8080
JENKINS_API_TOKEN=your-jenkins-token

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Render (Optional)
RENDER_API_KEY=your-render-api-key
Step 5: Start MongoDB
mongod --dbpath D:\DevTools\MongoDBData
Step 6: Start Jenkins
# Windows: Run Jenkins service
# Or: java -jar jenkins.war
Step 7: Start Backend Server
cd backend
node server.js
Step 8: Start Frontend
cd frontend
npm start
Step 9: Access Application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
Jenkins: http://localhost:8080
🚀 Usage
1. Login with GitHub
Open http://localhost:3000
Click "Login with GitHub"
Authorize SmartDeploy to access your repositories
2. Deploy a Repository
View your GitHub repositories on the dashboard
Click "Deploy to Cloud" on any repository
Watch the 8-stage pipeline progress in real-time
Receive email notification with live URL
3. View Deployment History
Click "View History" button (top right)
See all past deployments with status and URLs
4. Logout
Click profile icon (top right)
Select "Logout"
📁 Project Structure
SmartDeploy/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Deployment.js
│   ├── routes/
│   │   ├── deploy.js
│   │   ├── repos.js
│   │   └── jenkins-callback.js
│   ├── utils/
│   │   ├── email.js
│   │   ├── jenkins.js
│   │   └── render.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   └── DeploymentHistory.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── Jenkins/
│   └── Jenkinsfile
│
├── .gitignore
├── README.md
└── package.json
📸 Screenshots
Login Page
[Image blocked: Login]

Dashboard with Repositories
[Image blocked: Dashboard]

Deployment Pipeline
[Image blocked: Pipeline]

Jenkins Success
[Image blocked: Jenkins]

Email Notification
[Image blocked: Email]

Deployment History
[Image blocked: History]

📝 To add screenshots:

Create folder: screenshots/
Save your screenshots there
Update the image paths above
📄 License
This project is licensed under the MIT License.

🙏 Acknowledgements
GitHub OAuth
Jenkins CI/CD
Docker
SonarCloud
Render.com
Material UI
MongoDB
📞 Contact
GitHub: @hemajanu04

⭐ If you like this project, give it a star! ⭐
Built with ❤️ by SmartDeploy Team