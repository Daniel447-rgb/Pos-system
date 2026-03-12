import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCY4RzAsLkgQZ0byz4B1ZdkSfzFNAbgvHs",
  authDomain: "pos-system-370f5.firebaseapp.com",
  projectId: "pos-system-370f5",
  storageBucket: "pos-system-370f5.firebasestorage.app",
  messagingSenderId: "505486463723",
  appId: "1:505486463723:web:3e74382f76c536956464ae"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;