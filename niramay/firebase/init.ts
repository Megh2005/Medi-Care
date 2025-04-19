import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFjBCFEo7f9XSTzHy7Iw_9CGZMlVIFLno",
  authDomain: "medicare-tjp.firebaseapp.com",
  projectId: "medicare-tjp",
  storageBucket: "medicare-tjp.firebasestorage.app",
  messagingSenderId: "612695246134",
  appId: "1:612695246134:web:66b0466541b15160f89f97",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { db, auth, app };
