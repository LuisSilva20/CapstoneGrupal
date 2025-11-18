import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonButtons, IonMenuButton, IonSpinner, IonButton
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { LearningService } from '../../servicios/learning.service';
import { KnowledgeTree } from '../../interfaces/interfaces';

@Component({
  selector: 'app-trees',
  standalone: true,
  templateUrl: './trees.page.html',
  styleUrls: ['./trees.page.scss'],
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonButtons, IonMenuButton,
    IonSpinner, IonButton
  ]
})
export class TreesPage implements OnInit {

  trees: KnowledgeTree[] = [];
  cargando = true;
  errorMsg = '';

  constructor(
    private learning: LearningService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarArboles();
  }

  async cargarArboles() {
    this.cargando = true;
    this.errorMsg = '';
    try {
      const data = await this.learning.getKnowledgeTreesAsync();
      this.trees = data;

      if (this.trees.length === 0) {
        this.errorMsg = 'No se encontraron árboles de conocimiento.';
      }

    } catch (err) {
      console.error('Error cargando árboles:', err);
      this.errorMsg = 'Error al cargar los árboles.';
    } finally {
      this.cargando = false;
    }
  }

  abrirArbol(treeId: string) {
    this.router.navigate(['/tree-detail', treeId]);
  }

}
