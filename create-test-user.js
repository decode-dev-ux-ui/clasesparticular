import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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

const email = "test@test.com";
const password = "test123456";

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("Usuario creado:", userCredential.user.email);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });