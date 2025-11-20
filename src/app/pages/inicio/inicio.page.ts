import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButtons, IonMenuButton, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Fuente, Componente } from 'src/app/interfaces/interfaces';



@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [  
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton
  ]
})
export class InicioPage implements OnInit {
  nombre: string | null = '';
  userCourseId: number = 1;

  componentes: Componente[] = [
    { name: 'Perfil', icon: 'home-outline' },
    { name: 'Cursos', icon: 'school-outline' },
    { name: 'Examen', icon: 'person-add-outline' },
    { name: 'Cerrar sesión', icon: 'log-out-outline' }
  ];

  fuentes: Fuente[] = [
    {
      titulo: 'Libro del Nuevo Conductor - CONASET',
      subtitulo: 'Fuente oficial del Ministerio de Transportes de Chile',
      descripcion: 'Toda la información técnica, normativas, definiciones y conceptos de seguridad vial se extraen directamente del manual oficial actualizado a Julio 2024.',
      link: 'https://www.conaset.cl/wp-content/uploads/2024/07/Libro-para-la-conduccion-en-Chile_Clase-B_actualizacion-julio-2024.pdf',
      botonTexto: 'Ver libro oficial'
    },
    {
      titulo: 'El Buen Conductor - Practica Test',
      subtitulo: 'Referencia y Temas Clave',
      descripcion: 'Fuente complementaria para validar temas importantes y asegurar que el contenido esté enfocado en lo que realmente se evalúa.',
      link: 'https://practicatest.cl/examen-teorico/clase-B/preguntas-y-respuestas',
      botonTexto: 'Ver preguntas oficiales'
    }
  ];

  constructor(private router: Router, private menu: MenuController) {}

  ngOnInit() {
    this.nombre = sessionStorage.getItem('username') || 'Usuario';
    const cursoAsignado = sessionStorage.getItem('userCourseId');
    this.userCourseId = cursoAsignado ? Number(cursoAsignado) : 1;
  }

  async manejarClick(item: Componente) {
    // Eliminar el foco del elemento activo
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();

    await this.menu.close();
    if (item.name === 'Cursos') this.router.navigateByUrl(`/tree-detail/${this.userCourseId}`);
    else if (item.name === 'Cerrar sesión') { sessionStorage.clear(); this.router.navigateByUrl('/inicio-sesion'); }
    else if (item.name === 'Perfil') this.router.navigateByUrl('/inicio');
    else if (item.name === 'Examen') this.router.navigateByUrl('/registrarse');
  }

  abrirFuente(link: string) {
    if (link && link !== '#') window.open(link, '_blank');
  }
}
