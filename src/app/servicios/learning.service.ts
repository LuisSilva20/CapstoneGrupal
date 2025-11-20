// src/app/servicios/learning.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where
} from '@angular/fire/firestore';

import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  KnowledgeTree,
  Curso,
  Leccion,
  PreguntaExamen,
  CursoGuardado,
  User,
  IntentoExamen
} from '../interfaces/interfaces';

import { getCoursesByTree as localGetCoursesByTree } from 'src/app/data/treesData';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  constructor(private firestore: Firestore) {}

  // ======================================================
  // 1) ÁRBOLES DE CONOCIMIENTO
  // ======================================================
  getKnowledgeTrees(): Observable<KnowledgeTree[]> {
    const ref = collection(this.firestore, 'cursos');
    return collectionData(ref, { idField: 'id' }).pipe(
      map((trees: any[]) =>
        (trees || []).map(t => ({
          id: t.id?.toString() ?? '',
          title: t.title ?? t.titulo ?? 'Árbol sin título',
          description: t.description ?? t.descripcion ?? 'Sin descripción',
          icon: t.icon ?? '🌳',
          phase: typeof t.phase === 'number' ? t.phase : parseInt(t.phase) || 0,
          progress: t.progress ?? 0,
          lessons: Array.isArray(t.lessons)
            ? t.lessons.map((l: any, idx: number) => ({
                id: l.id?.toString() ?? (idx + 1).toString(),
                title: l.title ?? l.titulo ?? `Lección ${idx + 1}`,
                content: l.content ?? l.htmlContent ?? '',
                duration: l.duration ?? l.duracion ?? '0',
                completed: false
              }))
            : []
        } as KnowledgeTree))
      )
    );
  }

  getKnowledgeTree(id: string): Observable<KnowledgeTree | undefined> {
    const ref = doc(this.firestore, `cursos/${id}`);
    return docData(ref, { idField: 'id' }).pipe(
      map((t: any) =>
        t
          ? ({
              id: t.id?.toString() ?? '',
              title: t.title ?? t.titulo ?? 'Árbol sin título',
              description: t.description ?? t.descripcion ?? 'Sin descripción',
              icon: t.icon ?? '🌳',
              phase: typeof t.phase === 'number' ? t.phase : parseInt(t.phase) || 0,
              progress: t.progress ?? 0,
              lessons: Array.isArray(t.lessons)
                ? t.lessons.map((l: any, idx: number) => ({
                    id: l.id?.toString() ?? (idx + 1).toString(),
                    title: l.title ?? l.titulo ?? `Lección ${idx + 1}`,
                    content: l.content ?? l.htmlContent ?? '',
                    duration: l.duration ?? l.duracion ?? '0',
                    completed: false
                  }))
                : []
            } as KnowledgeTree)
          : undefined
      )
    );
  }

  async getKnowledgeTreesAsync(): Promise<KnowledgeTree[]> {
    return firstValueFrom(this.getKnowledgeTrees());
  }

  async getKnowledgeTreeAsync(id: string): Promise<KnowledgeTree | undefined> {
    return firstValueFrom(this.getKnowledgeTree(id));
  }

  // ======================================================
  // 2) CURSOS POR ÁRBOL (local fallback)
  // ======================================================
  async getCoursesByTree(treeId: string): Promise<Curso[]> {
    return Promise.resolve(localGetCoursesByTree(treeId));
  }

  // ======================================================
  // 3) LECCIONES DE UN CURSO
  // ======================================================
  async getLessons(courseId: string): Promise<Leccion[]> {
    try {
      const ref = collection(this.firestore, 'lessonContent');
      const snapshot = await getDocs(ref);
      return snapshot.docs
        .filter(d => d.id.startsWith(courseId))
        .map((d, idx) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title || data.titulo || `Lección ${idx + 1}`,
            content: data.htmlContent || '',
            duration: data.duration || data.duracion || '',
            completed: false
          } as Leccion;
        });
    } catch (err) {
      console.error('Error obteniendo lecciones:', err);
      return [];
    }
  }

  // ======================================================
  // 4) PREGUNTAS DEL EXAMEN POR ÁRBOL
  // ======================================================
  getQuestionsByTree(treeId: string): Observable<PreguntaExamen[]> {
    if (!treeId) return new Observable<PreguntaExamen[]>(observer => { observer.next([]); observer.complete(); });
    const ref = collection(this.firestore, 'preguntas');
    const q = query(ref, where('treeId', '==', treeId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((pregs: any[]) =>
        (pregs || []).map(p => ({
          id: p.id,
          treeId: p.treeId?.toString() ?? '',
          question: p.question ?? p.questionText ?? '',
          options: p.options ?? p.opciones ?? [],
          correctAnswer: Number(p.correctAnswer ?? p.correctAnswerIndex ?? 0),
          explicacion: p.explanation ?? p.explicacion ?? ''
        }) as PreguntaExamen)
      )
    );
  }

  async getQuestionsByTreeAsync(treeId: string): Promise<PreguntaExamen[]> {
    return firstValueFrom(this.getQuestionsByTree(treeId));
  }

  // ======================================================
  // 5) CONTENIDO HTML DE UNA LECCIÓN
  // ======================================================
  async getLessonContent(id: string): Promise<string> {
    try {
      const ref = doc(this.firestore, `lessonContent/${id}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return '';
      return (snap.data() as any).htmlContent ?? '';
    } catch (err) {
      console.error('Error getLessonContent:', err);
      return '';
    }
  }

  // ======================================================
  // 6) EXAMEN ALEATORIO
  // ======================================================
  async getRandomExamQuestions(totalPreguntas: number = 35): Promise<PreguntaExamen[]> {
    try {
      const trees = await this.getKnowledgeTreesAsync();
      const treeIds = trees.map(t => t.id.toString());
      let selected: PreguntaExamen[] = [];
      for (const treeId of treeIds) {
        const preguntas = await this.getQuestionsByTreeAsync(treeId);
        selected.push(...preguntas.sort(() => Math.random() - 0.5).slice(0, 3));
      }
      const faltantes = totalPreguntas - selected.length;
      if (faltantes > 0) {
        const arrays = await Promise.all(treeIds.map(id => this.getQuestionsByTreeAsync(id)));
        const todas = ([] as PreguntaExamen[]).concat(...arrays);
        const usadas = new Set(selected.map(p => p.id.toString()));
        const disponibles = todas.filter(p => !usadas.has(p.id.toString()));
        selected.push(...disponibles.sort(() => Math.random() - 0.5).slice(0, faltantes));
      }
      return selected.sort(() => Math.random() - 0.5);
    } catch (e) {
      console.error('Error generando examen:', e);
      return [];
    }
  }

 async saveCourseProgress(userId: string, curso: CursoGuardado, treeId?: string): Promise<void> {
  try {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    const learningProgress = { ...(userData.learningProgress || {}) };

    // Determinar treeId
    let tId = treeId || curso.arbol || 'tree-unknown';
    if (!tId.startsWith('tree-')) tId = `tree-${tId}`;

    // IDs existentes para este árbol (solo strings válidos)
    const existing = Array.isArray(learningProgress[tId])
      ? learningProgress[tId].map(String).filter(id => !!id)
      : [];

    // IDs nuevas lecciones/cursos completadas
    const newCompleted = Array.isArray(curso.lessons)
      ? curso.lessons.map((l: any) => l.id?.toString()).filter(id => !!id)
      : [curso.id?.toString()].filter(id => !!id);

    // Mantener solo IDs únicos y válidos
    const merged = Array.from(new Set([...existing, ...newCompleted]));

    learningProgress[tId] = merged;

    await updateDoc(userRef, { learningProgress });

    console.log(`✅ Progreso guardado para ${tId}:`, learningProgress[tId]);

  } catch (err) {
    console.error(`❌ Error guardando progreso usuario ${userId}:`, err);
  }
}



  // ======================================================
  // 8) HELPERS PARA PERFIL
  // ======================================================
  async getUserByUid(uid: string): Promise<User | null> {
    try {
      const ref = doc(this.firestore, `users/${uid}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { ...(snap.data() as User), id: uid } as User;
    } catch (err) {
      console.error('Error getUserByUid:', err);
      return null;
    }
  }

  async getUserIntentosByUid(uid: string): Promise<IntentoExamen[]> {
    try {
      const ref = collection(this.firestore, 'resultados');
      const q = query(ref, where('usuarioId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as IntentoExamen));
    } catch (err) {
      console.error('Error getUserIntentosByUid:', err);
      return [];
    }
  }

  async getUserSavedCourses(uid: string): Promise<CursoGuardado[]> {
    try {
      const u = await this.getUserByUid(uid);
      if (!u) return [];
      const saved = (u as any).savedCourses;
      if (!Array.isArray(saved)) return [];
      return saved as CursoGuardado[];
    } catch (err) {
      console.error('Error getUserSavedCourses:', err);
      return [];
    }
  }
}
