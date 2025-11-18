import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonSpinner
} from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';

import { Curso, Leccion } from '../../interfaces/interfaces';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  imports: [
    IonSpinner,
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButtons, IonBackButton
  ]
})
export class CourseDetailPage implements OnInit {

  treeId!: string;
  courseId!: string;

  curso: Curso | null = null;
  lessons: Leccion[] = [];
  cargando = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.treeId = this.route.snapshot.paramMap.get('treeId') ?? '';
    this.courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

    if (!this.treeId || !this.courseId) {
      this.errorMsg = 'Datos insuficientes para cargar el curso.';
      this.cargando = false;
      return;
    }

    try {
      // 1) Intento principal: lessonContent/{courseId}
      const ref = doc(this.firestore, `lessonContent/${this.courseId}`);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        this.curso = this.normalizeCourse({ id: snap.id, ...snap.data() });
      } else {
        // 2) Alternativa: knowledgeTrees/{treeId}/courses/{courseId}
        const altRef = doc(this.firestore, `knowledgeTrees/${this.treeId}/courses/${this.courseId}`);
        const altSnap = await getDoc(altRef);

        if (!altSnap.exists()) {
          this.errorMsg = 'Curso no encontrado.';
          return;
        }

        this.curso = this.normalizeCourse({ id: altSnap.id, ...altSnap.data() });
      }

      // 3) Lecciones
      if (this.curso?.lessons) {
        this.lessons = this.curso.lessons.map(l => this.normalizeLesson(l));
      } else {
        const lessonsRef = collection(this.firestore, `knowledgeTrees/${this.treeId}/courses/${this.courseId}/lessons`);
        const lessonsSnap = await getDocs(lessonsRef);
        this.lessons = lessonsSnap.docs.map(d =>
          this.normalizeLesson({ id: d.id, ...(d.data() as any) })
        );
      }

    } catch (err) {
      console.error(err);
      this.errorMsg = 'Error cargando curso.';
    } finally {
      this.cargando = false;
    }
  }

  private normalizeCourse(raw: any): Curso {
    const c: any = { ...(raw || {}) };

    // Normalizar nombre del campo
    c.title = c.title || c.titulo || '';
    c.description = c.description || c.descripcion || '';
    c.duration = c.duration || c.duracion || '';

    c.id = c.id?.toString?.() ?? '';

    return c as Curso;
  }

  private normalizeLesson(raw: any): Leccion {
    const l: any = { ...(raw || {}) };

    l.title = l.title || l.titulo || '';
    l.content = l.content || l.contenido || l.htmlContent || '';
    l.duration = l.duration || l.duracion || '';

    l.id = l.id?.toString?.() ?? '';

    return l as Leccion;
  }
}
