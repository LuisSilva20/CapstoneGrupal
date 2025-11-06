// ==============================
// Usuario
// ==============================
export interface User {
  id?: string | number; // Firestore usa string, puede venir como number
  nombre: string;
  apellidos?: string;
  email: string;
  username?: string;        // Opcional si se usa Firebase Auth
  password?: string;        // Opcional, solo si manejas login manual
  confirmPassword?: string; // Opcional
  isactive?: boolean;       // Opcional
  examHistory?: ExamHistoryEntry[]; // Historial de exámenes
  learningProgress?: { [treeId: string]: number[] }; // Progreso por árbol
  progreso?: number;
  cursosCompletados?: (string | number)[];
}

// ==============================
// Historial de exámenes
// ==============================
export interface ExamHistoryEntry {
  date: string;           
  id: number;             
  percentage: number;    
  score: number;            // puntaje obtenido
  timeUp: boolean;          // si el tiempo se acabó
  totalQuestions: number;   // total de preguntas
  treeId: number;           // id del árbol
  treeName: string;         // nombre del árbol
  questions: ExamQuestion[]; // preguntas del intento
  userAnswers: (number | null)[]; // respuestas del usuario
}

// ==============================
// Preguntas dentro del historial
// ==============================
export interface ExamQuestion {
  id: number;
  question: string;
  correctAnswer: number;
  userAnswer: number | null;
}

// ==============================
// Cursos guardados por usuario
// ==============================
export interface CursoGuardado {
  id: string | number;
  title: string;
  arbol?: string | number;
  lessons: { titulo: string; completed: boolean; fecha?: string }[];
  mostrarDetalle?: boolean;
  fecha?: string;
}

// ==============================
// Respuestas dentro del perfil
// ==============================
export interface RespuestaPerfil {
  preguntaId: string | number;
  treeId: string | number;
  texto: string;
  opciones: string[];
  correcta: number;
  seleccion: number;
  explicacion?: string;
}

// ==============================
// Intentos de examen
// ==============================
export interface IntentoExamen {
  id?: string;          // id opcional de Firestore
  usuarioId: string;    // id del usuario que hizo el intento
  fecha: string;        // fecha en que se realizó el intento
  puntaje: number;      // puntaje obtenido
  respuestas: any[];    // array con las respuestas
}

// ==============================
// Estadísticas de árboles
// ==============================
export interface ArbolPerfil {
  nombre: string;
  totalAciertos: number;
  totalErrores: number;
  porcentajeAciertos: number;
}

export interface ArbolEstadistica {
  nombre: string;
  preguntasIncorrectas: PreguntaExamen[];
  totalPreguntas: number;
  totalAciertos: number;
  totalErrores: number;
  porcentajeAciertos: number;
}

// ==============================
// Preguntas de examen
// ==============================
export interface PreguntaExamen {
  id: string | number;
  treeId: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explicacion?: string;
  userSeleccion?: number;
}

export interface PreguntaExamenLocal {
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  treeId?: string | number;
}

// ==============================
// Cursos y lecciones
// ==============================
export interface Curso {
  id?: string | number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lessons?: Leccion[];
  arbol?: string | number;
}

export interface Leccion {
  id?: string | number;
  cursoId: string | number;
  titulo: string;
  contenido: string;
  completed?: boolean;
  material?: MaterialItem[];
}

// ==============================
// Material de lecciones
// ==============================
export interface MaterialItemTexto {
  tipo: 'texto';
  valor: string;
}

export interface MaterialItemImagen {
  tipo: 'imagen';
  valor: string;
}

export interface MaterialItemLista {
  tipo: 'lista';
  valor: string[];
}

export type MaterialItem =
  | MaterialItemTexto
  | MaterialItemImagen
  | MaterialItemLista;

// ==============================
// Preguntas generales
// ==============================
export interface PreguntaJSON {
  id: string | number;
  treeId: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Pregunta {
  id: string | number;
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  treeId?: string | number;
}

// ==============================
// Skills y árboles de conocimiento
// ==============================
export interface Skill {
  name: string;
  level: number;
  color?: string;
}

export interface KnowledgeCourse {
  id: string | number;
  title: string;
  description: string;
  progress: number;
  icon?: string;
  curso?: Curso;
}

export interface KnowledgeTree {
  id: string | number;
  name: string;
  description: string;
  skills: Skill[];
  courses: KnowledgeCourse[];
  icon?: string;
}

// ==============================
// Componentes y fuentes
// ==============================
export interface Componente {
  name: string;
  icon: string;
}

export interface Fuente {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  link: string;
  botonTexto: string;
}
