import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCKQ4mFv0JNXku_N1YFiQIaULfmEaMBJ58',
  authDomain: 'nextcampus-88a6e.firebaseapp.com',
  projectId: 'nextcampus-88a6e',
  storageBucket: 'nextcampus-88a6e.firebasestorage.app',
  messagingSenderId: '536179078735',
  appId: '1:536179078735:web:000967bcf3f84ec8525c3a',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
