import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyMdHl_y4FgfkZFnYlZuO8MktXMyg6_4o",
  authDomain: "planificacioneducativa-9077b.firebaseapp.com",
  projectId: "planificacioneducativa-9077b",
  storageBucket: "planificacioneducativa-9077b.firebasestorage.app",
  messagingSenderId: "662744023814",
  appId: "1:662744023814:web:604fb116aef34015d05487",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = "test@test.com";
const password = "test123456";

async function addUserData() {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "usuarios", uid), {
      email: email,
      nombre: "Usuario de Prueba",
      rol: "profesor",
      createdAt: new Date(),
      uid: uid,
    });

    console.log("Usuario agregado a Firestore con UID:", uid);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

addUserData();
