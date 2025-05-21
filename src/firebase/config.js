import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration - try with this exact key from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyDfLGkJyubOLcOIVMPry7NfkwKmQGP4Zs4",
  authDomain: "teamlexia-46228.firebaseapp.com",
  projectId: "teamlexia-46228",
  storageBucket: "teamlexia-46228.appspot.com", // Note: this might be different from what you have
  messagingSenderId: "746497205021",
  appId: "1:746497205021:web:b5bcd2a71f9ca0d022b7f4",
  measurementId: "G-XYC2PLJV9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
