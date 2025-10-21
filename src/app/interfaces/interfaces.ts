// Usuario
export interface User {
  id?: number;
  username: string;
  email: string;                // nuevo campo
  password: string;
  confirmPassword?: string;
  nombre: string;
  apellidos: string;
  isactive: boolean;
  progreso?: number;
  cursosCompletados?: number[];
}

// Cursos guardados por usuario
export interface CursoGuardado {
  id: number;
  title: string;
  arbol?: string;               // <-- agregado para mostrar árbol del curso
  lessons: { titulo: string; completed: boolean; fecha?: string }[];
  mostrarDetalle?: boolean;
  fecha?: string;
}

// Respuestas dentro del perfil
export interface RespuestaPerfil {
  preguntaId: number;
  treeId: string;
  texto: string;
  opciones: string[];
  correcta: number;
  seleccion: number;
  explicacion?: string;
}

// Intentos de examen
export interface IntentoExamen {
  fecha: string; 
  fechaFormateada?: string; 
  puntaje: number;
  respuestas: RespuestaPerfil[];
  mostrarDetalle?: boolean;
}

// Estadísticas de árboles de conocimiento
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

// Preguntas de examen
export interface PreguntaExamen {
  id: number;
  treeId: string;
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
  treeId?: string;
}

// Cursos y lecciones
export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lessons?: Leccion[];
  arbol?: string;
}

export interface Leccion {
  id: number;
  cursoId: number;
  titulo: string;
  contenido: string;
  completed?: boolean;
  material?: MaterialItem[];
}

// Material de lecciones
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

// Preguntas generales
export interface PreguntaJSON {
  id: number;
  treeId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Pregunta {
  id: number;
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  treeId?: string;
}

// Skills y árboles de conocimiento
export interface Skill {
  name: string;
  level: number;
  color?: string;
}

export interface KnowledgeCourse {
  id: number;
  title: string;
  description: string;
  progress: number;
  icon?: string;
  curso?: Curso;
}

export interface KnowledgeTree {
  id: number;
  name: string;
  description: string;
  skills: Skill[];
  courses: KnowledgeCourse[];
  icon?: string;
}

// Componentes y fuentes
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
