import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  userData: {
    uid: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

function Home({ userData }: HomeProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="home-wrapper">
      <nav className="navbar is-white" role="navigation">
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item" href="#">
              <strong className="has-text-dark">Planificación Educativa</strong>
            </a>
          </div>
          <div className="navbar-menu is-active">
            <div className="navbar-end">
              <div className="navbar-item">
                <span className="mr-3 has-text-grey">{userData.nombre}</span>
                <button
                  className="button is-primary is-light"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-8">
              <div className="box">
                <h2 className="title is-4">Bienvenido a tu Panel</h2>
                <p className="subtitle is-6 has-text-grey">
                  Aquí podrás gestionar tu planificación educativa
                </p>

                <div className="columns is-multiline mt-4">
                  <div className="column is-4">
                    <div className="card feature-card">
                      <div className="card-content has-text-centered">
                        <span className="icon is-large has-text-info">
                          <svg
                            width="40"
                            height="40"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                          </svg>
                        </span>
                        <p className="mt-3 has-text-weight-semibold">
                          Materias
                        </p>
                        <p className="is-size-7 has-text-grey mt-1">
                          Gestiona tus materias
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="column is-4"
                    onClick={() => navigate("/alumnos")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card feature-card">
                      <div className="card-content has-text-centered">
                        <span className="icon is-large has-text-info">
                          <svg
                            width="40"
                            height="40"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.5 1.1 2.5 2.7 2.5 4.45V19h8v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        </span>
                        <p className="mt-3 has-text-weight-semibold">Alumnos</p>
                        <p className="is-size-7 has-text-grey mt-1">
                          Alta y gestión de alumnos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="column is-4">
                    <div className="card feature-card">
                      <div className="card-content has-text-centered">
                        <span className="icon is-large has-text-success">
                          <svg
                            width="40"
                            height="40"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                          </svg>
                        </span>
                        <p className="mt-3 has-text-weight-semibold">
                          Horarios
                        </p>
                        <p className="is-size-7 has-text-grey mt-1">
                          Organiza tu tiempo
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="column is-4">
                    <div className="card feature-card">
                      <div className="card-content has-text-centered">
                        <span className="icon is-large has-text-warning">
                          <svg
                            width="40"
                            height="40"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                          </svg>
                        </span>
                        <p className="mt-3 has-text-weight-semibold">
                          Planificación
                        </p>
                        <p className="is-size-7 has-text-grey mt-1">
                          Planifica tus metas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="box">
                <h3 className="title is-5">Información</h3>
                <div className="content">
                  <p className="is-size-7 has-text-grey">
                    Usa el panel de la izquierda para navegar entre las
                    diferentes opciones de tu planificación educativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
