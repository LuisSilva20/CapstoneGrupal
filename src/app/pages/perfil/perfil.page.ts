import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel, IonProgressBar, IonButton, IonAvatar,
  IonMenuButton, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';

interface CursoFirebase {
  id: string | number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lessons?: { titulo: string; completed: boolean; fecha?: string }[];
  arbol?: string;
}

interface CursoGuardado {
  id: string | number;
  title: string;
  descripcion: string;
  duracion: string;
  lessons?: { titulo: string; completed: boolean; fecha?: string }[];
  arbol?: string;
  progreso: number;
  mostrarDetalle?: boolean;
}

interface IntentoExamen {
  id: string | number;
  fecha: string;
  respuestas: { texto: string; opciones: string[]; seleccion: number; correcta: number; explicacion?: string; treeId?: string }[];
  puntaje?: number;
  fechaFormateada?: string;
  mostrarDetalle?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  password: string;
  isactive: boolean;
  progreso?: number;
}

interface ArbolPerfil {
  nombre: string;
  totalAciertos: number;
  totalErrores: number;
  porcentajeAciertos: number;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonLabel, IonProgressBar, IonButton, IonAvatar,
    IonMenuButton, IonButtons, IonIcon
  ]
})
export class PerfilPage {
  usuario: User | null = null;
  cursos: CursoGuardado[] = [];
  intentos: IntentoExamen[] = [];
  arboles: ArbolPerfil[] = [];
  fortalezas: ArbolPerfil[] = [];
  debilidades: ArbolPerfil[] = [];

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private firestore: Firestore
  ) {}

  async ionViewWillEnter() {
    await this.cargarUsuario();
    await this.cargarCursos();
    await this.cargarIntentos();
    this.calcularEstadisticasArboles();
    this.calcularProgresoGeneral();
  }

  async cargarUsuario() {
    const username = sessionStorage.getItem('username');
    if (!username) return;

    this.usuario = {
      id: 1,
      username,
      email: sessionStorage.getItem('email') ?? '',
      nombre: sessionStorage.getItem('nombre') ?? '',
      apellidos: sessionStorage.getItem('apellidos') ?? '',
      password: '',
      isactive: true
    };
  }

  async cargarCursos() {
    const cursosCol = collection(this.firestore, 'cursos');
    const cursosFirebase: CursoFirebase[] = await firstValueFrom(
      collectionData(cursosCol, { idField: 'id' }) as Observable<CursoFirebase[]>
    );

    this.cursos = cursosFirebase.map(c => ({
      id: c.id,
      title: c.titulo ?? 'Sin título',
      descripcion: c.descripcion ?? '',
      duracion: c.duracion ?? '',
      lessons: c.lessons ?? [],
      arbol: c.arbol ?? 'Sin categoría',
      progreso: c.lessons?.length
        ? Math.round((c.lessons.filter(l => l.completed).length / c.lessons.length) * 100)
        : 0,
      mostrarDetalle: false
    }));
  }

  async cargarIntentos() {
    const intentosCol = collection(this.firestore, 'intentos');
    const intentosFirebase: IntentoExamen[] = await firstValueFrom(
      collectionData(intentosCol, { idField: 'id' }) as Observable<IntentoExamen[]>
    );

    this.intentos = intentosFirebase.map(i => {
      const respuestas = i.respuestas ?? [];
      const correctas = respuestas.reduce((acc, r) => r.seleccion === r.correcta ? acc + 1 : acc, 0);
      return {
        ...i,
        puntaje: respuestas.length ? (correctas / respuestas.length) * 100 : 0,
        fechaFormateada: i.fecha
          ? new Date(i.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
          : '',
        mostrarDetalle: false
      };
    }).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
  }

  calcularEstadisticasArboles() {
    const arbolMap: { [key: string]: ArbolPerfil } = {};

    this.intentos.slice(0, 3).forEach(i => {
      i.respuestas?.forEach(r => {
        const treeName = r.treeId?.trim() ?? 'Sin Categoría';
        if (!arbolMap[treeName]) arbolMap[treeName] = { nombre: treeName, totalAciertos: 0, totalErrores: 0, porcentajeAciertos: 0 };
        r.seleccion === r.correcta ? arbolMap[treeName].totalAciertos++ : arbolMap[treeName].totalErrores++;
      });
    });

    this.arboles = Object.values(arbolMap).map(a => {
      const total = a.totalAciertos + a.totalErrores;
      a.porcentajeAciertos = total > 0 ? (a.totalAciertos / total) * 100 : 100;
      return a;
    });

    this.fortalezas = this.arboles.filter(a => a.porcentajeAciertos >= 75);
    this.debilidades = this.arboles.filter(a => a.porcentajeAciertos < 75);
  }

  calcularProgresoGeneral() {
    if (!this.usuario) return;
    const totalCursos = this.cursos.length;
    this.usuario.progreso = totalCursos > 0
      ? Math.round(this.cursos.reduce((acc, c) => acc + (c.progreso ?? 0), 0) / totalCursos)
      : 0;
  }

  toggleDetalleCurso(curso: CursoGuardado) { curso.mostrarDetalle = !curso.mostrarDetalle; }
  toggleDetalleExamen(intento: IntentoExamen) { intento.mostrarDetalle = !intento.mostrarDetalle; }

  eliminarExamen(index: number) {
    this.intentos.splice(index, 1);
    this.calcularEstadisticasArboles();
  }

  eliminarTodosExamenes() {
    this.intentos = [];
    this.calcularEstadisticasArboles();
  }

  toggleMenu() { this.menuCtrl.toggle(); }

  irArbol(nombreArbol: string | undefined) {
    if (!nombreArbol) return; // evita pasar undefined
    sessionStorage.setItem('selectedTree', nombreArbol);
    this.router.navigateByUrl('/tree-detail');
  }
}
