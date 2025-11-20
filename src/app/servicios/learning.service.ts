import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  CollectionReference,
  addDoc,
  DocumentReference
} from '@angular/fire/firestore';
import { collectionData, docData } from '@angular/fire/firestore';
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

@Injectable({ providedIn: 'root' })
export class LearningService {
  constructor(private firestore: Firestore) {}

  // ================================
  // 1) ÁRBOLES DE CONOCIMIENTO
  // ================================
  getKnowledgeTrees(): Observable<KnowledgeTree[]> {
    const ref = collection(this.firestore, 'cursos') as CollectionReference;
    return collectionData(ref, { idField: 'id' }).pipe(
      map((trees: any[]) =>
        (trees || []).map(t => ({
          id: Number(t.id ?? 0),
          title: t.title ?? t.titulo ?? 'Árbol sin título',
          description: t.description ?? t.descripcion ?? 'Sin descripción',
          icon: t.icon ?? '🌳',
          phase: Number(t.phase ?? 0),
          progress: t.progress ?? 0,
          lessons: Array.isArray(t.lessons)
            ? t.lessons.map((l: any, idx: number) => ({
                id: Number(l.id ?? idx + 1),
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

  getKnowledgeTree(id: number): Observable<KnowledgeTree | undefined> {
    const ref = doc(this.firestore, `cursos/${id}`) as DocumentReference;
    return docData(ref, { idField: 'id' }).pipe(
      map((t: any) =>
        t
          ? ({
              id: Number(t.id ?? 0),
              title: t.title ?? t.titulo ?? 'Árbol sin título',
              description: t.description ?? t.descripcion ?? 'Sin descripción',
              icon: t.icon ?? '🌳',
              phase: Number(t.phase ?? 0),
              progress: t.progress ?? 0,
              lessons: Array.isArray(t.lessons)
                ? t.lessons.map((l: any, idx: number) => ({
                    id: Number(l.id ?? idx + 1),
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

  async getKnowledgeTreeAsync(id: number): Promise<KnowledgeTree | undefined> {
    return firstValueFrom(this.getKnowledgeTree(id));
  }

  // ================================
  // 2) CURSOS POR ÁRBOL (local fallback)
  // ================================
  async getCoursesByTree(treeId: number): Promise<Curso[]> {
    return Promise.resolve(localGetCoursesByTree(treeId.toString()));
  }

  // ================================
  // 3) LECCIONES DE UN CURSO
  // ================================
  async getLessons(courseId: string): Promise<Leccion[]> {
    try {
      const ref = collection(this.firestore, 'lessonContent') as CollectionReference;
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

  // ================================
  // 4) PREGUNTAS DEL EXAMEN POR ÁRBOL
  // ================================
  async getQuestionsByTreeSafe(treeId: number, limit: number = 15): Promise<PreguntaExamen[]> {
    try {
      const ref = collection(this.firestore, 'preguntas') as CollectionReference;
      const q = query(ref, where('treeId', '==', treeId));
      const snap = await getDocs(q);
      if (snap.empty) return [];
      const preguntas: PreguntaExamen[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id.toString(),
          treeId: Number(data.treeId ?? treeId),
          question: data.question ?? '',
          options: Array.isArray(data.options) ? data.options : [],
          correctAnswer: Number(data.correctAnswer ?? 0),
          explicacion: data.explanation ?? data.explicacion ?? ''
        } as PreguntaExamen;
      });
      // Aleatorizar y limitar
      return preguntas.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (err) {
      console.error('Error cargando preguntas safe:', err);
      return [];
    }
  }

  async getQuestionsByTreeAsync(treeId: number, limit: number = 15): Promise<PreguntaExamen[]> {
    return this.getQuestionsByTreeSafe(treeId, limit);
  }

  // ================================
  // 5) EXAMEN ALEATORIO GENERAL
  // ================================
  async getRandomExamQuestions(totalPreguntas: number = 35): Promise<PreguntaExamen[]> {
    try {
      const trees = await this.getKnowledgeTreesAsync();
      const treeIds = trees.map(t => Number(t.id));
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

  // ================================
  // 6) GUARDAR RESPUESTAS DEL EXAMEN EN EXAM HISTORY
  // ================================
  async saveExamAttemptInHistory(
    uid: string,
    treeId: number | string,
    respuestas: { idPregunta: string | number; seleccion: number; correcta: number }[]
  ): Promise<void> {
    try {
      const ref = collection(this.firestore, `users/${uid}/examHistory`);
      const intento = {
        treeId: treeId.toString(),
        preguntas: respuestas.map(r => ({
          idPregunta: r.idPregunta.toString(),
          seleccion: r.seleccion,
          correcta: r.correcta
        })),
        fecha: new Date().toISOString(),
        puntaje: respuestas.filter(r => r.seleccion === r.correcta).length
      };
      await addDoc(ref, intento);
      console.log('✅ Intento guardado en examHistory');
    } catch (err) {
      console.error('❌ Error guardando intento en examHistory:', err);
    }
  }

  // ================================
  // 7) HELPERS PARA PERFIL
  // ================================
  async getUserByUid(uid: string): Promise<User | null> {
    try {
      const ref = doc(this.firestore, `users/${uid}`) as DocumentReference;
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
      const ref = collection(this.firestore, `users/${uid}/examHistory`) as CollectionReference;
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as IntentoExamen));
    } catch (err) {
      console.error('Error getUserIntentosByUid:', err);
      return [];
    }
  }

  // ================================
  // 8) GUARDAR PROGRESO DE CURSOS
  // ================================
  async saveCourseProgress(userId: string, curso: CursoGuardado, treeId?: number): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`) as DocumentReference;
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data() as User;
      const learningProgress = { ...(userData.learningProgress || {}) };
      const tId = treeId?.toString() || curso.arbol?.toString() || 'tree-unknown';

      const existing: string[] = Array.isArray(learningProgress[tId])
        ? learningProgress[tId].map(id => id.toString()).filter(Boolean)
        : [];

      const newCompleted: string[] = Array.isArray(curso.lessons) && curso.lessons.length > 0
        ? curso.lessons.map(l => l.titulo).filter(Boolean)
        : [curso.title].filter(Boolean);

      learningProgress[tId] = Array.from(new Set([...existing, ...newCompleted])) as any;
      await updateDoc(userRef, { learningProgress });
      console.log(`✅ Progreso guardado para ${tId}:`, learningProgress[tId]);
    } catch (err) {
      console.error(`❌ Error guardando progreso para el usuario ${userId}:`, err);
    }
  }


}
