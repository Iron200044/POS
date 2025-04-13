// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore, collection, getDocs} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWc9vbFMLsPPkG3YPsz83qBfLC_XjUJV0",
  authDomain: "pos-app-f77a2.firebaseapp.com",
  projectId: "pos-app-f77a2",
  storageBucket: "pos-app-f77a2.firebasestorage.app",
  messagingSenderId: "919108539642",
  appId: "1:919108539642:web:663643b8ad15daa9a46543"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);