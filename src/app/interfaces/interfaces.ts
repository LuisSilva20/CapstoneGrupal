// =====================================
// Usuario
// =====================================
export interface User {
  id?: string;
  nombre: string;
  apellidos?: string;
  email: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  isactive?: boolean;

  examHistory?: ExamHistoryEntry[];
  learningProgress?: { [treeId: string]: number[] };
  progreso?: number;
  cursosCompletados?: string[];
  savedCourses?: CursoGuardado[];
}

// =====================================
// Historial de Exámenes
// =====================================
export interface ExamHistoryEntry {
  date: string;
  id: number;
  percentage: number;
  score: number;
  timeUp: boolean;
  totalQuestions: number;
  treeId: string;
  treeName: string;
  questions: ExamQuestion[];
  userAnswers: (number | null)[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  correctAnswer: number;
  userAnswer: number | null;
}

// =====================================
// Cursos guardados por usuario
// =====================================
export interface CursoGuardado {
  id: string;
  title: string;
  arbol?: string;
  lessons: {
    titulo: string;
    completed: boolean;
    fecha?: string;
  }[];
  mostrarDetalle?: boolean;
  fecha?: string;
}

// =====================================
// Preguntas dentro del perfil
// =====================================
export interface RespuestaPerfil {
  preguntaId: string;
  treeId: string;
  texto: string;
  opciones: string[];
  correcta: number;
  seleccion: number;
  explicacion?: string;
}

// =====================================
// Intento de examen
// =====================================
export interface IntentoExamen {
  id?: string;
  usuarioId: string;
  fecha: string;
  puntaje: number;
  respuestas: Array<{
    preguntaId: string | number;
    seleccion: number;
  }>;
}

export interface Material {
  tipo: 'texto' | 'imagen' | 'video';
  valor: string;
}

// =====================================
// Lecciones
// =====================================
export interface Leccion {
  id: string | number;
  title: string;
  content: string;
  duration: string;
  completed: boolean;
  material?: Material[];
}

// =====================================
// Cursos
// =====================================
export interface Curso {
  id?: string;
  title: string;
  description: string;
  duration: string;
  lessons: Leccion[];
  arbolId?: string;
  phase?: string | number; 
}




// =====================================
// Árbol de conocimiento
// =====================================
export interface KnowledgeTree {
  id: string | number;
  name?: string;
  title?: string;
  description: string;
  icon?: string;
  progress?: number;
  phase?: number;
}


// =====================================
// Preguntas de examen
// =====================================
export interface PreguntaExamen {
  id: string | number;
  treeId: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explicacion?: string;
  userSeleccion?: number;
}

export interface PreguntaJSON {
  id: string;
  treeId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// =====================================
// Componentes y fuentes
// =====================================
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

// =====================================
// Respuesta de autenticación
// =====================================
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}
