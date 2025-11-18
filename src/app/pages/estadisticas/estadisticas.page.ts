import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Api } from 'src/app/servicios/api';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
  IonLabel, IonProgressBar, IonButton, IonMenuButton, IonButtons,
  IonCardSubtitle
} from '@ionic/angular/standalone';

import {
  KnowledgeTree,
  PreguntaExamen,
  IntentoExamen
} from 'src/app/interfaces/interfaces';

// =======================================
// Estructura procesada final por cada árbol
// =======================================
interface ArbolEstadistica {
  nombre: string;
  totalPreguntas: number;
  totalAciertos: number;
  totalErrores: number;
  porcentajeAciertos: number;
  preguntasIncorrectas: Array<{
    id: string | number;
    treeId: string | number;
    question: string;
    options: string[];
    correctAnswer: number;
    explicacion?: string;
    userSeleccion: number;
  }>;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  imports: [
    CommonModule, IonicModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonProgressBar, IonButton,
    IonMenuButton, IonButtons, IonCardSubtitle
  ]
})
export class EstadisticasPage implements OnInit {

  arboles: ArbolEstadistica[] = [];
  filtroAReforzar = false;
  cargando = true;

  // El índice siempre será string => evita error TS
  preguntasInspeccionadas: Record<string, boolean> = {};

  allTrees: KnowledgeTree[] = [];

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private api: Api
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  toggleFiltro() {
    this.filtroAReforzar = !this.filtroAReforzar;
  }

  // ============================================
  // Mostrar/Ocultar explicación ― sin undefined
  // ============================================
  toggleInspeccionPregunta(pregId: string | number | undefined) {
    if (pregId == null) return;

    const key = String(pregId);
    this.preguntasInspeccionadas[key] = !this.preguntasInspeccionadas[key];
  }

  // ============================================
  // Carga + Procesamiento COMPLETO
  // ============================================
  async cargarEstadisticas() {
    try {
      this.cargando = true;

      // 1️⃣ Árboles
      this.allTrees = (await this.api.getArboles().toPromise()) ?? [];

      // 2️⃣ Preguntas
      const preguntas: PreguntaExamen[] =
        (await this.api.getPreguntas().toPromise()) ?? [];

      // 3️⃣ Intentos del usuario
      const username = sessionStorage.getItem('username') || 'anon';
      const intentos: IntentoExamen[] =
        (await this.api.getIntentos(username).toPromise()) ?? [];

      // 4️⃣ Armar un registro por cada árbol
      const arbolMap: Record<string, ArbolEstadistica> = {};

      this.allTrees.forEach(tree => {
        const nombre = tree.title || tree.name || `Árbol ${tree.id}`;

        arbolMap[nombre] = {
          nombre,
          totalPreguntas: 0,
          totalAciertos: 0,
          totalErrores: 0,
          porcentajeAciertos: 0,
          preguntasIncorrectas: []
        };
      });

      // 5️⃣ Procesar respuestas de cada intento
      intentos.forEach(intento => {
        (intento.respuestas ?? []).forEach(resp => {
          const pregunta = preguntas.find(p => p.id == resp.preguntaId);
          if (!pregunta) return;

          const tree = this.allTrees.find(t => t.id == pregunta.treeId);
          const nombreArbol = tree?.title || tree?.name || 'Sin Categoría';

          const arbol = arbolMap[nombreArbol];
          if (!arbol) return;

          arbol.totalPreguntas++;

          if (pregunta.correctAnswer === resp.seleccion) {
            arbol.totalAciertos++;
          } else {
            arbol.totalErrores++;

            arbol.preguntasIncorrectas.push({
              id: pregunta.id,
              treeId: pregunta.treeId,
              question: pregunta.question,
              options: pregunta.options,
              correctAnswer: pregunta.correctAnswer,
              explicacion: pregunta.explicacion,
              userSeleccion: resp.seleccion
            });
          }
        });
      });

      // 6️⃣ Calcular porcentajes
      Object.values(arbolMap).forEach(a => {
        a.porcentajeAciertos =
          a.totalPreguntas > 0
            ? (a.totalAciertos / a.totalPreguntas) * 100
            : 100;
      });

      // 7️⃣ Guardar lista final
      this.arboles = Object.values(arbolMap);
      this.cargando = false;

    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      this.cargando = false;
    }
  }

  // ============================================
  // Navegar al detalle del árbol
  // ============================================
  irArbol(nombreArbol: string) {
    sessionStorage.setItem('selectedTree', nombreArbol);
    this.router.navigateByUrl('/tree-detail');
  }

  // ============================================
  // Cuadrícula 3 columnas
  // ============================================
  get filasArboles() {
    const filas: ArbolEstadistica[][] = [];
    for (let i = 0; i < this.arboles.length; i += 3) {
      filas.push(this.arboles.slice(i, i + 3));
    }
    return filas;
  }
}
