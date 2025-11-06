import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Api } from 'src/app/servicios/api';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
  IonLabel, IonProgressBar, IonButton, IonMenuButton, IonButtons, IonCardSubtitle
} from '@ionic/angular/standalone';
import { KnowledgeTree, PreguntaExamen, IntentoExamen } from 'src/app/interfaces/interfaces';

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
  preguntasInspeccionadas: { [key: string]: boolean } = {};
  allTrees: KnowledgeTree[] = [];
  cargando = true;

  constructor(private router: Router, private menuCtrl: MenuController, private api: Api) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  toggleFiltro() {
    this.filtroAReforzar = !this.filtroAReforzar;
  }

  toggleInspeccionPregunta(pregId: string | number) {
    this.preguntasInspeccionadas[pregId] = !this.preguntasInspeccionadas[pregId];
  }

async cargarEstadisticas() {
  try {
    this.cargando = true;

    // 1️⃣ Traer árboles de conocimiento
    this.allTrees = (await this.api.getArboles().toPromise()) ?? [];

    // 2️⃣ Traer todas las preguntas
    const preguntas: PreguntaExamen[] = (await this.api.getPreguntas().toPromise()) ?? [];

    // 3️⃣ Traer intentos del usuario
    const username = sessionStorage.getItem('username') || 'anon';
    const intentos: IntentoExamen[] = (await this.api.getIntentos(username).toPromise()) ?? [];

    // 4️⃣ Inicializar mapa de estadísticas por árbol
    const arbolMap: { [key: string]: ArbolEstadistica } = {};
    this.allTrees.forEach(tree => {
      arbolMap[tree.name] = {
        nombre: tree.name,
        totalPreguntas: 0,
        totalAciertos: 0,
        totalErrores: 0,
        porcentajeAciertos: 0,
        preguntasIncorrectas: []
      };
    });

    // 5️⃣ Procesar respuestas del usuario a partir de intentos
    intentos.forEach(intento => {
      (intento.respuestas ?? []).forEach(resp => {
        // resp: { preguntaId, seleccion }
        const pregunta = preguntas.find(p => p.id === resp.preguntaId);
        if (!pregunta) return;

        const treeName = this.allTrees.find(t => t.id === pregunta.treeId)?.name ?? 'Sin Categoría';
        const arbol = arbolMap[treeName];
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

    // 6️⃣ Calcular porcentaje de aciertos
    Object.values(arbolMap).forEach(a => {
      a.porcentajeAciertos = a.totalPreguntas > 0
        ? (a.totalAciertos / a.totalPreguntas) * 100
        : 100;
    });

    this.arboles = Object.values(arbolMap);
    this.cargando = false;
  } catch (err) {
    console.error('Error cargando estadísticas', err);
    this.cargando = false;
  }
}


  irArbol(nombreArbol: string) {
    sessionStorage.setItem('selectedTree', nombreArbol);
    this.router.navigateByUrl('/tree-detail');
  }

  get filasArboles() {
    const filas = [];
    for (let i = 0; i < this.arboles.length; i += 3) {
      filas.push(this.arboles.slice(i, i + 3));
    }
    return filas;
  }
}
