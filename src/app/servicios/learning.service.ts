import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { KnowledgeTree, Curso, Leccion, PreguntaExamen } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LearningService {

  constructor(private firestore: Firestore) {}

  // ======================================================
  // 1️⃣ ÁRBOLES DE CONOCIMIENTO (Observable)
  // ======================================================
  getKnowledgeTrees(): Observable<KnowledgeTree[]> {
    const ref = collection(this.firestore, 'courses');
    return collectionData(ref, { idField: 'id' }).pipe(
      map((trees: any[]) =>
        trees.map(t => ({
          id: t.id,
          title: t.title ?? t.titulo ?? '',
          description: t.description ?? t.descripcion ?? '',
          icon: t.icon ?? '',
          progress: t.progress ?? 0,
          phase: t.phase ?? 0
        } as KnowledgeTree))
      )
    );
  }

  getKnowledgeTree(id: string): Observable<KnowledgeTree | undefined> {
    const ref = doc(this.firestore, `courses/${id}`);
    return docData(ref, { idField: 'id' }).pipe(
      map((t: any) => t ? {
        id: t.id,
        title: t.title ?? t.titulo ?? '',
        description: t.description ?? t.descripcion ?? '',
        icon: t.icon ?? '',
        progress: t.progress ?? 0,
        phase: t.phase ?? 0
      } : undefined)
    );
  }

  // ======================================================
  // 1️⃣a Métodos helper async/await
  // ======================================================
  async getKnowledgeTreesAsync(): Promise<KnowledgeTree[]> {
    return firstValueFrom(this.getKnowledgeTrees());
  }

  async getKnowledgeTreeAsync(id: string): Promise<KnowledgeTree | undefined> {
    return firstValueFrom(this.getKnowledgeTree(id));
  }

  // ======================================================
  // 2️⃣ CURSOS POR ÁRBOL
  // ======================================================
  async getCoursesByTree(treeId: string): Promise<Curso[]> {
    const ref = collection(this.firestore, 'lessonContent');
    const q = query(ref, where('arbolId', '==', treeId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title ?? data.titulo ?? '',
        description: data.description ?? data.descripcion ?? '',
        duration: data.duration ?? data.duracion ?? '0',
        lessons: [
          {
            id: d.id,
            title: data.title ?? data.titulo ?? '',
            content: data.htmlContent ?? '',
            duration: data.duration ?? data.duracion ?? '',
            completed: data.completed ?? false
          }
        ] as Leccion[],
        arbolId: treeId,
        phase: data.phase ?? '0'
      } as Curso;
    });
  }

  // ======================================================
  // 3️⃣ LECCIONES DE UN CURSO
  // ======================================================
  async getLessons(courseId: string): Promise<Leccion[]> {
    const ref = doc(this.firestore, `lessonContent/${courseId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];

    const data = snap.data() as any;
    return [
      {
        id: snap.id,
        title: data.title ?? data.titulo ?? '',
        content: data.htmlContent ?? '',
        duration: data.duration ?? data.duracion ?? '',
        completed: data.completed ?? false
      }
    ];
  }

  // ======================================================
  // 4️⃣ PREGUNTAS DEL EXAMEN POR ÁRBOL
  // ======================================================
  getQuestionsByTree(treeId: string): Observable<PreguntaExamen[]> {
    const ref = collection(this.firestore, 'preguntas');
    return collectionData(ref, { idField: 'id' }).pipe(
      map((pregs: any[]) =>
        pregs
          .filter(p => p.treeId?.toString() === treeId.toString())
          .map(p => ({
            id: p.id,
            treeId: p.treeId,
            question: p.question,
            options: p.options,
            correctAnswer: p.correctAnswer,
            explicacion: p.explanation ?? p.explicacion ?? ''
          } as PreguntaExamen))
      )
    );
  }

  // ======================================================
  // 5️⃣ CONTENIDO HTML DE UNA LECCIÓN
  // ======================================================
  async getLessonContent(id: string): Promise<string> {
    const ref = doc(this.firestore, `lessonContent/${id}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return '';
    const data = snap.data() as any;
    return data.htmlContent ?? '';
  }

}
