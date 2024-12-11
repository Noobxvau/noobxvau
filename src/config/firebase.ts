import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqNHniA20S8AET5L3J8CBon8J36MbNVOg",
  authDomain: "social-41c5c.firebaseapp.com",
  projectId: "social-41c5c",
  storageBucket: "social-41c5c.firebasestorage.app",
  messagingSenderId: "211923163028",
  appId: "1:211923163028:web:5dd929721e20ce2149a181",
  measurementId: "G-YVBJ7XLE17"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);