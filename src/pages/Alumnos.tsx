import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MATERIAS from "../data/materias.json";
import TEMAS_POR_DEFECTO from "../data/temas.json";

const ANIMALS = [
  { emoji: "🐶", name: "Perro" },
  { emoji: "🐱", name: "Gato" },
  { emoji: "🐸", name: "Rana" },
  { emoji: "🦊", name: "Zorro" },
  { emoji: "🐼", name: "Panda" },
  { emoji: "🐨", name: "Koala" },
  { emoji: "🦁", name: "León" },
  { emoji: "🐯", name: "Tigre" },
  { emoji: "🐰", name: "Conejo" },
  { emoji: "🦄", name: "Unicornio" },
  { emoji: "🐧", name: "Pingüino" },
  { emoji: "🦉", name: "Búho" },
  { emoji: "🐢", name: "Tortuga" },
  { emoji: "🐳", name: "Ballena" },
  { emoji: "🦋", name: "Mariposa" },
  { emoji: "🐝", name: "Abeja" },
];

interface Tema {
  materia: string;
  nombre: string;
  completado: boolean;
}

interface Alumno {
  id: string;
  nombre: string;
  edad: string;
  curso: string;
  colegio: string;
  nombreApoderado: string;
  telefonoApoderado: string;
  observaciones: string;
  clasesTotales: number;
  clasesCompletadas: number;
  materias: string[];
  temas: Tema[];
  dificultades: string[];
  tareasPendientes: { nombre: string }[];
  activo: boolean;
  animal: string;
  createdAt: Date;
}

interface HistorialEntry {
  id: string;
  fecha: Timestamp;
  tipo: string;
  detalle: string;
}

const defaultForm = {
  nombre: "",
  edad: "",
  curso: "",
  colegio: "",
  nombreApoderado: "",
  telefonoApoderado: "+56 ",
  observaciones: "",
  animal: "",
  clasesTotales: 0,
  clasesCompletadas: 0,
  materias: [] as string[],
  temas: [] as Tema[],
  dificultades: [] as string[],
  tareasPendientes: [] as { nombre: string }[],
};
type FormAlumno = typeof defaultForm;

function Alumnos() {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormAlumno>(defaultForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [animalPickerFor, setAnimalPickerFor] = useState<string | null>(null);

  const [detalleAlumno, setDetalleAlumno] = useState<Alumno | null>(null);
  const [detalleTab, setDetalleTab] = useState<
    "info" | "historial" | "progreso"
  >("info");
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  const [finalizarAlumno, setFinalizarAlumno] = useState<Alumno | null>(null);
  const [finalizarMateria, setFinalizarMateria] = useState("");
  const [finalizarTemas, setFinalizarTemas] = useState<string[]>([]);
  const [finalizarResumen, setFinalizarResumen] = useState("");
  const [finalizarDificultades, setFinalizarDificultades] = useState<string[]>(
    [],
  );
  const [finalizarNivel, setFinalizarNivel] = useState<
    "bajo" | "medio" | "alto"
  >("medio");
  const [finalizarTareas, setFinalizarTareas] = useState<
    { nombre: string; completado: boolean }[]
  >([]);
  const [finalizarNuevaTarea, setFinalizarNuevaTarea] = useState("");
  const [finalizarArchivos, setFinalizarArchivos] = useState<string[]>([]);
  const [finalizarSubiendo, setFinalizarSubiendo] = useState(false);

  const DIFICULTADES = [
    "concentración",
    "lectura",
    "escritura",
    "matemáticas",
    "memoria",
    "ansiedad",
    "motricidad",
  ];

  useEffect(() => {
    const handleClick = () => setAnimalPickerFor(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "alumnos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setAlumnos(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate(),
        })) as Alumno[],
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!detalleAlumno) return;
    setHistorialLoading(true);
    const q = query(
      collection(db, "alumnos", detalleAlumno.id, "historial"),
      orderBy("fecha", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistorial(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as HistorialEntry[],
      );
      setHistorialLoading(false);
    });
    return () => unsub();
  }, [detalleAlumno?.id]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  const randomAnimal = () =>
    ANIMALS[Math.floor(Math.random() * ANIMALS.length)].emoji;

  const openAdd = () => {
    setForm({ ...defaultForm, animal: randomAnimal() });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (a: Alumno) => {
    setForm({
      nombre: a.nombre,
      edad: a.edad,
      curso: a.curso,
      colegio: a.colegio,
      nombreApoderado: a.nombreApoderado,
      telefonoApoderado: a.telefonoApoderado.startsWith("+56")
        ? a.telefonoApoderado
        : "+56 " + a.telefonoApoderado,
      observaciones: a.observaciones,
      animal: a.animal,
      clasesTotales: a.clasesTotales,
      clasesCompletadas: a.clasesCompletadas,
      materias: a.materias || [],
      temas: a.temas || [],
      dificultades: a.dificultades || [],
      tareasPendientes: a.tareasPendientes || [],
    });
    setEditingId(a.id);
    setShowModal(true);
  };

  const agregarHistorial = async (
    alumnoId: string,
    tipo: string,
    detalle: string,
  ) => {
    await addDoc(collection(db, "alumnos", alumnoId, "historial"), {
      fecha: serverTimestamp(),
      tipo,
      detalle,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const oldRef = doc(db, "alumnos", editingId);
      await updateDoc(oldRef, form);
    } else {
      const ref = await addDoc(collection(db, "alumnos"), {
        ...form,
        activo: true,
        createdAt: new Date(),
      });
      await agregarHistorial(
        ref.id,
        "creación",
        "Alumno registrado en el sistema",
      );
    }
    setShowModal(false);
  };

  const toggleActivo = async (a: Alumno) => {
    await updateDoc(doc(db, "alumnos", a.id), { activo: !a.activo });
    await agregarHistorial(
      a.id,
      "estado",
      `Alumno ${!a.activo ? "activado" : "desactivado"}`,
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este alumno?")) {
      const snap = await getDocs(collection(db, "alumnos", id, "historial"));
      const batch = writeBatch(db);
      snap.docs.forEach((h) => batch.delete(h.ref));
      batch.delete(doc(db, "alumnos", id));
      await batch.commit();
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    const snapshot = await getDocs(collection(db, "alumnos"));
    const rows = snapshot.docs.map((d) => {
      const data = d.data();
      const materiasStr = (data.materias || []).join(";");
      return `${data.nombre},${data.edad},${data.curso},${data.colegio},${data.nombreApoderado},${data.telefonoApoderado},${data.observaciones},${data.clasesTotales || 0},${data.clasesCompletadas || 0},${data.activo},${data.animal || ""},${materiasStr}`;
    });
    const csv =
      "nombre,edad,curso,colegio,nombreApoderado,telefonoApoderado,observaciones,clasesTotales,clasesCompletadas,activo,animal,materias\n" +
      rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumnos.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = (ev.target?.result as string)
        .split("\n")
        .slice(1)
        .filter(Boolean);
      const batch = writeBatch(db);
      for (const line of lines) {
        const [
          nombre,
          edad,
          curso,
          colegio,
          nombreApoderado,
          telefonoApoderado,
          observaciones,
          clasesTotales,
          clasesCompletadas,
          activo,
          animal,
          materiasStr,
        ] = line.split(",");
        const ref = doc(collection(db, "alumnos"));
        batch.set(ref, {
          nombre: nombre.trim(),
          edad: edad?.trim() || "",
          curso: curso?.trim() || "",
          colegio: colegio?.trim() || "",
          nombreApoderado: nombreApoderado?.trim() || "",
          telefonoApoderado: telefonoApoderado?.trim() || "",
          observaciones: observaciones?.trim() || "",
          clasesTotales: parseInt(clasesTotales?.trim()) || 0,
          clasesCompletadas: parseInt(clasesCompletadas?.trim()) || 0,
          activo: activo?.trim() === "true",
          animal: animal?.trim() || randomAnimal(),
          materias: materiasStr
            ? materiasStr.trim().split(";").filter(Boolean)
            : [],
          createdAt: new Date(),
        });
      }
      await batch.commit();
      alert(`${lines.length} alumnos importados`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const calcProgreso = (a: Alumno) => {
    const fields = [
      a.nombre,
      a.edad,
      a.curso,
      a.colegio,
      a.nombreApoderado,
      a.telefonoApoderado,
    ];
    const filled = fields.filter((f) => f && f !== "+56 ").length;
    const datosPct = (filled / fields.length) * 0.35 * 100;
    const clasesPct =
      a.clasesTotales > 0
        ? (Math.min(a.clasesCompletadas, a.clasesTotales) / a.clasesTotales) *
          0.3 *
          100
        : 0;
    const materiasPct =
      a.materias && a.materias.length > 0
        ? Math.min(1, a.materias.length / 3) * 0.15 * 100
        : 0;
    const temasArr = a.temas || [];
    const temasCompletados = temasArr.filter((t: Tema) => t.completado).length;
    const temasPct =
      temasArr.length > 0
        ? (temasCompletados / temasArr.length) * 0.2 * 100
        : 0;
    return Math.round(datosPct + clasesPct + materiasPct + temasPct);
  };

  const filtered = alumnos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.curso.toLowerCase().includes(search.toLowerCase()) ||
      a.colegio.toLowerCase().includes(search.toLowerCase()) ||
      a.nombreApoderado.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="home-wrapper">
      <nav className="navbar is-white" role="navigation">
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item" href="#">
              <strong>Planificación Alumnos</strong>
            </a>
          </div>
          <div className="navbar-menu is-active">
            <div className="navbar-end">
              <div className="navbar-item">
                <button
                  className="button is-primary is-outlined"
                  onClick={() => navigate("/")}
                >
                  Inicio
                </button>
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
          <div className="level mb-4">
            <div className="level-left">
              <div>
                <h2 className="title is-4">Gestión de Alumnos</h2>
                <p className="subtitle is-6 has-text-grey">
                  {alumnos.length} alumnos registrados
                </p>
              </div>
            </div>
            <div className="level-right">
              <div className="buttons">
                <label className="button is-primary is-small is-outlined">
                  Importar CSV
                  <input
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={importCSV}
                  />
                </label>
                <button
                  className={`button is-primary is-small is-outlined ${exporting ? "is-loading" : ""}`}
                  onClick={exportCSV}
                >
                  Exportar CSV
                </button>
                <button
                  className="button is-small is-success"
                  onClick={openAdd}
                >
                  + Nuevo Alumno
                </button>
              </div>
            </div>
          </div>

          <div className="field mb-4">
            <div className="control has-icons-left">
              <input
                className="input"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="icon is-left is-small">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="has-text-centered py-6">
              <p className="has-text-grey">Cargando alumnos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="has-text-centered py-6">
              <p className="has-text-grey">
                {search ? "Sin resultados" : "No hay alumnos registrados"}
              </p>
            </div>
          ) : (
            <div className="columns is-multiline">
              {filtered.map((a) => (
                <div className="column is-4" key={a.id}>
                  <div className="card alumno-card">
                    <div className="card-content">
                      <div className="level is-mobile mb-2">
                        <div className="level-left">
                          <div className="tags">
                            <span
                              className={`tag ${a.activo ? "is-success" : "is-light"}`}
                              onClick={() => toggleActivo(a)}
                              style={{ cursor: "pointer" }}
                            >
                              {a.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>
                        <div className="level-right">
                          <span className="tag is-info is-light">
                            {a.curso}
                          </span>
                        </div>
                      </div>

                      <div className="has-text-centered mb-3">
                        <div
                          className="is-relative"
                          style={{ display: "inline-block" }}
                        >
                          <span
                            className="is-flex is-align-items-center is-justify-content-center animal-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnimalPickerFor(
                                animalPickerFor === a.id ? null : a.id,
                              );
                            }}
                            style={{
                              width: 64,
                              height: 64,
                              fontSize: 32,
                              borderRadius: 64,
                              margin: "0 auto 0.5rem",
                              cursor: "pointer",
                              background: "#f0f4ff",
                              border: "2px solid #e2e8f0",
                            }}
                          >
                            {a.animal || randomAnimal()}
                          </span>
                          {animalPickerFor === a.id && (
                            <div
                              className="box p-2"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 10,
                                width: 208,
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(4, 1fr)",
                                  gap: 4,
                                }}
                              >
                                {ANIMALS.map((animal) => (
                                  <span
                                    key={animal.emoji}
                                    className="is-flex is-align-items-center is-justify-content-center"
                                    style={{
                                      width: 44,
                                      height: 44,
                                      fontSize: 22,
                                      cursor: "pointer",
                                      borderRadius: 8,
                                      background:
                                        a.animal === animal.emoji
                                          ? "#667eea"
                                          : "transparent",
                                    }}
                                    onClick={async () => {
                                      await updateDoc(
                                        doc(db, "alumnos", a.id),
                                        { animal: animal.emoji },
                                      );
                                      setAnimalPickerFor(null);
                                    }}
                                    onMouseEnter={(e) => {
                                      if (a.animal !== animal.emoji)
                                        e.currentTarget.style.background =
                                          "#f0f4ff";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (a.animal !== animal.emoji)
                                        e.currentTarget.style.background =
                                          "transparent";
                                    }}
                                  >
                                    {animal.emoji}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="has-text-weight-semibold">{a.nombre}</p>
                      </div>

                      <div className="content is-size-7">
                        <p className="mb-1">
                          <span className="has-text-grey">Edad:</span>{" "}
                          {a.edad || "—"}
                        </p>
                        <p className="mb-1">
                          <span className="has-text-grey">Curso:</span>{" "}
                          {a.curso || "—"}
                        </p>
                        <p className="mb-1">
                          <span className="has-text-grey">Colegio:</span>{" "}
                          {a.colegio || "—"}
                        </p>
                        <p className="mb-1">
                          <span className="has-text-grey">Apoderado:</span>{" "}
                          {a.nombreApoderado || "—"}
                        </p>
                        <p className="mb-1">
                          <span className="has-text-grey">Teléfono:</span>{" "}
                          {a.telefonoApoderado || "—"}
                        </p>

                        {a.materias && a.materias.length > 0 && (
                          <div className="tags mb-2 mt-2">
                            {a.materias.map((m: string) => (
                              <span key={m} className="tag is-primary is-light">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}

                        <div
                          style={{
                            height: 4,
                            background: "#e2e8f0",
                            borderRadius: 4,
                          }}
                        >
                          <div
                            style={{
                              width: `${calcProgreso(a)}%`,
                              height: 4,
                              background:
                                "linear-gradient(90deg, #667eea, #764ba2)",
                              borderRadius: 4,
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                        <p
                          className="has-text-grey mt-1"
                          style={{ fontSize: 11 }}
                        >
                          Progreso: {calcProgreso(a)}%
                        </p>
                      </div>

                      <div className="buttons are-small is-centered mt-3">
                        <button
                          className="button is-info is-light"
                          onClick={() => {
                            setDetalleAlumno(a);
                            setDetalleTab("info");
                          }}
                        >
                          Ver más
                        </button>
                        <button
                          className="button is-success is-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFinalizarAlumno(a);
                            setFinalizarMateria(a.materias?.[0] || "");
                            setFinalizarTemas([]);
                            setFinalizarResumen("");
                            setFinalizarDificultades([]);
                            setFinalizarNivel("medio");
                            setFinalizarTareas((a.tareasPendientes || []).map((t) => ({ nombre: t.nombre, completado: false })));
                            setFinalizarNuevaTarea("");
                            setFinalizarArchivos([]);
                          }}
                        >
                          + Finalizar Clase
                        </button>
                        <button
                          className="button is-info is-light"
                          onClick={() => openEdit(a)}
                        >
                          Editar
                        </button>
                        <button
                          className="button is-danger is-light"
                          onClick={() => handleDelete(a.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {detalleAlumno && (
        <div className="modal is-active">
          <div
            className="modal-background"
            onClick={() => setDetalleAlumno(null)}
          ></div>
          <div className="modal-card" style={{ width: 640 }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{detalleAlumno.nombre}</p>
              <button
                className="delete"
                onClick={() => setDetalleAlumno(null)}
              ></button>
            </header>
            <section className="modal-card-body" style={{ minHeight: 300 }}>
              <div className="tabs is-boxed mb-4">
                <ul>
                  <li className={detalleTab === "info" ? "is-active" : ""}>
                    <a onClick={() => setDetalleTab("info")}>📋 Información</a>
                  </li>
                  <li className={detalleTab === "historial" ? "is-active" : ""}>
                    <a onClick={() => setDetalleTab("historial")}>
                      📜 Historial
                    </a>
                  </li>
                  <li className={detalleTab === "progreso" ? "is-active" : ""}>
                    <a onClick={() => setDetalleTab("progreso")}>📊 Progreso</a>
                  </li>
                </ul>
              </div>

              {detalleTab === "info" && (
                <div className="content">
                  <div className="columns is-variable is-6">
                    <div className="column">
                      <div className="field is-grouped is-grouped-multiline">
                        <p>
                          <strong>Nombre:</strong> {detalleAlumno.nombre}
                        </p>
                        <p>
                          <strong>Edad:</strong> {detalleAlumno.edad || "—"}
                        </p>
                        <p>
                          <strong>Curso:</strong> {detalleAlumno.curso || "—"}
                        </p>
                        <p>
                          <strong>Colegio:</strong>{" "}
                          {detalleAlumno.colegio || "—"}
                        </p>
                        {detalleAlumno.materias &&
                          detalleAlumno.materias.length > 0 && (
                            <div className="tags mt-2">
                              {detalleAlumno.materias.map((m: string) => (
                                <span
                                  key={m}
                                  className="tag is-primary is-light"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="column">
                      <p>
                        <strong>Apoderado:</strong>{" "}
                        {detalleAlumno.nombreApoderado || "—"}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {detalleAlumno.telefonoApoderado || "—"}
                      </p>
                      <p>
                        <strong>Clases:</strong>{" "}
                        {detalleAlumno.clasesCompletadas || 0}/
                        {detalleAlumno.clasesTotales || 0}
                      </p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        <span
                          className={`tag ${detalleAlumno.activo ? "is-success" : "is-light"}`}
                        >
                          {detalleAlumno.activo ? "Activo" : "Inactivo"}
                        </span>
                      </p>
                      {(detalleAlumno.dificultades?.length || 0) > 0 && (
                        <p>
                          <strong>Dificultades:</strong>{" "}
                          {detalleAlumno.dificultades.map((d: string) => (
                            <span
                              key={d}
                              className="tag is-danger is-light is-small mr-1"
                            >
                              {d}
                            </span>
                          ))}
                        </p>
                      )}
                      <p>
                        <strong>Registrado:</strong>{" "}
                        {detalleAlumno.createdAt?.toLocaleDateString() || "—"}
                      </p>
                    </div>
                  </div>

                  {detalleAlumno.observaciones && (
                    <div className="notification is-warning is-light mt-2">
                      <strong>📝 Observaciones:</strong>
                      <br />
                      {detalleAlumno.observaciones}
                    </div>
                  )}
                </div>
              )}

              {detalleTab === "historial" && (
                <div>
                  {historialLoading ? (
                    <p className="has-text-grey">Cargando historial...</p>
                  ) : historial.length === 0 ? (
                    <p className="has-text-grey">Sin eventos registrados</p>
                  ) : (
                    <div
                      className="timeline"
                      style={{ position: "relative", paddingLeft: 24 }}
                    >
                      {historial.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            borderLeft: "2px solid #667eea",
                            padding: "0 0 16px 16px",
                            marginLeft: 0,
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: -8,
                              top: 0,
                              width: 14,
                              height: 14,
                              background: "#667eea",
                              borderRadius: 14,
                            }}
                          />
                          <p
                            className="has-text-weight-semibold is-size-7"
                            style={{ textTransform: "capitalize" }}
                          >
                            {h.tipo}
                          </p>
                          <p className="is-size-7">{h.detalle}</p>
                          <p className="is-size-7 has-text-grey">
                            {h.fecha?.toDate().toLocaleString() || ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detalleTab === "progreso" && (
                <div>
                  <p className="has-text-weight-semibold mb-3">
                    Resumen de progreso
                  </p>

                  <div className="columns is-multiline">
                    {[
                      {
                        label: "Datos personales",
                        check: !!detalleAlumno.nombre && !!detalleAlumno.edad,
                        pct:
                          detalleAlumno.nombre && detalleAlumno.edad ? 100 : 50,
                      },
                      {
                        label: "Información académica",
                        check: !!detalleAlumno.curso && !!detalleAlumno.colegio,
                        pct:
                          detalleAlumno.curso && detalleAlumno.colegio
                            ? 100
                            : 50,
                      },
                      {
                        label: "Apoderado",
                        check:
                          !!detalleAlumno.nombreApoderado &&
                          !!detalleAlumno.telefonoApoderado &&
                          detalleAlumno.telefonoApoderado !== "+56 ",
                        pct:
                          detalleAlumno.nombreApoderado &&
                          detalleAlumno.telefonoApoderado &&
                          detalleAlumno.telefonoApoderado !== "+56 "
                            ? 100
                            : 50,
                      },
                      {
                        label: "Observaciones",
                        check: !!detalleAlumno.observaciones,
                        pct: detalleAlumno.observaciones ? 100 : 0,
                      },
                      { label: "Estado", check: true, pct: 100 },
                      {
                        label: "Materias",
                        check: (detalleAlumno.materias?.length || 0) > 0,
                        pct: Math.min(
                          100,
                          ((detalleAlumno.materias?.length || 0) / 3) * 100,
                        ),
                      },
                      {
                        label: "Temas",
                        check: (detalleAlumno.temas || []).some(
                          (t: Tema) => t.completado,
                        ),
                        pct: (() => {
                          const ts = detalleAlumno.temas || [];
                          return ts.length > 0
                            ? Math.round(
                                (ts.filter((t: Tema) => t.completado).length /
                                  ts.length) *
                                  100,
                              )
                            : 0;
                        })(),
                      },
                      {
                        label: "Clases",
                        check: (detalleAlumno.clasesCompletadas || 0) > 0,
                        pct:
                          detalleAlumno.clasesTotales > 0
                            ? Math.round(
                                (detalleAlumno.clasesCompletadas /
                                  detalleAlumno.clasesTotales) *
                                  100,
                              )
                            : 0,
                      },
                      {
                        label: "Total",
                        check: true,
                        pct: calcProgreso(detalleAlumno),
                      },
                    ].map((item) => (
                      <div className="column is-6" key={item.label}>
                        <div className="box p-3">
                          <div className="level is-mobile mb-1">
                            <div className="level-left">
                              <p className="is-size-7 has-text-weight-semibold">
                                {item.label}
                              </p>
                            </div>
                            <div className="level-right">
                              <span
                                className={`tag is-small ${item.check ? "is-success" : "is-warning"}`}
                              >
                                {item.check ? "✔" : "—"}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e2e8f0",
                              borderRadius: 6,
                            }}
                          >
                            <div
                              style={{
                                width: `${item.pct}%`,
                                height: 6,
                                background:
                                  item.pct === 100 ? "#48c774" : "#ffdd57",
                                borderRadius: 6,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />
                  <p className="has-text-weight-semibold mb-3">
                    Gestión de Clases
                  </p>
                  <div className="box">
                    <div className="columns is-vcentered">
                      <div className="column is-6">
                        <div className="level is-mobile mb-2">
                          <div className="level-left">
                            <span className="is-size-7">Clases totales:</span>
                          </div>
                          <div className="level-right">
                            <div className="buttons are-small has-addons">
                              <button
                                className="button is-small"
                                onClick={async () => {
                                  await updateDoc(
                                    doc(db, "alumnos", detalleAlumno.id),
                                    {
                                      clasesTotales: Math.max(
                                        0,
                                        (detalleAlumno.clasesTotales || 0) - 1,
                                      ),
                                    },
                                  );
                                }}
                              >
                                −
                              </button>
                              <button
                                className="button is-small is-static"
                                style={{ minWidth: 32 }}
                              >
                                {detalleAlumno.clasesTotales || 0}
                              </button>
                              <button
                                className="button is-small"
                                onClick={async () => {
                                  await updateDoc(
                                    doc(db, "alumnos", detalleAlumno.id),
                                    {
                                      clasesTotales:
                                        (detalleAlumno.clasesTotales || 0) + 1,
                                    },
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="column is-6">
                        <div className="level is-mobile mb-2">
                          <div className="level-left">
                            <span className="is-size-7">Completadas:</span>
                          </div>
                          <div className="level-right">
                            <div className="buttons are-small has-addons">
                              <button
                                className="button is-small"
                                onClick={async () => {
                                  await updateDoc(
                                    doc(db, "alumnos", detalleAlumno.id),
                                    {
                                      clasesCompletadas: Math.max(
                                        0,
                                        (detalleAlumno.clasesCompletadas || 0) -
                                          1,
                                      ),
                                    },
                                  );
                                }}
                              >
                                −
                              </button>
                              <button
                                className="button is-small is-static"
                                style={{ minWidth: 32 }}
                              >
                                {detalleAlumno.clasesCompletadas || 0}
                              </button>
                              <button
                                className="button is-small"
                                onClick={async () => {
                                  await updateDoc(
                                    doc(db, "alumnos", detalleAlumno.id),
                                    {
                                      clasesCompletadas: Math.min(
                                        detalleAlumno.clasesTotales || 0,
                                        (detalleAlumno.clasesCompletadas || 0) +
                                          1,
                                      ),
                                    },
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#e2e8f0",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: `${detalleAlumno.clasesTotales > 0 ? Math.round((detalleAlumno.clasesCompletadas / detalleAlumno.clasesTotales) * 100) : 0}%`,
                          height: 8,
                          background:
                            "linear-gradient(90deg, #48c774, #2ecc71)",
                          borderRadius: 8,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                    <p className="has-text-grey is-size-7 mt-1">
                      {detalleAlumno.clasesCompletadas || 0} de{" "}
                      {detalleAlumno.clasesTotales || 0} clases completadas (
                      {detalleAlumno.clasesTotales > 0
                        ? Math.round(
                            (detalleAlumno.clasesCompletadas /
                              detalleAlumno.clasesTotales) *
                              100,
                          )
                        : 0}
                      %)
                    </p>
                  </div>

                  <hr />
                  <p className="has-text-weight-semibold mb-3">
                    Materias y Temas
                  </p>
                  {detalleAlumno.materias?.length > 0 ? (
                    detalleAlumno.materias.map((materia) => {
                      const temasMateria = (detalleAlumno.temas || []).filter(
                        (t: Tema) => t.materia === materia,
                      );
                      const completados = temasMateria.filter(
                        (t: Tema) => t.completado,
                      ).length;
                      const pct =
                        temasMateria.length > 0
                          ? Math.round(
                              (completados / temasMateria.length) * 100,
                            )
                          : 0;
                      return (
                        <details
                          key={materia}
                          className="mb-3"
                          style={{ cursor: "pointer" }}
                        >
                          <summary
                            className="has-text-weight-semibold is-size-7 mb-1"
                            style={{ cursor: "pointer" }}
                          >
                            {materia}{" "}
                            <span className="tag is-small is-light">
                              {completados}/{temasMateria.length}
                            </span>
                          </summary>
                          <div
                            className="box p-2 ml-3"
                            style={{ cursor: "default" }}
                          >
                            {temasMateria.length > 0 && (
                              <div
                                style={{
                                  height: 4,
                                  background: "#e2e8f0",
                                  borderRadius: 4,
                                  marginBottom: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: 4,
                                    background:
                                      pct === 100 ? "#48c774" : "#ffdd57",
                                    borderRadius: 4,
                                  }}
                                />
                              </div>
                            )}
                            {temasMateria.map((tema: Tema) => (
                              <div
                                key={tema.nombre}
                                className="level is-mobile mb-1"
                              >
                                <div className="level-left">
                                  <label
                                    className="checkbox is-size-7"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={tema.completado}
                                      className="mr-2"
                                      onChange={async () => {
                                        const nuevosTemas = (
                                          detalleAlumno.temas || []
                                        ).map((t: Tema) =>
                                          t.materia === materia &&
                                          t.nombre === tema.nombre
                                            ? {
                                                ...t,
                                                completado: !t.completado,
                                              }
                                            : t,
                                        );
                                        await updateDoc(
                                          doc(db, "alumnos", detalleAlumno.id),
                                          { temas: nuevosTemas },
                                        );
                                      }}
                                    />
                                    {tema.nombre}
                                  </label>
                                </div>
                                <div className="level-right">
                                  <button
                                    className="delete is-small"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const nuevosTemas = (
                                        detalleAlumno.temas || []
                                      ).filter(
                                        (t: Tema) =>
                                          !(
                                            t.materia === materia &&
                                            t.nombre === tema.nombre
                                          ),
                                      );
                                      await updateDoc(
                                        doc(db, "alumnos", detalleAlumno.id),
                                        { temas: nuevosTemas },
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="field has-addons mt-2">
                              <div className="control is-expanded">
                                <input
                                  className="input is-small"
                                  placeholder="Nuevo tema..."
                                  id={`nuevoTema-${materia}`}
                                />
                              </div>
                              <div className="control">
                                <button
                                  className="button is-small is-success"
                                  type="button"
                                  onClick={async () => {
                                    const input = document.getElementById(
                                      `nuevoTema-${materia}`,
                                    ) as HTMLInputElement;
                                    const val = input.value.trim();
                                    if (
                                      val &&
                                      !(detalleAlumno.temas || []).some(
                                        (t: Tema) =>
                                          t.materia === materia &&
                                          t.nombre === val,
                                      )
                                    ) {
                                      const nuevosTemas = [
                                        ...(detalleAlumno.temas || []),
                                        {
                                          materia,
                                          nombre: val,
                                          completado: false,
                                        },
                                      ];
                                      await updateDoc(
                                        doc(db, "alumnos", detalleAlumno.id),
                                        { temas: nuevosTemas },
                                      );
                                      input.value = "";
                                    }
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </details>
                      );
                    })
                  ) : (
                    <p className="is-size-7 has-text-grey">
                      Sin materias asignadas.
                    </p>
                  )}
                </div>
              )}
            </section>
            <footer className="modal-card-foot">
              <button className="button" onClick={() => setDetalleAlumno(null)}>
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Finalizar Clase Modal */}
      {finalizarAlumno && (
        <div className="modal is-active">
          <div
            className="modal-background"
            onClick={() => setFinalizarAlumno(null)}
          />
          <div className="modal-card" style={{ width: 720 }}>
            <header className="modal-card-head">
              <p className="modal-card-title">
                Finalizar Clase — {finalizarAlumno.nombre}
              </p>
              <button
                className="delete"
                onClick={() => setFinalizarAlumno(null)}
              />
            </header>
            <section className="modal-card-body" style={{ padding: "1.5rem" }}>
              {/* Materia + Temas */}
              <div className="field">
                <label className="label is-small">Materia trabajada</label>
                <div className="tags">
                  {(finalizarAlumno.materias || []).map((m) => (
                    <span
                      key={m}
                      className={`tag is-medium ${finalizarMateria === m ? "is-success" : "is-light is-outlined"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setFinalizarMateria(finalizarMateria === m ? "" : m);
                        setFinalizarTemas([]);
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              {finalizarMateria && (
                <div className="field">
                  <label className="label is-small">Temas cubiertos</label>
                  <div className="tags">
                    {(finalizarAlumno.temas || [])
                      .filter((t: Tema) => t.materia === finalizarMateria)
                      .map((t: Tema) => (
                        <span
                          key={t.nombre}
                          className={`tag ${finalizarTemas.includes(t.nombre) ? "is-success" : "is-light is-outlined"}`}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setFinalizarTemas((prev) =>
                              prev.includes(t.nombre)
                                ? prev.filter((x) => x !== t.nombre)
                                : [...prev, t.nombre],
                            )
                          }
                        >
                          {t.nombre}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Resumen de la sesión */}
              <div className="field">
                <label className="label is-small">Resumen de la sesión</label>
                <textarea
                  className="textarea"
                  placeholder="¿Qué se trabajó? Anota lo más importante de la clase..."
                  rows={3}
                  value={finalizarResumen}
                  onChange={(e) => setFinalizarResumen(e.target.value)}
                />
              </div>

              {/* Nivel de avance */}
              <div className="field">
                <label className="label is-small">Nivel de avance</label>
                <div className="buttons has-addons is-small">
                  {(["bajo", "medio", "alto"] as const).map((nivel) => (
                    <button
                      key={nivel}
                      className={`button is-small ${finalizarNivel === nivel ? "is-success is-selected" : ""}`}
                      onClick={() => setFinalizarNivel(nivel)}
                    >
                      {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="my-3" />

              {/* Dificultades detectadas */}
              <div className="field">
                <label className="label is-small">
                  Dificultades detectadas
                </label>
                <div className="tags">
                  {DIFICULTADES.map((d) => (
                    <span
                      key={d}
                      className={`tag is-medium ${finalizarDificultades.includes(d) ? "is-danger" : "is-light is-outlined"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setFinalizarDificultades((prev) =>
                          prev.includes(d)
                            ? prev.filter((x) => x !== d)
                            : [...prev, d],
                        )
                      }
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="my-3" />

              {/* Tareas para casa */}
              <div className="field">
                <label className="label is-small">Tareas para casa</label>
                <div className="field has-addons mb-2">
                  <div className="control is-expanded">
                    <input
                      className="input"
                      placeholder="Agregar tarea..."
                      value={finalizarNuevaTarea}
                      onChange={(e) => setFinalizarNuevaTarea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && finalizarNuevaTarea.trim()) {
                          e.preventDefault();
                          setFinalizarTareas((prev) => [
                            ...prev,
                            {
                              nombre: finalizarNuevaTarea.trim(),
                              completado: false,
                            },
                          ]);
                          setFinalizarNuevaTarea("");
                        }
                      }}
                    />
                  </div>
                  <div className="control">
                    <button
                      className="button is-success"
                      onClick={() => {
                        if (finalizarNuevaTarea.trim()) {
                          setFinalizarTareas((prev) => [
                            ...prev,
                            {
                              nombre: finalizarNuevaTarea.trim(),
                              completado: false,
                            },
                          ]);
                          setFinalizarNuevaTarea("");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                {finalizarTareas.length > 0 && (
                  <div style={{ maxHeight: 150, overflowY: "auto" }}>
                    {finalizarTareas.map((t, i) => (
                      <div key={i} className="level is-mobile mb-1">
                        <div className="level-left">
                          <label
                            className="checkbox is-size-7"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={t.completado}
                              className="mr-2"
                              onChange={() =>
                                setFinalizarTareas((prev) =>
                                  prev.map((x, j) =>
                                    j === i
                                      ? { ...x, completado: !x.completado }
                                      : x,
                                  ),
                                )
                              }
                            />
                            {t.nombre}
                          </label>
                        </div>
                        <div className="level-right">
                          <button
                            className="delete is-small"
                            onClick={() =>
                              setFinalizarTareas((prev) =>
                                prev.filter((_, j) => j !== i),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="my-3" />

              {/* Archivos / evidencias */}
              <div className="field">
                <label className="label is-small">Archivos o evidencias</label>
                {finalizarArchivos.length > 0 && (
                  <div
                    className="mb-2"
                    style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                  >
                    {finalizarArchivos.map((url, i) => (
                      <div
                        key={i}
                        style={{ position: "relative", width: 72, height: 72 }}
                      >
                        <img
                          src={url}
                          alt=""
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <button
                          className="delete is-small"
                          style={{ position: "absolute", top: -4, right: -4 }}
                          onClick={() =>
                            setFinalizarArchivos((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="file is-small is-boxed is-success">
                  <label className="file-label">
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      disabled={finalizarSubiendo}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files) return;
                        setFinalizarSubiendo(true);
                        for (const file of Array.from(files)) {
                          const path = `evidencias/${finalizarAlumno.id}/${Date.now()}_${file.name}`;
                          const storageRef = ref(storage, path);
                          await uploadBytes(storageRef, file);
                          const url = await getDownloadURL(storageRef);
                          setFinalizarArchivos((prev) => [...prev, url]);
                        }
                        setFinalizarSubiendo(false);
                      }}
                    />
                    <span className="file-label">
                      {finalizarSubiendo ? "Subiendo..." : "Subir foto o PDF"}
                    </span>
                  </label>
                </div>
              </div>
            </section>
            <footer
              className="modal-card-foot"
              style={{ padding: "1rem 1.5rem" }}
            >
              <button
                className="button is-fullwidth is-success is-medium"
                onClick={async () => {
                  const id = finalizarAlumno.id;
                  const materia = finalizarMateria;
                  const temasStr = finalizarTemas.join(", ");
                  const dificultadesStr = finalizarDificultades.join(", ");
                  const tareasStr = finalizarTareas
                    .map((t) => `${t.nombre}${t.completado ? " ✔" : ""}`)
                    .join(", ");
                  const detalle = `Clase finalizada.\nMateria: ${materia || "—"}\nTemas: ${temasStr || "—"}\nNivel: ${finalizarNivel}\nResumen: ${finalizarResumen || "—"}\nDificultades: ${dificultadesStr || "—"}\nTareas: ${tareasStr || "—"}`;

                  await addDoc(collection(db, "alumnos", id, "historial"), {
                    fecha: serverTimestamp(),
                    tipo: "clase",
                    detalle,
                    nivel: finalizarNivel,
                    archivos: finalizarArchivos,
                    tareas: finalizarTareas,
                  });
                  const dificultadesActuales =
                    finalizarAlumno.dificultades || [];
                  const dificultadesUnidas = [
                    ...new Set([
                      ...dificultadesActuales,
                      ...finalizarDificultades,
                    ]),
                  ];
                  await updateDoc(doc(db, "alumnos", id), {
                    clasesCompletadas: Math.min(
                      finalizarAlumno.clasesTotales || 0,
                      (finalizarAlumno.clasesCompletadas || 0) + 1,
                    ),
                    dificultades: dificultadesUnidas,
                    tareasPendientes: finalizarTareas.filter((t) => !t.completado).map((t) => ({ nombre: t.nombre })),
                  });
                  if (materia && finalizarTemas.length > 0) {
                    const nuevosTemas = (finalizarAlumno.temas || []).map(
                      (t: Tema) =>
                        t.materia === materia &&
                        finalizarTemas.includes(t.nombre)
                          ? { ...t, completado: true }
                          : t,
                    );
                    await updateDoc(doc(db, "alumnos", id), {
                      temas: nuevosTemas,
                    });
                  }
                  setFinalizarAlumno(null);
                }}
              >
                Finalizar Clase
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal is-active">
          <div
            className="modal-background"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                {editingId ? "Editar Alumno" : "Nuevo Alumno"}
              </p>
              <button
                className="delete"
                onClick={() => setShowModal(false)}
              ></button>
            </header>
            <form onSubmit={handleSubmit}>
              <section className="modal-card-body">
                <div className="field">
                  <label className="label is-small">Nombre</label>
                  <div className="control">
                    <input
                      className="input"
                      placeholder="Nombre del alumno"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label is-small">Edad</label>
                      <div className="control">
                        <input
                          className="input"
                          type="number"
                          min={0}
                          max={99}
                          placeholder="Ej: 15"
                          value={form.edad}
                          onChange={(e) =>
                            setForm({ ...form, edad: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <label className="label is-small">Curso</label>
                      <div className="control">
                        <input
                          className="input"
                          placeholder="Ej: 4° Medio A"
                          value={form.curso}
                          onChange={(e) =>
                            setForm({ ...form, curso: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label is-small">Colegio</label>
                  <div className="control">
                    <input
                      className="input"
                      placeholder="Nombre del colegio"
                      value={form.colegio}
                      onChange={(e) =>
                        setForm({ ...form, colegio: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label is-small">Nombre Apoderado</label>
                      <div className="control">
                        <input
                          className="input"
                          placeholder="Nombre del apoderado"
                          value={form.nombreApoderado}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              nombreApoderado: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <label className="label is-small">
                        Teléfono Apoderado
                      </label>
                      <div className="control">
                        <input
                          className="input"
                          placeholder="+56 9 1234 5678"
                          value={form.telefonoApoderado}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val.startsWith("+56")) return;
                            const digits = val.replace(/\D/g, "").slice(2, 11);
                            setForm({
                              ...form,
                              telefonoApoderado: "+56 " + digits,
                            });
                          }}
                        />
                        <p className="help">
                          +56 seguido de 9 dígitos (
                          {form.telefonoApoderado.replace(/\D/g, "").length - 2}
                          /9)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label is-small">Materias</label>
                  <div className="tags mb-2">
                    {MATERIAS.map((m) => (
                      <span
                        key={m}
                        className={`tag ${form.materias.includes(m) ? "is-success" : "is-light is-outlined"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (form.materias.includes(m)) {
                            const next = form.materias.filter(
                              (x: string) => x !== m,
                            );
                            setForm({
                              ...form,
                              materias: next,
                              temas: form.temas.filter(
                                (t: Tema) => t.materia !== m,
                              ),
                            });
                          } else {
                            const defaultTemas =
                              (TEMAS_POR_DEFECTO as Record<string, string[]>)[
                                m
                              ] || [];
                            const newTemas: Tema[] = defaultTemas.map(
                              (nombre: string) => ({
                                materia: m,
                                nombre,
                                completado: false,
                              }),
                            );
                            setForm({
                              ...form,
                              materias: [...form.materias, m],
                              temas: [...form.temas, ...newTemas],
                            });
                          }
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input
                        className="input is-small"
                        placeholder="Agregar materia personalizada..."
                        id="nuevaMateria"
                      />
                    </div>
                    <div className="control">
                      <button
                        className="button is-small is-success"
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            "nuevaMateria",
                          ) as HTMLInputElement;
                          const val = input.value.trim();
                          if (val && !form.materias.includes(val)) {
                            const newTema: Tema = {
                              materia: val,
                              nombre: "General",
                              completado: false,
                            };
                            setForm({
                              ...form,
                              materias: [...form.materias, val],
                              temas: [...form.temas, newTema],
                            });
                            input.value = "";
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label is-small">Observaciones</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Notas u observaciones generales..."
                      value={form.observaciones}
                      onChange={(e) =>
                        setForm({ ...form, observaciones: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button
                  type="button"
                  className="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button is-success">
                  {editingId ? "Guardar Cambios" : "Crear Alumno"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alumnos;
