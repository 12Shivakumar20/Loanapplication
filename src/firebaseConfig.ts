import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDMAGTYqtz69ZgbNHj_LJZELQ1PVEXNZSo",
  authDomain: "loanapplication-b68b7.firebaseapp.com",
  projectId: "loanapplication-b68b7",
  storageBucket: "loanapplication-b68b7.appspot.com",
  messagingSenderId: "1083572487472",
  appId: "1:1083572487472:android:5fb4d766bf4c62ff8234f5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);