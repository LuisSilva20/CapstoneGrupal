import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonIcon, IonMenuToggle,
  IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';

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
    IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonIcon, IonMenuToggle,
    IonLabel, IonRouterOutlet
  ]
})
export class AppComponent {
  nombre: string = 'Usuario';

  componentes: Componente[] = [
    { name: 'Perfil', redirecTo: '/perfil', icon: 'person-outline' },
    { name: 'Inicio', redirecTo: '/inicio', icon: 'home-outline' },
    { name: 'Cursos', redirecTo: '/trees', icon: 'school-outline' }, // navegamos directo
    { name: 'Examen', redirecTo: '/examen', icon: 'reader-outline' },
    { name: 'Estadisticas', redirecTo: '/estadisticas', icon: 'stats-chart-outline' },
    { name: 'Cerrar Sesión', action: () => this.cerrarSesion(), icon: 'log-out-outline' }
  ];

  constructor(private router: Router, private auth: Auth) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      this.nombre = user?.displayName || user?.email || 'Usuario';
    });
  }

  navegar(componente: Componente) {
    if (componente.redirecTo) {
      this.router.navigateByUrl(componente.redirecTo);
    } else if (componente.action) {
      componente.action();
    }
  }

  cerrarSesion() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/inicio-sesion']);
    });
  }
}
