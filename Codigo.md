Este archivo es la referencia base del proyecto. Todos los módulos deben seguir estas convenciones sin excepción. Antes de programar cualquier funcionalidad, leer este documento completo.

Nombrado de archivos

- Componentes React → PascalCase.jsx (ej: StudentForm.jsx)
- Hooks → camelCase.js con prefijo use (ej: useStudents.js)
- Servicios → camelCase con sufijo Service (ej: studentService.js)
- Contextos → PascalCase con sufijo Context (ej: AuthContext.jsx)
  Componentes
- Siempre componentes funcionales con arrow functions
- Props desestructuradas en la firma del componente
- Un componente por archivo
- No mezclar lógica de negocio con JSX — extraer a hooks o servicios
  Servicios (Firebase)
- Toda lectura/escritura a Firestore va en services/
- Nunca llamar a Firebase directamente desde un componente o página
- Cada función de servicio recibe userId como primer parámetro
  Hooks personalizados
- Encapsulan lógica de Firestore + estado local
- Retornan { data, loading, error } como mínimo
- Usan onSnapshot para datos reactivos en tiempo real
  Manejo de errores
- Todo async/await envuelto en try/catch
- Errores mostrados al usuario con un componente <ErrorMessage />
- No usar console.log en producción — usar console.error solo en catch
  Estados de carga
- Toda operación async debe tener estado loading
- Mostrar componente <Spinner /> mientras carga
- Deshabilitar botones de submit mientras loading === true
  Comentarios en código
  Regla general: todos los comentarios van en español.
  Qué comentar obligatoriamente

1. Cabecera de cada archivo — propósito del archivo en 1-2 líneas
   Cada función o hook — qué hace, qué recibe, qué retorna
   Lógica de negocio no obvia — por qué se hace algo, no solo qué
   Condicionales de negocio importantes

Inmutabilidad

- Nunca mutar el estado directamente — siempre usar el setter de useState
- Para arrays, usar spread: [...prev, nuevoItem]
- Para objetos, usar spread: { ...prev, campo: nuevoValor }
  Separación de responsabilidades
- Páginas (pages/) → composición y layout, sin lógica Firebase
- Hooks (hooks/) → lógica de estado y datos
- Servicios (services/) → llamadas a Firebase, sin estado React
- Componentes (components/) → UI pura, recibe todo por props
  Evitar prop drilling
- Si un dato se necesita en más de 2 niveles de profundidad → moverlo a Context
- Datos globales del sistema: usuario autenticado (AuthContext), alumno seleccionado (StudentContext)
  Consistencia en async
- Preferir async/await sobre .then()/.catch()
- Siempre manejar el estado loading antes y después de cada operación
  Variables y funciones
- Nombres descriptivos en español para dominio del negocio, inglés para patrones técnicos
  No modificar lo que no se pidió
- Al implementar una tarea, solo tocar los archivos estrictamente necesarios para esa tarea
- No refactorizar, renombrar, reformatear ni reorganizar código existente que no esté relacionado con lo que se está construyendo
- Si se detecta un problema en código no relacionado, reportarlo en un comentario pero no corregirlo en el mismo paso

- No cambiar nombres de variables, funciones o archivos ya existentes salvo que sea parte explícita de la tarea
- No agregar dependencias nuevas sin que se haya pedido explícitamente
  Cleanup en useEffect
- Todo onSnapshot de Firestore debe limpiarse al desmontar el componente
  Todo componente reutilizable debe:

* ser lo más desacoplado posible
* no depender de Firebase
* no depender de rutas
* recibir datos vía props

Toda validación de formularios debe realizarse:

1. en frontend
2. antes de llamar al service
3. mostrando mensajes amigables
   Todos los formularios:

- deben poder usarse rápido
- minimizar clicks
- optimizados para tablet
- soportar escritura extensa
  Construir primero pensando en:
- 1 docente
- 10 alumnos

NO optimizar prematuramente para cientos de usuarios.
