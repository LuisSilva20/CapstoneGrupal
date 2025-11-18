import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonMenuButton, IonButtons, IonProgressBar, IonButton, IonSpinner
} from '@ionic/angular/standalone';

import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MenuController } from '@ionic/angular';

import { KnowledgeTree, Curso } from '../../interfaces/interfaces';
import { LearningService } from '../../servicios/learning.service';

@Component({
  selector: 'app-tree-detail',
  standalone: true,
  templateUrl: './tree-detail.page.html',
  styleUrls: ['./tree-detail.page.scss'],
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonButtons, IonMenuButton,
    IonProgressBar, IonButton, IonSpinner
  ]
})
export class TreeDetailPage implements OnInit {

  treeId = '';
  tree?: KnowledgeTree;
  cursos: Curso[] = [];
  cargando = true;
  errorMsg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuCtrl: MenuController,
    private learning: LearningService
  ) {}

  async ngOnInit() {
    try {
      // Obtener ID del árbol
      this.treeId = this.route.snapshot.paramMap.get('id') || '';
      if (!this.treeId) {
        this.errorMsg = 'No se recibió el ID del árbol.';
        this.cargando = false;
        return;
      }

      // 1️⃣ Cargar árbol usando async/await
      this.tree = await this.learning.getKnowledgeTreeAsync(this.treeId);
      if (!this.tree) {
        this.errorMsg = 'Árbol no encontrado.';
        this.cargando = false;
        return;
      }

      // 2️⃣ Cargar cursos del árbol
      this.cursos = await this.learning.getCoursesByTree(this.treeId);

    } catch (err) {
      console.error(err);
      this.errorMsg = 'Error cargando los datos del árbol.';
    } finally {
      this.cargando = false;
    }
  }

  openCourse(courseId: string | number) {
    this.router.navigate(['/course-detail', this.treeId, courseId]);
  }

  goToExam() {
    this.router.navigate(['/exam-tree', this.treeId]);
  }

}
