// src/app/pages/tree-detail/tree-detail.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonButtons, IonProgressBar, IonButton, IonSpinner, IonBackButton
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { KnowledgeTree, Curso } from '../../interfaces/interfaces';
import { LearningService } from '../../servicios/learning.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-tree-detail',
  standalone: true,
  templateUrl: './tree-detail.page.html',
  styleUrls: ['./tree-detail.page.scss'],
  imports: [
    CommonModule, RouterModule, IonBackButton,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonButtons,
    IonProgressBar, IonButton, IonSpinner
  ]
})
export class TreeDetailPage {

  treeId: number = 0;
  tree?: KnowledgeTree;
  cursos: Curso[] = [];
  cargando: boolean = true;
  errorMsg: string = '';

  courseProgress: { [id: string]: number } = {};
  progress: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learning: LearningService,
    private auth: Auth
  ) {}

  async ionViewWillEnter() {
    this.cargando = true;
    this.errorMsg = '';
    try {
      const paramId = this.route.snapshot.paramMap.get('id');
      if (!paramId) {
        this.errorMsg = 'No se recibió el ID del árbol.';
        return;
      }
      this.treeId = Number(paramId);

      // Obtener árbol y cursos
      this.tree = await this.learning.getKnowledgeTreeAsync(this.treeId);
      if (!this.tree) {
        this.errorMsg = 'Árbol no encontrado.';
        return;
      }

      this.cursos = await this.learning.getCoursesByTree(this.treeId);

      // 🔹 Obtener progreso del usuario actual desde Firestore
      const uid = this.auth.currentUser?.uid;
      let completedCourses: string[] = [];
      if (uid) {
        const user = await this.learning.getUserByUid(uid);
        if (user?.learningProgress?.[this.treeId.toString()]) {
          completedCourses = Array.from(new Set(
            user.learningProgress[this.treeId.toString()]
              .map(id => id?.toString())
              .filter(Boolean)
          ));
        }
      }

      // Inicializar courseProgress solo para cursos existentes
      this.courseProgress = {};
      this.cursos.forEach((c: Curso) => {
        const cid = c.id?.toString() || '';
        this.courseProgress[cid] = completedCourses.includes(cid) ? 1 : 0;
      });

      this.updateTreeProgress();

      // 🔹 Sincronizar localStorage
      const completadosLS: Record<string, number> = {};
      Object.keys(this.courseProgress).forEach(cid => {
        if (this.courseProgress[cid] === 1) completadosLS[cid] = 1;
      });
      localStorage.setItem('completedCourses', JSON.stringify(completadosLS));

    } catch (err) {
      console.error(err);
      this.errorMsg = 'Error cargando los datos del árbol.';
    } finally {
      this.cargando = false;
    }
  }

  openCourse(courseId?: string) {
    if (!courseId) return;
    this.router.navigate(['/course-detail', this.treeId, courseId]);
  }

  goToExam() {
    this.router.navigate(['/exam-tree', this.treeId]);
  }

  private updateTreeProgress() {
    if (!this.cursos || this.cursos.length === 0) {
      this.progress = 0;
      return;
    }
    const total = this.cursos.length;
    const completed = Object.values(this.courseProgress).reduce((acc, val) => acc + val, 0);
    this.progress = completed / total;
  }
}
