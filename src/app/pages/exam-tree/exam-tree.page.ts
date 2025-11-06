import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuController, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
  IonButton, IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner } from '@ionic/angular/standalone';
import { Api } from 'src/app/servicios/api';
import { PreguntaExamen } from 'src/app/interfaces/interfaces';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-exam-tree',
  standalone: true,
  templateUrl: './exam-tree.page.html',
  styleUrls: ['./exam-tree.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
    IonButton, IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner
  ]
})
export class ExamTreePage implements OnInit {

  preguntas: PreguntaExamen[] = [];
  respuestasUsuario: Record<string | number, number> = {};
  preguntaActual = 0;
  corregida = false;
  terminado = false;
  puntaje = 0;
  tiempoRestante = 600; // 10 minutos
  progresoTiempo = 1;

  // Propiedades para HTML
  treeName = '';
  mostrarReglas = true;
  cargando = false;
  mostrarFelicitacion = false;
  mensajeRetroalimentacion = '';

  treeId: string | null = null;

  constructor(private router: Router, private menuCtrl: MenuController, private api: Api) {}

  ngOnInit() {
    this.treeId = sessionStorage.getItem('treeId');
    this.treeName = sessionStorage.getItem('treeName') || 'Árbol';
    this.cargarPreguntas();
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  cargarPreguntas() {
    if (!this.treeId) return;
    this.cargando = true;

    this.api.getPreguntas(this.treeId).subscribe(preguntasDB => {
      this.cargando = false;
      // Mezclar y limitar a 20 preguntas
      this.preguntas = preguntasDB
        .sort(() => Math.random() - 0.5)
        .slice(0, 20)
        .map((p, index) => ({
          ...p,
          id: p.id || index + 1
        }));
    });
  }

  comenzarExamen() {
    this.mostrarReglas = false;
    this.corregida = false;
    this.iniciarTemporizador();
  }

  iniciarTemporizador() {
    const intervalo = setInterval(() => {
      if (this.terminado) { clearInterval(intervalo); return; }
      this.tiempoRestante--;
      this.progresoTiempo = this.tiempoRestante / 600;
      if (this.tiempoRestante <= 0) {
        clearInterval(intervalo);
        this.finalizarExamen();
      }
    }, 1000);
  }

  getTiempo(): string {
    const min = Math.floor(this.tiempoRestante / 60);
    const sec = this.tiempoRestante % 60;
    return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  responder(opcion: number) {
    const id = this.preguntas[this.preguntaActual].id;
    this.respuestasUsuario[id] = opcion;
    this.corregida = true;
  }

  siguiente() {
    if (!this.corregida) return;
    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
      const id = this.preguntas[this.preguntaActual].id;
      this.corregida = this.respuestasUsuario[id] !== undefined;
    } else {
      this.finalizarExamen();
    }
  }

  finalizarExamen() {
    const correctas = this.preguntas.filter(
      p => this.respuestasUsuario[p.id] === p.correctAnswer
    ).length;

    this.puntaje = (correctas / this.preguntas.length) * 100;
    this.mostrarFelicitacion = this.puntaje >= 75;
    this.terminado = true;
    this.mensajeRetroalimentacion = this.getMensajePorcentaje(this.puntaje);
  }

  reiniciar() {
    this.preguntaActual = 0;
    this.respuestasUsuario = {};
    this.corregida = false;
    this.terminado = false;
    this.puntaje = 0;
    this.mostrarReglas = true;
    this.mostrarFelicitacion = false;
    this.mensajeRetroalimentacion = '';
    this.tiempoRestante = 600;
    this.progresoTiempo = 1;
    this.cargarPreguntas();
  }

  volverArboles() {
    this.router.navigateByUrl('/knowledge-trees');
  }

  getMensajePorcentaje(puntaje: number): string {
    if (puntaje <= 25) return 'Sigue intentándolo.';
    if (puntaje <= 50) return 'Vas bien.';
    if (puntaje <= 74) return 'Vas mejorando.';
    return '¡Felicidades!';
  }
}
