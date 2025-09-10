// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfTfsrJbyG5-4jmJUPh3saHdzAYky7xdg",
  authDomain: "gamedevcapz.firebaseapp.com",
  databaseURL: "https://gamedevcapz-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gamedevcapz",
  storageBucket: "gamedevcapz.firebasestorage.app",
  messagingSenderId: "77421098859",
  appId: "1:77421098859:web:8df7c960ea08bd6a7bfe2e",
  measurementId: "G-6M6YEPK47E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, analytics };
