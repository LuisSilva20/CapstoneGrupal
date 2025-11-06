import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Curso } from '../../interfaces/interfaces';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBackButton, IonButtons
  ]
})
export class CourseDetailPage {
  curso?: Curso;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = idParam;

    try {
      const cursoRef = doc(this.firestore, `lessonContent/${id}`);
      const cursoSnap = await getDoc(cursoRef);

      if (cursoSnap.exists()) {
        this.curso = cursoSnap.data() as Curso;
      } else {
        console.warn('Curso no encontrado en la base de datos');
      }
    } catch (err) {
      console.error('Error al cargar curso:', err);
    }
  }
}
