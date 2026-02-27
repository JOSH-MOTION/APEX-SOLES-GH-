import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
const googleProvider = new GoogleAuthProvider();

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// Safe getters — always call these instead of using db/auth directly
export function getClientAuth(): Auth {
  if (typeof window === "undefined") throw new Error("Auth only available on client");
  return getFirebaseAuth();
}

export function getClientDb(): Firestore {
  if (typeof window === "undefined") throw new Error("Firestore only available on client");
  return getFirebaseDb();
}

// Legacy exports for backward compatibility — may be undefined on SSR
if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  app = getFirebaseApp();
  db = getFirebaseDb();
  auth = getFirebaseAuth();
}

export { app, db, auth, googleProvider };