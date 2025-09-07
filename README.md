# 🐶 SoPup Cloud Backend

This is the **serverless backend** for **SoPup**, an iOS mobile application that helps dog owners connect, socialise, and manage their dogs responsibly.  
The backend is implemented as a **Firebase 2nd Gen Cloud Function** (`api`) with an **Express.js app** that exposes RESTful endpoints for all core features.

---

## 🐾 About SoPup

SoPup is designed to support responsible dog ownership by combining **veterinary research on early puppy socialisation** with modern **mobile and cloud technologies**.  

The app provides two modes of experience:

- **Puppy Mode (0–12 weeks)**  
  - ✅ **Compatibility-based matchmaking**  
  - ✅ **Chat** with matched owners  
  - ❌ **Meet-ups** and **reviews** are **disabled** for safety  

- **Social Mode (12+ weeks)**  
  - ✅ **Compatibility-based matchmaking**  
  - ✅ **Chat** with matched owners  
  - ✅ **Meet-ups** to arrange safe playdates  
  - ✅ **Reviews** after completed meet-ups  

SoPup empowers owners to:
- Create and manage dog profiles  
- Find compatible matches nearby  
- Chat securely with other owners  
- Arrange playdates and meet-ups  
- Share feedback and reviews after interactions  

The backend handles all the **matching logic, data storage, and communication features** through Firebase Cloud Functions and Firestore.

---

## 🌐 API Deployment

**Production URL** https://api-2z4snw37ba-uc.a.run.app/api/
**Local Emulator URL** http://localhost:5001/<project-id>/us-central1/api/

## Requirements

- Node.js **v22** (matches `"engines": { "node": "22" }`)
- npm (bundled with Node)
- Firebase CLI  
  ```bash
  npm install -g firebase-tools
  firebase --version
  firebase login

## Project Setup
Clone and install:
- git clone https://github.com/MpmookR/SoPup_CloudFucntion.git
- cd SoPup_CloudFucntion/functions
- npm install

- Firebase project: sopup-d4db2

## Local Development (Emulator)
firebase emulators:start --only functions


## Deploy to Cloud 
- function: 
firebase deploy --only functions:api

- firebase rules: 
firebase deploy --only firestore:rules

## View Cloud Logs
Tail logs in terminal: firebase functions:log

