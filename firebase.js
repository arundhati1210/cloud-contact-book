// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBxTJi001TURwQ3BrhsU5Mcm0lVttqm10w",
  authDomain: "cloud-contact-book-bd7c9.firebaseapp.com",
  projectId: "cloud-contact-book-bd7c9",
  storageBucket: "cloud-contact-book-bd7c9.firebasestorage.app",
  messagingSenderId: "841349400470",
  appId: "1:841349400470:web:06cc5e0fe03aa45175ffb7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export them
export { auth, db };
