import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB9X6eOXBjJrpL3dLsoyt77__A2biFiIOk",
  authDomain: "ai-based-lawyer-62b7f.firebaseapp.com",
  projectId: "ai-based-lawyer-62b7f",
  storageBucket: "ai-based-lawyer-62b7f.appspot.com",
  messagingSenderId: "849689751774",
  appId: "1:849689751774:web:c1bea9044007a03e1ad24f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;