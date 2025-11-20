// src/app/pages/course-detail/course-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonSpinner, IonButton
} from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';
import { Curso, Leccion } from '../../interfaces/interfaces';
import { LearningService } from '../../servicios/learning.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButtons, IonBackButton, IonSpinner, IonButton
  ]
})
export class CourseDetailPage implements OnInit {

  treeId!: number;
  courseId!: string;

  curso: Curso | null = null;
  lessons: Leccion[] = [];
  cargando = true;
  errorMsg = '';
  cursoCompletado = false;

  constructor(
    private route: ActivatedRoute,
    private learningService: LearningService,
    private auth: Auth
  ) {}

  async ngOnInit() {
    this.treeId = Number(this.route.snapshot.paramMap.get('treeId') ?? 0);
    this.courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

    if (!this.treeId || !this.courseId) {
      this.errorMsg = 'Datos insuficientes para cargar el curso.';
      this.cargando = false;
      return;
    }

    try {
      // Traer curso
      const cursos = await this.learningService.getCoursesByTree(this.treeId);
      this.curso = cursos.find(c => c.id?.toString() === this.courseId) || null;

      // Traer lecciones
      this.lessons = await this.learningService.getLessons(this.courseId);

      // 🔹 Obtener progreso real del usuario desde Firestore
      const uid = this.auth.currentUser?.uid;
      let completedCourses: string[] = [];
      if (uid) {
        const user = await this.learningService.getUserByUid(uid);
        if (user?.learningProgress?.[this.treeId.toString()]) {
          completedCourses = Array.from(new Set(
            user.learningProgress[this.treeId.toString()]
              .map(id => id?.toString())
              .filter(id => !!id)
          ));
        }
      }

      // Determinar si el curso actual ya está completado
      this.cursoCompletado = completedCourses.includes(this.courseId);

      // 🔹 Sincronizar localStorage
      const completadosLS: Record<string, number> = {};
      completedCourses.forEach(cid => completadosLS[cid] = 1);
      if (this.cursoCompletado) {
        localStorage.setItem('completedCourses', JSON.stringify(completadosLS));
      }

    } catch (err) {
      console.error(err);
      this.errorMsg = 'Error cargando curso.';
    } finally {
      this.cargando = false;
    }
  }

  async markAsCompleted() {
    try {
      const uid = this.auth.currentUser?.uid;
      if (!uid) {
        alert('No hay usuario autenticado');
        return;
      }

      // Preparar lecciones/cursos para guardado
      const lessonsTransformed = this.lessons.map(lesson => ({
        id: lesson.id?.toString(),
        titulo: lesson.title || 'Lección sin título',
        completed: true,
        fecha: new Date().toISOString()
      }));

      await this.learningService.saveCourseProgress(
        uid,
        { id: this.courseId.toString(), title: this.curso?.title || '', lessons: lessonsTransformed },
        this.treeId
      );

      // 🔹 Actualizar localStorage para barra de progreso instantánea
      const completadosLS: Record<string, number> = JSON.parse(localStorage.getItem('completedCourses') || '{}');
      completadosLS[this.courseId] = 1;
      localStorage.setItem('completedCourses', JSON.stringify(completadosLS));

      this.cursoCompletado = true;
      alert('¡Curso marcado como completado!');
    } catch (err) {
      console.error('Error al marcar el curso como completado:', err);
      alert('Hubo un error al marcar el curso como completado.');
    }
  }
}
