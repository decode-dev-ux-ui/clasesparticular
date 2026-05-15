import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyMdHl_y4FgfkZFnYlZuO8MktXMyg6_4o",
  authDomain: "planificacioneducativa-9077b.firebaseapp.com",
  projectId: "planificacioneducativa-9077b",
  storageBucket: "planificacioneducativa-9077b.firebasestorage.app",
  messagingSenderId: "662744023814",
  appId: "1:662744023814:web:604fb116aef34015d05487"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
