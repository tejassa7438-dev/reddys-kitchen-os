import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-KcHxIkeI7sKvimKLtsFaB7oDfk4Vwpk",
  authDomain: "reddys-kitchen-os.firebaseapp.com",
  projectId: "reddys-kitchen-os",
  storageBucket: "reddys-kitchen-os.firebasestorage.app",
  messagingSenderId: "809709203681",
  appId: "1:809709203681:web:77343d6014053f013a87a0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);