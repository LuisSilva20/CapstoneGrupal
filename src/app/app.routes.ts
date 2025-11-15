import { Routes } from '@angular/router';
import { IniciadoGuard } from './data/guards/iniciado.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Páginas públicas
  {
    path: 'inicio-sesion',
    loadComponent: () =>
      import('./pages/inicio-sesion/inicio-sesion.page').then(m => m.InicioSesionPage)
  },
  {
    path: 'registrarse',
    loadComponent: () =>
      import('./pages/registrarse/registrarse.page').then(m => m.RegistrarsePage)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then(m => m.HomePage)
  },

  // Páginas privadas (requieren guard)
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio.page').then(m => m.InicioPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'tree-detail',
    loadComponent: () =>
      import('./pages/tree-detail/tree-detail.page').then(m => m.TreeDetailPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'course-detail/:id',
    loadComponent: () =>
      import('./pages/course-detail/course-detail.page').then(m => m.CourseDetailPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'examen',
    loadComponent: () =>
      import('./pages/examen/examen.page').then(m => m.ExamenPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./pages/estadisticas/estadisticas.page').then(m => m.EstadisticasPage),
    canActivate: [IniciadoGuard]
  },
  {
    path: 'exam-tree/:id',
    loadComponent: () =>
      import('./pages/exam-tree/exam-tree.page').then(m => m.ExamTreePage),
    canActivate: [IniciadoGuard]
  },

  // Fallback
  { path: '**', redirectTo: 'home' }
];
