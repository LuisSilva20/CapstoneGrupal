// src/app/pages/perfil/perfil.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel, IonProgressBar, IonButton, IonAvatar,
  IonMenuButton, IonButtons, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { Api } from 'src/app/servicios/api';

interface CursoGuardadoView {
  id: string;
  title: string;
  descripcion?: string;
  duracion?: string;
  arbol?: string;
  progreso: number;
  mostrarDetalle?: boolean;
}

interface RespuestaView {
  texto?: string;
  opciones?: string[];
  seleccion?: number | null;
  correcta?: number | null;
  treeId?: string;
  explicacion?: string;
}

interface IntentoView {
  id?: string;
  fecha?: string;
  respuestas: RespuestaView[];
  puntaje?: number;
  fechaFormateada?: string;
  mostrarDetalle?: boolean;
}

interface UserView {
  id?: string;
  username?: string;
  email?: string;
  nombre?: string;
  apellidos?: string;
  learningProgress?: { [treeId: string]: any };
  examHistory?: any[];
  progreso?: number;
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
  usuario: UserView | null = null;
  cursos: CursoGuardadoView[] = [];
  intentos: IntentoView[] = [];

  arboles: { nombre: string; totalAciertos: number; totalErrores: number; porcentajeAciertos: number }[] = [];
  fortalezas: any[] = [];
  debilidades: any[] = [];

  cargando = false;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private auth: Auth,
    private api: Api,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.cargando = true;
    const uid = this.auth.currentUser?.uid ?? null;
    if (!uid) {
      this.presentToast('No hay usuario autenticado. Inicia sesión.').then(() => {
        this.router.navigateByUrl('/inicio-sesion');
      });
      return;
    }

    this.api.getUserFullDataOnce(uid).then(user => {
      if (!user) {
        this.presentToast('Usuario no encontrado.');
        this.usuario = null;
        this.cursos = [];
        this.intentos = [];
        this.cargando = false;
        return;
      }

      this.usuario = {
        id: user.id,
        username: user.username ?? (user.email ? user.email.split('@')[0] : ''),
        email: user.email,
        nombre: (user as any).nombre ?? '',
        apellidos: user.apellidos ?? '',
        learningProgress: user.learningProgress ?? {},
        examHistory: user.examHistory ?? [],
        progreso: 0
      };

      // Usar combineLatest para obtener cursos y árboles en paralelo
      const cursos$ = this.api.getAllCursos();
      const arboles$ = this.api.getArboles();
      const intentos$ = this.api.getIntentosByUsuario(uid);

      cursos$.subscribe(allCursos => {
        arboles$.subscribe(allArboles => {
          // 3) Construcción de cursos guardados
          const lp = this.usuario!.learningProgress ?? {};
          const keys = Object.keys(lp);

          this.cursos = keys.map(treeId => {
            // Extraer el número de la clave (ej: 'tree-1' => '1')
            const treeIdNum = treeId.replace('tree-', '');
            const found = allCursos.find(c =>
              c.id?.toString() === treeIdNum ||
              c.arbolId?.toString() === treeIdNum
            );

            const arbolName =
              allArboles.find(a => a.id?.toString() === found?.arbolId?.toString() || a.id?.toString() === treeIdNum)?.title
              ?? 'Sin categoría';

            const lessonsCompleted = Array.isArray(lp[treeId]) ? lp[treeId].length : Number(lp[treeId]) || 0;

            const totalLessons = (found?.lessons?.length ?? lessonsCompleted) || 1;

            const progreso = Math.round((lessonsCompleted / totalLessons) * 100);

            return {
              id: found?.id ?? treeIdNum,
              title: found?.title ?? treeId,
              descripcion: found?.description ?? '',
              duracion: found?.duration ?? '',
              arbol: arbolName,
              progreso,
              mostrarDetalle: false
            };
          });

          // 4) Cargar intentos/exámenes
          intentos$.subscribe(intentosRaw => {
            this.intentos = (intentosRaw || []).map(it => {
              const respuestas = (it.respuestas ?? []).map((r: any) => ({
                texto: r.texto ?? '',
                opciones: Array.isArray(r.opciones) ? r.opciones : [],
                seleccion: r.seleccion ?? null,
                correcta: r.correcta ?? null,
                treeId: r.treeId ?? '',
                explicacion: r.explicacion ?? ''
              }));

              const fechaOriginal = it.fecha ?? new Date().toISOString();

              const correctas = respuestas.filter(x => x.seleccion === x.correcta).length;
              const puntaje = respuestas.length
                ? Math.round((correctas / respuestas.length) * 100)
                : 0;

              return {
                id: it.id,
                fecha: fechaOriginal,
                respuestas,
                puntaje,
                fechaFormateada: new Date(fechaOriginal).toLocaleString('es-ES'),
                mostrarDetalle: false
              };
            });

            // 5) Estadísticas
            this.calcularEstadisticasArboles();
            this.calcularProgresoGeneral();
            this.cargando = false;
          });
        });
      });
    }).catch(err => {
      console.error(err);
      this.presentToast('Error cargando perfil.');
      this.cargando = false;
    });
  }

  private async presentToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }

  calcularEstadisticasArboles() {
    const mapa: any = {};

    this.intentos.slice(0, 3).forEach(i => {
      i.respuestas.forEach(r => {
        const tree = (r.treeId ?? 'Sin categoría').toString();
        if (!mapa[tree]) mapa[tree] = { nombre: tree, totalAciertos: 0, totalErrores: 0 };

        if (r.seleccion === r.correcta) mapa[tree].totalAciertos++;
        else mapa[tree].totalErrores++;
      });
    });

    this.arboles = Object.values(mapa).map((a: any) => {
      const total = a.totalAciertos + a.totalErrores;
      return {
        ...a,
        porcentajeAciertos: total ? Math.round((a.totalAciertos / total) * 100) : 0
      };
    });

    this.fortalezas = this.arboles.filter(a => a.porcentajeAciertos >= 75);
    this.debilidades = this.arboles.filter(a => a.porcentajeAciertos < 75);
  }

  calcularProgresoGeneral() {
    if (!this.usuario) return;

    const total = this.cursos.length;
    this.usuario.progreso = total
      ? Math.round(this.cursos.reduce((acc, c) => acc + (c.progreso ?? 0), 0) / total)
      : 0;
  }

  toggleDetalleExamen(intento: IntentoView) {
    intento.mostrarDetalle = !intento.mostrarDetalle;
  }

  eliminarExamen(i: number) {
    this.intentos.splice(i, 1);
  }

  eliminarTodosExamenes() {
    this.intentos = [];
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  irArbol(nombreArbol?: string) {
    if (!nombreArbol) return;
    sessionStorage.setItem('selectedTree', nombreArbol);
    this.router.navigateByUrl('/tree-detail');
  }
}
