import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonMenuToggle,
  IonLabel,
  IonRouterOutlet
} from '@ionic/angular/standalone';

interface Componente {
  name: string;
  icon: string;
  redirecTo?: string;
  action?: () => void;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonMenuToggle,
    IonLabel,
    IonRouterOutlet
  ]
})
export class AppComponent {
  nombre: string | null = '';
  userCursoId: number = 1;

  componentes: Componente[] = [
    { name: 'Perfil', redirecTo: '/perfil', icon: 'person-outline' },
    { name: 'Inicio', redirecTo: '/inicio', icon: 'home-outline' },
    { name: 'Cursos', icon: 'school-outline' },
    { name: 'Examen', redirecTo: '/examen', icon: 'reader-outline' },
    { name: 'Estadisticas', redirecTo: '/estadisticas', icon: 'stats-chart-outline' },
    { name: 'Cerrar Sesión', icon: 'log-out-outline', action: () => this.cerrarSesion() },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.nombre = sessionStorage.getItem('username') || 'Usuario';
    const cursoAsignado = sessionStorage.getItem('userCursoId');
    this.userCursoId = cursoAsignado ? Number(cursoAsignado) : 1;

    const cursoMenu = this.componentes.find(c => c.name === 'Cursos');
    if (cursoMenu) cursoMenu.action = () => this.router.navigateByUrl('/tree-detail');
  }

  navegar(componente: Componente) {
    if (componente.redirecTo) this.router.navigateByUrl(componente.redirecTo);
    else if (componente.action) componente.action();
  }

  cerrarSesion() {
    sessionStorage.clear();
    this.router.navigateByUrl('/home');
  }
}
