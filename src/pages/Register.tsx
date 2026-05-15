import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: email,
        nombre: nombre,
        rol: "profesor",
        emailVerified: false,
        createdAt: new Date(),
      });

      setSuccessMessage(
        "Cuenta creada. Por favor verifica tu correo electrónico.",
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes("email-already-in-use")) {
          setError("Este correo ya está registrado");
        } else if (errorMessage.includes("invalid-email")) {
          setError("Correo electrónico inválido");
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <section className="hero is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered is-vcentered">
              <div className="column is-4">
                <div className="card login-card">
                  <div className="card-content">
                    <div className="has-text-centered mb-5">
                      <figure className="image is-96x96 mx-auto mb-3">
                        <img
                          className="is-rounded"
                          src="https://img.icons8.com/?size=100&id=JRWbkQifzR6J&format=png&color=000000"
                          alt="Logo"
                        />
                      </figure>
                      <h2 className="title is-4 has-text-dark">Crear Cuenta</h2>
                      <p className="subtitle is-6 has-text-grey">
                        Regístrate para comenzar
                      </p>
                    </div>

                    {error && (
                      <div className="notification is-danger is-light">
                        <button
                          className="delete"
                          onClick={() => setError("")}
                        ></button>
                        {error}
                      </div>
                    )}

                    {successMessage && (
                      <div className="notification is-success is-light">
                        <button
                          className="delete"
                          onClick={() => setSuccessMessage("")}
                        ></button>
                        {successMessage}
                      </div>
                    )}

                    <form onSubmit={handleRegister}>
                      <div className="field">
                        <label className="label is-small">
                          Nombre completo
                        </label>
                        <div className="control has-icons-left">
                          <input
                            className="input"
                            type="text"
                            placeholder="Tu nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                          />
                          <span className="icon is-left">
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label is-small">
                          Correo electrónico
                        </label>
                        <div className="control has-icons-left">
                          <input
                            className="input"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <span className="icon is-left">
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label is-small">Contraseña</label>
                        <div className="control has-icons-left">
                          <input
                            className="input"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <span className="icon is-left">
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label is-small">
                          Confirmar contraseña
                        </label>
                        <div className="control has-icons-left">
                          <input
                            className="input"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <span className="icon is-left">
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="field mt-4">
                        <div className="control">
                          <button
                            type="submit"
                            className={`button is-primary is-medium is-fullwidth ${loading ? "is-loading" : ""}`}
                            disabled={loading}
                          >
                            Crear Cuenta
                          </button>
                        </div>
                      </div>
                    </form>

                    <p className="has-text-centered has-text-grey mt-4">
                      <span className="is-size-7">¿Ya tienes cuenta?</span>
                      <Link
                        to="/login"
                        className="text-link has-text-weight-semibold ml-1"
                      >
                        Inicia Sesión
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;
