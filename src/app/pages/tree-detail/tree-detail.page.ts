import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonMenuButton, IonButtons, IonImg, IonProgressBar, IonButton, IonCardSubtitle, IonText, IonSpinner } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Api } from 'src/app/servicios/api';
import { KnowledgeTree, KnowledgeCourse, Curso, Leccion } from '../../interfaces/interfaces';
import { map } from 'rxjs';

@Component({
  selector: 'app-tree-detail',
  standalone: true,
  templateUrl: './tree-detail.page.html',
  styleUrls: ['./tree-detail.page.scss'],
  imports: [IonSpinner, 
    CommonModule, IonText, IonCardSubtitle,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonButtons, IonMenuButton,
    IonImg, IonProgressBar, IonButton
  ]
})
export class TreeDetailPage {
  treeId: string | null = null;
  treeName: string = '';
  cursos: KnowledgeCourse[] = [];
  cargando = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuCtrl: MenuController,
    private api: Api
  ) {}

  ngOnInit() {
    this.treeId = this.route.snapshot.paramMap.get('id');
    if (!this.treeId) return;

    // Traer cursos desde Firestore filtrando por árbol
    this.api.getAllCursos().pipe(
      map(cursos => cursos.filter(c => c.arbol?.toString() === this.treeId))
    ).subscribe(cursosDelArbol => {
      // Mapear a KnowledgeCourse asegurando que id nunca sea undefined
      this.cursos = cursosDelArbol.map(curso => ({
        id: curso.id ?? 'temp-' + Math.random().toString(36).substr(2, 9),
        title: curso.titulo,
        description: curso.descripcion,
        progress: 0,
        curso: curso,
        skills: []
      }));

      // Asignar nombre del árbol usando el primer curso como referencia (o cualquier otra lógica)
      if (cursosDelArbol.length > 0) this.treeName = `Árbol ${this.treeId}`;

      // Actualizar progreso de cada curso según lecciones completadas
      this.updateCoursesProgress();
      this.cargando = false;
    });
  }

  // 🔹 Marca una lección/cursos como completada
  markCourseAsLearned(course: KnowledgeCourse) {
    const username = sessionStorage.getItem('username') || 'anon';
    const key = `curso_${username}_${course.curso?.id}`;
    const lessons: Leccion[] = course.curso?.lessons || [];
    const savedLessons = lessons.map(l => ({ ...l, completed: true }));
    localStorage.setItem(key, JSON.stringify(savedLessons));
    this.updateCoursesProgress();
  }

  // 🔹 Calcula el progreso de cada curso
  updateCoursesProgress() {
    const username = sessionStorage.getItem('username') || 'anon';
    this.cursos.forEach(course => {
      if (!course.curso?.lessons) {
        course.progress = 0;
        return;
      }
      const lessons = course.curso.lessons;
      const key = `curso_${username}_${course.curso.id}`;
      const savedLessons: Leccion[] = JSON.parse(localStorage.getItem(key) || '[]');
      const completed = lessons.filter(l => savedLessons.find(s => s.id === l.id && s.completed)).length;
      course.progress = lessons.length ? (completed / lessons.length) * 100 : 0;
    });
  }

  // 🔹 Navegar a los detalles de un curso
  goToCourse(course: KnowledgeCourse) {
    if (course.curso?.id) {
      this.router.navigate(['/course-detail', course.curso.id]);
    }
  }

  // 🔹 Navegar al examen del árbol
  goToExam() {
    if (this.treeId) this.router.navigate(['/exam-tree', this.treeId]);
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  skillColor(level: number): string {
    if (level >= 75) return 'success';
    if (level >= 50) return 'warning';
    return 'danger';
  }
}
