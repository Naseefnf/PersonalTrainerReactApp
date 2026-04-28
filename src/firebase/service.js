import {
  doc, getDoc, setDoc, deleteDoc, collection,
  query, where, getDocs, serverTimestamp, updateDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "./config";
import { format, subDays } from "date-fns";

const today = () => format(new Date(), "yyyy-MM-dd");

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser    = (e, p) => signInWithEmailAndPassword(auth, e, p);
export const registerUser = (e, p) => createUserWithEmailAndPassword(auth, e, p);
export const logoutUser   = ()     => signOut(auth);

// ─── USERS ────────────────────────────────────────────────────────────────────
export const createUserDoc = async (uid, email, displayName, role, trainerUid = null) => {
  await setDoc(doc(db, "users", uid), { uid, email, displayName, role, trainerUid });
};

export const getUserDoc = async (uid) => {
  const s = await getDoc(doc(db, "users", uid));
  return s.exists() ? s.data() : null;
};

export const getTrainerClients = async (trainerUid) => {
  const q = query(collection(db, "users"),
    where("trainerUid", "==", trainerUid), where("role", "==", "client"));
  const s = await getDocs(q);
  return s.docs.map(d => d.data());
};

// Delete a client — removes their user doc (unlinks them from trainer)
export const deleteClient = async (clientUid) => {
  await updateDoc(doc(db, "users", clientUid), { trainerUid: null });
};

// ─── DAILY PLANS ──────────────────────────────────────────────────────────────
export const upsertDailyPlan = async (trainerUid, dietPlan, exerciseRoutine) => {
  const docId = `${trainerUid}_${today()}`;
  await setDoc(doc(db, "daily_plans", docId), {
    trainerUid, date: today(), dietPlan, exerciseRoutine,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return docId;
};

export const getTodayPlan = async (trainerUid) => {
  const s = await getDoc(doc(db, "daily_plans", `${trainerUid}_${today()}`));
  return s.exists() ? s.data() : null;
};

export const getRecentPlans = async (trainerUid, days = 7) => {
  const q = query(collection(db, "daily_plans"), where("trainerUid", "==", trainerUid));
  const s = await getDocs(q);
  return s.docs.map(d => d.data())
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, days);
};

// ─── CLIENT STATUS ────────────────────────────────────────────────────────────
export const submitClientStatus = async (
  clientUid, trainerUid, planId, completedTasks, remarks
) => {
  const docId = `${clientUid}_${today()}`;
  await setDoc(doc(db, "client_status", docId), {
    clientUid, trainerUid, planId, date: today(),
    completedTasks, remarks, submittedAt: serverTimestamp(),
  }, { merge: true });
};

export const getClientStatus = async (clientUid) => {
  const s = await getDoc(doc(db, "client_status", `${clientUid}_${today()}`));
  return s.exists() ? s.data() : null;
};

export const getAllClientStatuses = async (trainerUid) => {
  const q = query(collection(db, "client_status"),
    where("trainerUid", "==", trainerUid), where("date", "==", today()));
  const s = await getDocs(q);
  return s.docs.map(d => d.data());
};

export const getClientStatusHistory = async (trainerUid) => {
  const q = query(collection(db, "client_status"), where("trainerUid", "==", trainerUid));
  const s = await getDocs(q);
  return s.docs.map(d => d.data());
};

// ─── STREAK ───────────────────────────────────────────────────────────────────
// Returns { streak, last7 } for a given client
export const getClientStreak = async (clientUid) => {
  const q = query(collection(db, "client_status"), where("clientUid", "==", clientUid));
  const s = await getDocs(q);
  const dates = new Set(s.docs.map(d => d.data().date));

  // Count consecutive days back from today
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = format(d, "yyyy-MM-dd");
    if (!dates.has(key)) break;
    streak++;
    d = subDays(d, 1);
  }

  // Last 7 days status
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const label = format(subDays(new Date(), 6 - i), "EEE");
    return { date, label, done: dates.has(date) };
  });

  return { streak, last7 };
};