import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyCROsbwnyiUjYSuAmdTq6NfuUX7NakhOko",
  authDomain: "equipment-rental-system-838f0.firebaseapp.com",
  projectId: "equipment-rental-system-838f0",
  storageBucket: "equipment-rental-system-838f0.appspot.com",
  messagingSenderId: "71958410034",
  appId: "1:71958410034:web:274a6798aa9d7ec5805d2b",
  measurementId: "G-9YRB6XS4M5"
};

// Firebase 초기화
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };