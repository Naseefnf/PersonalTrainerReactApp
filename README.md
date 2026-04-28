# 💪 TrainerSync — React Web App

Dark-mode fitness dashboard for trainers and clients.
Built with React + Firebase. Hosted on Firebase Hosting.

---

## 🗂️ Project Structure

src/
├── components/
│   ├── auth/          Login.jsx, Register.jsx
│   ├── trainer/       TrainerDashboard.jsx (plan upload + charts++delete client)
│   ├── client/        ClientDashboard.jsx (tasks + streak + remarks)
│   └── shared/        Navbar.jsx (top bar + mobile bottom nav)
├── firebase/
│   ├── config.js      Firebase init (reads from .env.local)
│   └── service.js     All Firestore operations
├── hooks/
│   └── useAuth.jsx    Auth context  ← .jsx not .js
├── styles/
│   └── global.css     Dark fitness design system
├── App.jsx            Routes + role-based guards
└── main.jsx           Entry point

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
cd trainerReactApp
npm install
```

### Step 3 — Set up Firebase environment variables
```bash
nano .env.local
```

Fill in your values from Firebase Console → Project Settings → General → Your apps → Web app:


VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=trainer-client-sync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=trainer-client-sync
VITE_FIREBASE_STORAGE_BUCKET=trainer-client-sync.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=417539265269
VITE_FIREBASE_APP_ID=1:417539265269:web:...


⚠️ Never commit `.env.local` — it's in `.gitignore` for security.

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
- Agent skills? → `n`
- Which project? → Select your existing `trainer-client-sync` project
- Public directory? → `dist`
- Single-page app? → `y`
- Set up GitHub auto-deploys? → `n`
- Overwrite dist/index.html? → `n`

### Step 3 — Build and deploy
```bash
npm run build
firebase deploy
```

Live at:
👉 https://trainer-client-sync.web.app

---

## 🔄 Update the live app

Every time you change code:
```bash
npm run build
firebase deploy
```
Live in ~30 seconds. Clients see the update automatically.

---

## 📱 Add to Home Screen (feels like a native app)

**Android:** Chrome → ⋮ menu → Add to Home screen → Add

**iPhone:** Safari → Share button → Add to Home Screen → Add

---

## 👤 How to Use

### Trainer
1. Register → select **Trainer** role
2. Copy **Trainer UID** shown on the dashboard
3. Share UID with your clients
4. Go to **Today's Plan** tab → add meals + exercises → Publish
5. Go to **Progress** tab → see charts, client submissions, remarks
6. Remove a client using the 🗑️ button on their card

### Client
1. Register → select **Client** → paste Trainer UID
2. See today's plan after trainer publishes
3. Tick off completed meals and exercises
4. Tap ▶️ to watch YouTube tutorial for each exercise
5. Write remarks → Submit Progress
6. Track your 🔥 streak and 7-day history

---

## ✨ Features

| Feature | Trainer | Client |
|---|---|---|
| Publish daily diet plan | ✅ | — |
| Publish exercise routine | ✅ | — |
| YouTube links per exercise | ✅ | ✅ view |
| View client progress | ✅ | — |
| Charts (bar, pie, line) | ✅ | — |
| Delete / remove client | ✅ | — |
| Tick off tasks | — | ✅ |
| Submit remarks | — | ✅ |
| 🔥 Streak tracker | — | ✅ |
| 7-day history dots | — | ✅ |
| Mobile bottom nav | ✅ | ✅ |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| react | UI framework |
| react-router-dom | Client-side routing |
| firebase | Auth + Firestore |
| recharts | Progress charts |
| date-fns | Date formatting |
| vite | Build tool |

---

## 🔐 Security

- Firebase keys stored in `.env.local` — never pushed to GitHub
- Firestore security rules restrict each user to their own data
- Role-based routing — clients can never access trainer views 