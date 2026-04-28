# 💪 TrainerSync — React Web App

Dark-mode fitness dashboard for trainers and clients.
Built with React + Firebase. Hosted on Firebase Hosting.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── auth/          Login.jsx, Register.jsx
│   ├── trainer/       TrainerDashboard.jsx (plan upload + charts)
│   ├── client/        ClientDashboard.jsx (tasks + remarks)
│   └── shared/        Navbar.jsx
├── firebase/
│   ├── config.js      Firebase init
│   └── service.js     All Firestore operations
├── hooks/
│   └── useAuth.js     Auth context
├── styles/
│   └── global.css     Dark mode design system
├── App.jsx            Routes
└── main.jsx           Entry point
```

---

## ⚙️ Local Setup

### Step 1 — Install Node.js (if not already)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should print v20.x.x
```

### Step 2 — Install dependencies
```bash
cd trainer-react
npm install
```

### Step 3 — Set up Firebase environment variables
```bash
cp .env.example .env.local
nano .env.local
```

Fill in your values from Firebase Console → Project Settings → General → Your apps → Web app:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=trainer-client-sync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=trainer-client-sync
VITE_FIREBASE_STORAGE_BUCKET=trainer-client-sync.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=417539265269
VITE_FIREBASE_APP_ID=1:417539265269:web:...
```

### Step 4 — Run locally
```bash
npm run dev
```
Opens at: http://localhost:5173

---

## 🚀 Deploy to Firebase Hosting (Free)

### Step 1 — Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2 — Initialize Firebase Hosting (one-time)
```bash
firebase init hosting
```
Answer the prompts:
- Which project? → Select your existing `trainer-client-sync` project
- Public directory? → `dist`
- Single-page app? → `Yes`
- Overwrite index.html? → `No`

### Step 3 — Build and deploy
```bash
npm run build
firebase deploy
```

You get a free URL like:
👉 https://trainer-client-sync.web.app

---

## 🔄 Update the live app

Every time you change code:
```bash
npm run build
firebase deploy
```
That's it — live in ~30 seconds.

---

## 👤 How to Use

### Trainer
1. Register → select Trainer role
2. Copy Trainer UID from the dashboard header
3. Share UID with clients
4. Upload today's plan → click Publish
5. Switch to Progress tab → see charts + client details

### Client
1. Register → select Client → paste Trainer UID
2. See today's plan immediately after trainer publishes
3. Tick off meals and exercises
4. Tap ▶️ to watch YouTube tutorial for each exercise
5. Write remarks → Submit Progress

---

## 📦 Key Dependencies

| Package        | Purpose                  |
|----------------|--------------------------|
| react          | UI framework             |
| react-router-dom | Client-side routing    |
| firebase       | Auth + Firestore         |
| recharts       | Progress charts          |
| date-fns       | Date formatting          |
| vite           | Build tool               |
