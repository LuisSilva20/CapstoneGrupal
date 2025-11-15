import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvr0lB_YFGfyMrKMf-GIrpsdaoCZIP7ns",
  authDomain: "plaformalicenciab.firebaseapp.com",
  projectId: "plaformalicenciab",
  storageBucket: "plaformalicenciab.firebasestorage.app",
  messagingSenderId: "263763295179",
  appId: "1:263763295179:web:793e6589bc619b9dd1d44e",
  measurementId: "G-H1SQKX61P8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
