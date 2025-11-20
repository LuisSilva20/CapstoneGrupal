import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
  IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner
} from '@ionic/angular/standalone';

import { LearningService } from 'src/app/servicios/learning.service';
import { PreguntaExamen } from 'src/app/interfaces/interfaces';
import { Auth } from '@angular/fire/auth';
import { getRedirectResult } from 'firebase/auth';

interface PreguntaLocal {
  id: string;
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion?: string;
  treeId?: number;
}

@Component({
  selector: 'app-examen',
  standalone: true,
  templateUrl: './examen.page.html',
  styleUrls: ['./examen.page.scss'],
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
    IonButton, IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner
  ]
})
export class ExamenPage implements OnInit {
  treeId?: number;
  preguntas: PreguntaLocal[] = [];
  respuestasUsuario: Record<string, number> = {};
  preguntaActual = 0;
  corregida = false;
  terminado = false;
  puntaje = 0;
  mostrarFelicitacion = false;
  mostrarReglas = true;
  cargando = true;
  tiempoRestante = 900;
  progresoTiempo = 1;
  mensajeRetroalimentacion = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuCtrl: MenuController,
    private learning: LearningService,
    private auth: Auth
  ) {}

  async ngOnInit() {
    const paramId = this.route.snapshot.paramMap.get('id');
    this.treeId = paramId ? Number(paramId) : undefined;

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      await this.cargarPreguntas(this.treeId);
    } else {
      try {
        const result = await getRedirectResult(this.auth);
        if (result && result.user) {
          await this.cargarPreguntas(this.treeId);
        } else {
          this.router.navigateByUrl('/login');
        }
      } catch (error) {
        console.error('Error login redirect:', error);
        this.router.navigateByUrl('/login');
      }
    }
  }

  toggleMenu() { this.menuCtrl.toggle(); }

  async cargarPreguntas(treeId?: number) {
    this.cargando = true;
    try {
      let preguntasDB: PreguntaExamen[] = [];
      if (treeId !== undefined) {
        preguntasDB = await this.learning.getQuestionsByTreeSafe(treeId);
      } else {
        preguntasDB = await this.learning.getRandomExamQuestions(35);
      }

      this.preguntas = preguntasDB.map(p => ({
        id: p.id.toString(),
        texto: p.question,
        opciones: p.options,
        correcta: Number(p.correctAnswer),
        explicacion: p.explicacion ?? '',
        treeId: Number(p.treeId ?? 0)
      }));

      if (this.preguntas.length === 0) console.warn('No se encontraron preguntas para este examen.');
    } catch (err) {
      console.error('Error cargando preguntas:', err);
      this.preguntas = [];
    } finally {
      this.cargando = false;
    }
  }

  comenzarExamen() {
    this.mostrarReglas = false;
    this.iniciarTemporizador();
    this.corregida = false;
  }

  iniciarTemporizador() {
    const intervalo = setInterval(() => {
      if (this.terminado) { clearInterval(intervalo); return; }
      this.tiempoRestante--;
      this.progresoTiempo = this.tiempoRestante / 900;
      if (this.tiempoRestante <= 0) { clearInterval(intervalo); this.finalizarExamen(); }
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
    } else this.finalizarExamen();
  }

  async finalizarExamen() {
    const respuestas = this.preguntas.map(p => ({
      idPregunta: p.id,
      seleccion: this.respuestasUsuario[p.id] ?? -1,
      correcta: p.correcta
    }));

    const correctas = respuestas.filter(r => r.seleccion === r.correcta).length;
    this.puntaje = (correctas / this.preguntas.length) * 100;
    this.mostrarFelicitacion = this.puntaje >= 75;
    this.terminado = true;
    this.mensajeRetroalimentacion = this.getMensajePorcentaje(this.puntaje);

    // 🔹 Guardar intento en Firestore
    const uid = this.auth.currentUser?.uid;
    if (uid && this.treeId !== undefined) {
      await this.learning.saveExamAttemptInHistory(uid, this.treeId, respuestas);
    }
  }

  reiniciar() {
    this.preguntaActual = 0;
    this.respuestasUsuario = {};
    this.corregida = false;
    this.terminado = false;
    this.puntaje = 0;
    this.mostrarFelicitacion = false;
    this.mostrarReglas = true;
    this.tiempoRestante = 900;
    this.progresoTiempo = 1;
    this.mensajeRetroalimentacion = '';
    this.cargarPreguntas(this.treeId);
  }

  irPerfil() { this.router.navigateByUrl('/estadisticas'); }

  getMensajePorcentaje(puntaje: number): string {
    if (puntaje <= 25) return 'Sigue intentándolo.';
    if (puntaje <= 50) return 'Vas bien.';
    if (puntaje <= 74) return 'Vas mejorando.';
    return '¡Felicidades!';
  }
}
