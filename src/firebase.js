// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMYUJoTQaRz8ng75y623MY4HPRVSasGvo",
  authDomain: "manavaatti-b39dc.firebaseapp.com",
  projectId: "manavaatti-b39dc",
  storageBucket: "manavaatti-b39dc.firebasestorage.app",
  messagingSenderId: "845710123696",
  appId: "1:845710123696:web:33e3bad8228066090e9175"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);