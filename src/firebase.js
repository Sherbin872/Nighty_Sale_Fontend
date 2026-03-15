// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyDHVVIVkKJYOznuGS2eA2TT2mgL44KC3ic",

  authDomain: "nighty-sale.firebaseapp.com",

  projectId: "nighty-sale",

  storageBucket: "nighty-sale.firebasestorage.app",

  messagingSenderId: "317573724587",

  appId: "1:317573724587:web:dd1f3d1feeeb33626cbaee"

};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);