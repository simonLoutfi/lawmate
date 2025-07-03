// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbcQoXbOPoonZpleL8Bq3-sHYKd7iImgE",
  authDomain: "lawmate-4ed7c.firebaseapp.com",
  projectId: "lawmate-4ed7c",
  storageBucket: "lawmate-4ed7c.firebasestorage.app",
  messagingSenderId: "829991160016",
  appId: "1:829991160016:web:a05044a2d7379015fff6d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);