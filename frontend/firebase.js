// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: "edspark-ai",
    storageBucket: "edspark-ai.firebasestorage.app",
    messagingSenderId: "497804975216",
    appId: "1:497804975216:web:1e6d46b72a0b8c7fa268b5",
    measurementId: "G-PP3Z6TM80V"
      
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const db = getFirestore(app);
