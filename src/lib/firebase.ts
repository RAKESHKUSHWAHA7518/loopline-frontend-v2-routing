// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyD77o9iKbFadOlAXzjI2Yb3WpV8L46SprE",
//   authDomain: "wannes-whitelabelled.firebaseapp.com",
//   projectId: "wannes-whitelabelled",
//   storageBucket: "wannes-whitelabelled.firebasestorage.app",
//   messagingSenderId: "967761917332",
//   appId: "1:967761917332:web:9c3ce88c64d52413decb81",
//   measurementId: "G-VBDYZ40F52"
// };

// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSmFvAko6mjsjGaraEPvYScjec23G4dFw",
  authDomain: "loopline-2025.firebaseapp.com",
  projectId: "loopline-2025",
  storageBucket: "loopline-2025.firebasestorage.app",
  messagingSenderId: "229264078863",
  appId: "1:229264078863:web:8478b07c981f3b361b0b7a",
  measurementId: "G-K13T228L8C"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);