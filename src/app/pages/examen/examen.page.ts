// src/app/pages/examen/examen.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
  IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner
} from '@ionic/angular/standalone';

import { PreguntaExamen } from 'src/app/interfaces/interfaces';
import { Api } from 'src/app/servicios/api';
import { firstValueFrom } from 'rxjs';

/**
 * Interfaz local que usa los nombres que espera tu UI/template.
 * No cambia nada en las interfaces globales.
 */
interface PreguntaLocal {
  id: string;
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion?: string;
  treeId?: string | number;
}

@Component({
  selector: 'app-examen',
  standalone: true,
  templateUrl: './examen.page.html',
  styleUrls: ['./examen.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonProgressBar,
    IonButton, IonRadioGroup, IonRadio, IonButtons, IonMenuButton, IonSpinner
  ]
})
export class ExamenPage implements OnInit {
  preguntas: PreguntaLocal[] = [];
  respuestasUsuario: Record<string | number, number> = {};
  preguntaActual = 0;
  corregida = false;
  terminado = false;
  puntaje = 0;
  mostrarFelicitacion = false;
  mostrarReglas = true;
  cargando = true;
  tiempoRestante = 900; // 15 minutos
  progresoTiempo = 1;
  mensajeRetroalimentacion = '';

  constructor(private router: Router, private menuCtrl: MenuController, private api: Api) {}

  ngOnInit() {
    this.cargarPreguntas();
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  async cargarPreguntas() {
    this.cargando = true;

    try {
      // Trae todas las preguntas desde Firestore (PreguntaExamen[])
      const preguntasDB: PreguntaExamen[] = (await firstValueFrom(this.api.getPreguntas())) ?? [];

      // Filtra árboles únicos
      const arboles = Array.from(new Set(preguntasDB.map(p => p.treeId))).filter(a => a);

      const preguntasPorArbol: PreguntaLocal[] = [];

      // 3 preguntas por árbol (aleatorias)
      arboles.forEach(arbol => {
        const preguntasDelArbol = preguntasDB.filter(p => p.treeId === arbol);
        preguntasDelArbol.sort(() => Math.random() - 0.5);
        preguntasDelArbol.slice(0, 3).forEach(p => {
          preguntasPorArbol.push({
            id: (preguntasPorArbol.length + 1).toString(),
            texto: p.question,
            opciones: p.options,
            correcta: Number(p.correctAnswer),
            explicacion: p.explicacion ?? '',
            treeId: p.treeId
          });
        });
      });

      // Completar hasta 35 preguntas
      const restantes = 35 - preguntasPorArbol.length;
      if (restantes > 0) {
        const usadas = preguntasPorArbol.map(p => p.texto);
        const disponibles = preguntasDB.filter(p => !usadas.includes(p.question));
        disponibles.sort(() => Math.random() - 0.5);
        disponibles.slice(0, restantes).forEach(p => {
          preguntasPorArbol.push({
            id: (preguntasPorArbol.length + 1).toString(),
            texto: p.question,
            opciones: p.options,
            correcta: Number(p.correctAnswer),
            explicacion: p.explicacion ?? '',
            treeId: p.treeId
          });
        });
      }

      // Mezcla final
      this.preguntas = preguntasPorArbol.sort(() => Math.random() - 0.5);

    } catch (error) {
      console.error('Error cargando preguntas:', error);
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
      if (this.tiempoRestante <= 0) {
        clearInterval(intervalo);
        this.finalizarExamen();
      }
    }, 1000);
  }

  getTiempo(): string {
    const min = Math.floor(this.tiempoRestante / 60);
    const sec = this.tiempoRestante % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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
      p => this.respuestasUsuario[p.id] === p.correcta
    ).length;

    this.puntaje = (correctas / this.preguntas.length) * 100;
    this.mostrarFelicitacion = this.puntaje >= 75;
    this.terminado = true;
    this.mensajeRetroalimentacion = this.getMensajePorcentaje(this.puntaje);

    // Guardar intento en Firestore
    const usuarioId = sessionStorage.getItem('userId') || 'anon';
    const respuestas = this.preguntas.map(p => ({
      id: p.id,
      treeId: p.treeId,
      texto: p.texto,
      opciones: [...p.opciones],
      correcta: p.correcta,
      seleccion: this.respuestasUsuario[p.id] ?? -1,
      explicacion: p.explicacion
    }));

    this.api.guardarIntento(usuarioId, respuestas, this.puntaje).subscribe({
      next: () => console.log('Intento guardado'),
      error: (err) => console.error('Error guardando intento:', err)
    });
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
    this.cargarPreguntas();
  }

  irPerfil() {
    this.router.navigateByUrl('/estadisticas');
  }

  getMensajePorcentaje(puntaje: number): string {
    if (puntaje <= 25) return 'Sigue intentándolo.';
    if (puntaje <= 50) return 'Vas bien.';
    if (puntaje <= 74) return 'Vas mejorando.';
    return '¡Felicidades!';
  }
}
