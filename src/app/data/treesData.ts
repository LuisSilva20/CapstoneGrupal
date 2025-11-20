// src/app/data/cursoData.ts
import { KnowledgeTree, Curso, Leccion } from "src/app/interfaces/interfaces";

// --- Datos de los árboles de conocimiento ---
export const treesData: KnowledgeTree[] = [
  { id: 1, title: "El Problema de los Siniestros de Tránsito", description: "Internalizar el riesgo y comprender el impacto de los siniestros", icon: "📊", phase: 1, progress: 0  },
  { id: 2, title: "Principios Fundamentales de la Conducción", description: "Dominar la teoría esencial de la conducción defensiva", icon: "🛣️", phase: 1, progress: 0 },
  { id: 3, title: "El Individuo en el Tránsito", description: "Factores humanos que afectan la conducción", icon: "🧘‍♂️", phase: 2, progress: 0 },
  { id: 4, title: "Normas de Circulación", description: "Dominio completo de la reglamentación vial", icon: "🚦", phase: 2, progress: 0 },
  { id: 5, title: "La Vía y su Entorno", description: "Aprender a leer e interpretar la carretera", icon: "🌆", phase: 2, progress: 0 },
  { id: 6, title: "Conducción en Condiciones Adversas", description: "Manejar de forma segura en escenarios complejos", icon: "🌧️", phase: 3, progress: 0 },
  { id: 7, title: "Aspectos Prácticos de la Conducción", description: "Familiarizarse con la operación práctica del vehículo", icon: "🚗", phase: 3, progress: 0 },
  { id: 8, title: "Conducción Eficiente y Sostenible", description: "Técnicas para optimizar consumo y reducir impacto ambiental", icon: "⛽", phase: 3, progress: 0 },
  { id: 9, title: "Nociones de Mecánica Básica", description: "Comprender el funcionamiento de sistemas esenciales del vehículo", icon: "🔧", phase: 3, progress: 0 }
];

// --- Lecciones ---
export const lessonsData: Leccion[] = [
  { id: 1, title: "Estadísticas de Siniestros en Chile", content: "leccion_1", duration: "10 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/distraido.jpeg' }] },
  { id: 2, title: "Consecuencias y Costos de los Siniestros", content: "leccion_2", duration: "15 min", completed: false, material: [{ tipo: 'texto', valor: 'Conocer los tipos de accidentes ayuda a prevenirlos.' }] },
  { id: 3, title: "El Enfoque del Sistema Seguro (Visión Cero)", content: "leccion_3", duration: "12 min", completed: false, material: [{ tipo: 'texto', valor: 'Visión Cero previene accidentes.' }] },
  { id: 4, title: "La Conducción Defensiva y Preventiva", content: "leccion_4", duration: "20 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/espejo.jpeg' }] },
  { id: 5, title: "Principios Físicos en la Conducción", content: "leccion_5", duration: "18 min", completed: false, material: [{ tipo: 'texto', valor: 'Respeta distancias y límites de velocidad.' }] },
  { id: 6, title: "La Convivencia Vial y Responsabilidades", content: "leccion_6", duration: "15 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/borroso.jpeg' }] },
  { id: 7, title: "Efectos del Alcohol y Drogas", content: "leccion_7", duration: "15 min", completed: false, material: [{ tipo: 'texto', valor: 'No conducir bajo efectos de alcohol o drogas.' }] },
  { id: 8, title: "Fatiga, Somnolencia y Enfermedades", content: "leccion_8", duration: "12 min", completed: false, material: [{ tipo: 'texto', valor: 'Descansa antes de conducir.' }] },
  { id: 9, title: "Emociones y Distracciones al Volante", content: "leccion_9", duration: "10 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/estiramiento.jpeg' }] },
  { id: 10, title: "Señales, Semáforos y Demarcaciones", content: "leccion_10", duration: "20 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/senalizacionn.png' }] },
  { id: 11, title: "Derecho Preferente de Paso", content: "leccion_11", duration: "18 min", completed: false, material: [{ tipo: 'texto', valor: 'Conoce quién tiene prioridad en cada situación.' }] },
  { id: 12, title: "Límites de Velocidad y Maniobras", content: "leccion_12", duration: "15 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/velocimetro.jpeg' }] },
  { id: 13, title: "Tipos de Vías y sus Características", content: "leccion_13", duration: "16 min", completed: false, material: [{ tipo: 'texto', valor: 'Diferentes tipos de vía requieren atención específica.' }] },
  { id: 14, title: "Elementos de la Vía (Calzada, Berma, etc.)", content: "leccion_14", duration: "14 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/desnivel.jpeg' }] },
  { id: 15, title: "Interpretación del Entorno (Zonas y Peligros)", content: "leccion_15", duration: "12 min", completed: false, material: [{ tipo: 'texto', valor: 'Aprende a interpretar correctamente el entorno vial.' }] },
  { id: 16, title: "Conducción con Lluvia y Aquaplaning", content: "leccion_16", duration: "18 min", completed: false, material: [{ tipo: 'texto', valor: 'Usa luces adecuadas y evita maniobras bruscas.' }] },
  { id: 17, title: "Conducción Nocturna y Encandilamiento", content: "leccion_17", duration: "15 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/curva.jpeg' }] },
  { id: 18, title: "Conducción con Niebla, Nieve y Hielo", content: "leccion_18", duration: "12 min", completed: false, material: [{ tipo: 'texto', valor: 'Adapta velocidad y precaución.' }] },
  { id: 19, title: "Postura y Uso Coordinado de Controles", content: "leccion_19", duration: "20 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/manos.jpeg' }] },
  { id: 20, title: "Técnicas de Frenado (Con y Sin ABS)", content: "leccion_20", duration: "16 min", completed: false, material: [{ tipo: 'texto', valor: 'Aprende a frenar correctamente.' }] },
  { id: 21, title: "Maniobras Clave: Estacionamiento y Virajes", content: "leccion_21", duration: "22 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/grafico.png' }] },
  { id: 22, title: "Técnicas de Conducción para Ahorrar Combustible", content: "leccion_22", duration: "18 min", completed: false, material: [{ tipo: 'texto', valor: 'Conduce eficiente y responsable.' }] },
  { id: 23, title: "Mantenimiento y Preparación del Vehículo", content: "leccion_23", duration: "14 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/seguro.jpeg' }] },
  { id: 24, title: "Conducción y Medio Ambiente", content: "leccion_24", duration: "12 min", completed: false, material: [{ tipo: 'texto', valor: 'Respeta el medio ambiente mientras conduces.' }] },
  { id: 25, title: "El Motor y sus Sistemas (Lubricación, Refrigeración)", content: "leccion_25", duration: "16 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/borroso.jpeg' }] },
  { id: 26, title: "Sistema de Frenos y Neumáticos", content: "leccion_26", duration: "14 min", completed: false, material: [{ tipo: 'texto', valor: 'Mantén frenos y neumáticos en buen estado.' }] },
  { id: 27, title: "Sistema Eléctrico: Luces, Batería y Testigos", content: "leccion_27", duration: "12 min", completed: false, material: [{ tipo: 'imagen', valor: 'assets/curva.jpeg' }] }
];

// --- Funciones auxiliares ---
export function getKnowledgeTree(id: number | string): KnowledgeTree | undefined {
  const treeId = typeof id === 'string' ? parseInt(id) : id;
  return treesData.find(t => t.id === treeId);
}

export function getCoursesByTree(treeId: number | string): Curso[] {
  const tree = getKnowledgeTree(treeId);
  if (!tree) return [];

  const treeNumId = typeof tree.id === 'string' ? parseInt(tree.id) : tree.id;
  const startIdx = (treeNumId - 1) * 3;
  const lessons: Leccion[] = lessonsData.slice(startIdx, startIdx + 3);

  return lessons.map(l => ({
    id: l.id.toString(),
    title: l.title,
    description: '',
    duration: l.duration,
    lessons: [l],
    arbolId: treeNumId.toString(),
    phase: tree.phase
  }));
}
