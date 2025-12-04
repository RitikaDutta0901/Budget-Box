# 💰 BudgetBox – Offline-First Personal Budgeting App

BudgetBox is a local-first personal finance tracker designed to work even when the internet is completely unavailable.  
It auto-saves every keystroke, stores data safely inside the browser (IndexedDB), and syncs with the server only when the network is available.

This project was built as part of the **BudgetBox Assignment** :contentReference[oaicite:1]{index=1}

---

## 📌 1. Overview

Traditional budgeting tools stop working the moment internet drops.  
**BudgetBox solves this by adopting Local-First principles:**

- Works fully offline  
- Auto-saves all inputs instantly  
- Stores everything locally using IndexedDB  
- Allows user-controlled syncing  
- Server & local data stay aligned  
- Dashboard updates automatically  

The goal is to make the experience feel like **Google Docs offline mode**.

---

## 📌 2. Features

### 🔵 **Add & Edit Monthly Budget**
Single form with fields:
- Income  
- Monthly Bills  
- Food  
- Transport  
- Subscriptions  
- Miscellaneous  

Every field is:
- Auto-saved locally  
- Editable anytime  
- Available offline

---

### 🟢 **Auto-Generated Dashboard**

The dashboard updates as soon as the user enters data.

It includes:
- **Burn Rate** (Total Spend / Income)
- **Savings Potential**
- **Month-End Prediction**
- **Category Pie Chart**
- **Basic Anomaly Warnings**, e.g.  
  - “Subscriptions are 30% of income — too high!”  
  - “Your expenses exceed income.”

---

### 🟠 **Local-First Data Behavior (Core Requirement)**

BudgetBox implements:

#### **Local DB**
- IndexedDB via **localForage**
- State handled using **Zustand persist**

#### **Offline Mode**
- App works even with 0 internet  
- Auto-save on each keystroke  
- Visual offline indicator  
- Local state never lost  

#### **Sync Logic**
A dedicated **Sync button** displays statuses:
- **Local Only** – saved locally but never synced  
- **Sync Pending** – local edits waiting for network  
- **Synced** – server & local aligned  

Server always returns a timestamp, used to compare versions during sync.

---

### 🟤 Optional Enhancements (Implemented Where Applicable)

- Rule-based suggestions (no GPT)  
- PWA structure (optional but supported)  
- Service Worker skeleton  

---

## 📌 3. Tech Stack

### **Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Zustand (local-first state management)
- TailwindCSS v4
- localForage (IndexedDB)
- Recharts (Analytics UI)

### **Backend**
- Node.js + Express  
- REST Endpoints:
  - `POST /budget/sync`  
  - `GET /budget/latest`
- Database: MongoDB / PostgreSQL (your setup)
- Deployed on Render

---

## 📌 4. System Architecture

          ┌──────────────────────────────┐
          │          FRONTEND             │
          │  Next.js + Zustand + Tailwind │
          └───────────────┬──────────────┘
                          |
                    LocalForage (IndexedDB)
                          |
                 Auto-Save Every Keystroke
                          |
                      Sync Button
                          |
          ┌────────────────────────────────┐
          │            BACKEND             │
          │   Node.js / Express + DB       │
          └────────────────────────────────┘

---

## 📌 5. Setup Instructions

### **Frontend Setup**
cd frontend
npm install

### **Backend Setup**
cd backend
npm install
npm run dev

## 📌 6. Production Build
Frontend:
npm run build
PORT=3000 npm run start

Backend:
npm start

## 📌 7. Deployment Guide (Render)
Frontend
Create a Web Service
Node Version: 20.9.0+
Build command:npm ci && npm run build
Start command:npm run start
NEXT_PUBLIC_API_BASE=https://budget-box-4.onrender.com/ || http://localhost:3000

Backend
Web Service
DB_URL="postgresql://budget_user:ritika09@localhost:5432/budgetdb"
backend= https://budget-box-v72w.onrender.com/api || http://localhost:5000

## 📌 8. Demo Credentials (Required for Review)
Email: hire-me@anshumat.org
Password: HireMe@2025!

## 📌 9. Screenshot
![Dashboard Screenshot](Dashboard.png)
![Dashboard Screenshot](HomePage.png)
![Dashboard Screenshot](Login.png)
![Dashboard Screenshot](snapshot.png)
![Dashboard Screenshot](offlineFeature.png)
![Dashboard Screenshot](Syncfeature.png)


## 📌10. Submission Details
Name: Ritika Dutta
GitHub Repo: https://github.com/RitikaDutta0901/Budget-Box.git
Live Demo Link:https://budget-box-4.onrender.com (frontend)    
              :https://budget-box-v72w.onrender.com/api (backend)
Tech Stack: Next.js 16, React 19, Zustand, TailwindCSS, Express, Render
Notes for Reviewer: 
The app is designed following Local-First principles and works fully offline.

## 📌11. Offline mode instruction
Open the app
Turn off Wi-Fi
Change budget numbers
Refresh page → Data remains
Turn Wi-Fi back on
Click Sync
Server receives updated snapshot
Dashboard reflects latest data